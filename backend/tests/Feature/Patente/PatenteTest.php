<?php

namespace Tests\Feature\Patente;

use App\Domains\Access\Services\AccessSynchronizer;
use App\Domains\Ai\Contracts\LlmClient;
use App\Domains\Ai\Models\KnowledgeChunk;
use App\Domains\Ai\Services\KnowledgeIndexer;
use App\Domains\Patente\Models\PatenteExam;
use App\Domains\Patente\Models\PatenteExamAnswer;
use App\Domains\Patente\Models\PatenteQuestion;
use App\Domains\Patente\Models\PatenteTopic;
use App\Enums\ContentStatus;
use App\Enums\SourceType;
use App\Exceptions\ApiException;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PatenteTest extends TestCase
{
    use RefreshDatabase;

    private int $n = 0;

    protected function setUp(): void
    {
        parent::setUp();
        app(AccessSynchronizer::class)->sync();
        config(['patente.exam.questions' => 4, 'patente.exam.max_errors' => 1, 'patente.exam.minutes' => 20]);
    }

    private function user(): User
    {
        $u = User::factory()->create();
        $this->actingAs($u, 'sanctum');

        return $u;
    }

    private function staff(string $role): User
    {
        $u = User::factory()->create();
        $u->syncRoleKeys([$role]);
        $this->actingAs($u, 'sanctum');

        return $u;
    }

    private function topic(string $slug = 'segnali', bool $publish = true): PatenteTopic
    {
        $t = new PatenteTopic(['slug' => $slug, 'source_name' => 'Codice della Strada', 'source_url' => 'https://www.mit.gov.it/test', 'source_type' => SourceType::Official, 'last_verified_at' => now()->subDays(3)]);
        $t->save();
        $t->setTranslations([
            'ar' => ['title' => 'الإشارات', 'summary' => 'ملخص الإشارات', 'body' => 'نص نظري عن إشارات المرور'],
            'it' => ['title' => 'Segnali', 'summary' => 'Sintesi', 'body' => 'Testo teorico sui segnali stradali'],
        ]);
        if ($publish) {
            $t->forceFill(['status' => 'published'])->save();
        }

        return $t->fresh();
    }

    private function question(PatenteTopic $t, bool $isTrue, bool $publish = true): PatenteQuestion
    {
        $q = new PatenteQuestion(['slug' => 'q-'.++$this->n, 'patente_topic_id' => $t->id, 'is_true' => $isTrue,
            'rights_note' => 'TEST: original wording written for EXPA tests', 'source_name' => 'Test', 'source_url' => 'https://www.mit.gov.it/q', 'source_type' => SourceType::Official, 'last_verified_at' => now()->subDay()]);
        $q->save();
        $q->setTranslations([
            'it' => ['statement' => "Affermazione italiana {$this->n}", 'explanation' => "Spiegazione {$this->n}"],
            'ar' => ['statement' => "عبارة عربية {$this->n}", 'explanation' => "شرح {$this->n}"],
            'en' => ['statement' => "English statement {$this->n}"],
        ]);
        if ($publish) {
            $q->forceFill(['status' => 'published'])->save();
        }

        return $q->fresh();
    }

    /** @return array{0:PatenteTopic,1:list<PatenteQuestion>} four published questions: T, F, T, F */
    private function bank(): array
    {
        $t = $this->topic();

        return [$t, [$this->question($t, true), $this->question($t, false), $this->question($t, true), $this->question($t, false)]];
    }

    private function startExam(string $lang = 'en')
    {
        return $this->postJson('/api/v1/patente/exams', ['mode' => 'exam'], ['Accept-Language' => $lang]);
    }

    private function answersFor(array $payloadQuestions, array $bank, array $wrongIds = [], array $skipIds = []): array
    {
        $truth = collect($bank)->mapWithKeys(fn ($q) => [$q->id => $q->is_true]);

        return collect($payloadQuestions)->reject(fn ($q) => in_array($q['id'], $skipIds))->map(fn ($q) => [
            'question_id' => $q['id'], 'answer' => in_array($q['id'], $wrongIds) ? ! $truth[$q['id']] : $truth[$q['id']],
        ])->values()->all();
    }

    // ---- public content & rights --------------------------------------------------------------

    public function test_only_published_topics_are_public_and_questions_are_never_listed(): void
    {
        [$t] = $this->bank();
        $this->topic('draft-topic', publish: false);

        $res = $this->getJson('/api/v1/patente/topics', ['Accept-Language' => 'ar'])->assertOk();
        $this->assertCount(1, $res->json('data'));
        $res->assertJsonPath('data.0.title', 'الإشارات')->assertJsonPath('data.0.question_count', 4)->assertJsonPath('data.0.source.freshness', 'fresh');
        $this->getJson('/api/v1/patente/topics/segnali')->assertOk()->assertJsonPath('data.body', 'نص نظري عن إشارات المرور');
        $this->getJson('/api/v1/patente/topics/draft-topic')->assertNotFound();
        // there is deliberately no endpoint that dumps the question bank
        foreach (['patente/questions', 'patente/questions/1', "patente/topics/{$t->slug}/questions"] as $uri) {
            $this->getJson("/api/v1/$uri")->assertNotFound();
        }
    }

    public function test_question_cannot_be_published_without_rights_note_both_languages_and_source(): void
    {
        $t = $this->topic();
        $q = $this->question($t, true, publish: false);
        $q->forceFill(['rights_note' => '  ', 'status' => 'approved'])->save();

        $problems = fn () => $this->tryPublish($q->fresh());
        $this->assertContains(['code' => 'missing_rights_note', 'field' => 'rights_note'], $problems());

        $q->forceFill(['rights_note' => 'Licensed from X, contract 123'])->save();
        $q->translations()->where('locale', 'it')->delete();
        $this->assertContains(['code' => 'missing_translation', 'locale' => 'it'], $this->tryPublish($q->fresh()));

        $q->setTranslations(['it' => ['statement' => 'Italiano']]);
        $q->forceFill(['source_url' => null])->save();
        $this->assertContains(['code' => 'missing_source_field', 'field' => 'source_url'], $this->tryPublish($q->fresh()));
    }

    private function tryPublish($item): array
    {
        try {
            $item->transitionTo(ContentStatus::Published);

            return [];
        } catch (ApiException $e) {
            return $e->details['problems'] ?? [];
        }
    }

    public function test_admin_workflow_requires_rights_note_on_create_and_hides_nothing_from_staff(): void
    {
        $t = $this->topic();
        $this->staff('editor');
        $base = ['slug' => 'nuova', 'patente_topic_id' => $t->id, 'is_true' => true, 'source_name' => 'S', 'source_url' => 'https://www.mit.gov.it/x', 'source_type' => 'official',
            'last_verified_at' => now()->toDateString(), 'translations' => ['it' => ['statement' => 'Domanda'], 'ar' => ['statement' => 'سؤال']]];

        $this->postJson('/api/v1/admin/patente/questions', $base)->assertStatus(422)->assertJsonStructure(['error' => ['details' => ['rights_note']]]);
        $this->postJson('/api/v1/admin/patente/questions', $base + ['rights_note' => 'x'])->assertStatus(422);
        $this->postJson('/api/v1/admin/patente/questions', ['is_true' => 'maybe', 'rights_note' => 'Original text by EXPA'] + $base)->assertStatus(422);
        $res = $this->postJson('/api/v1/admin/patente/questions', $base + ['rights_note' => 'Original text by EXPA team'])->assertCreated();
        $res->assertJsonPath('data.is_true', true)->assertJsonPath('data.rights_note', 'Original text by EXPA team')->assertJsonPath('data.status', 'draft');

        $this->getJson('/api/v1/admin/patente/questions?filter[topic_id]='.$t->id)->assertJsonPath('meta.total', 1);
        $this->as('user');
        $this->getJson('/api/v1/admin/patente/questions')->assertForbidden();
    }

    private function as(string $role): void
    {
        $this->staff($role);
    }

    public function test_admin_cannot_post_status_or_bypass_review_for_questions(): void
    {
        $t = $this->topic();
        $this->staff('editor');
        $id = $this->postJson('/api/v1/admin/patente/questions', ['slug' => 'z', 'patente_topic_id' => $t->id, 'is_true' => false, 'rights_note' => 'Original EXPA text',
            'status' => 'published', 'translations' => ['it' => ['statement' => 'D'], 'ar' => ['statement' => 'س']]])->assertCreated()->assertJsonPath('data.status', 'draft')->json('data.id');
        $this->postJson("/api/v1/admin/patente/questions/$id/transition", ['to' => 'published'])->assertStatus(403);
    }

    // ---- starting exams -----------------------------------------------------------------------

    public function test_requires_authentication(): void
    {
        foreach ([['post', 'patente/exams'], ['get', 'patente/exams'], ['get', 'patente/exams/1'], ['post', 'patente/exams/1/answers'], ['get', 'patente/progress']] as [$m, $u]) {
            $this->json($m, "/api/v1/$u")->assertUnauthorized();
        }
        $this->getJson('/api/v1/patente/rules')->assertOk()->assertJsonPath('data.questions', 4);
    }

    public function test_exam_payload_never_leaks_answers_and_carries_the_italian_original(): void
    {
        $this->bank();
        $this->user();
        $res = $this->startExam('ar')->assertCreated();

        $res->assertJsonPath('data.mode', 'exam')->assertJsonPath('data.max_errors', 1)->assertJsonCount(4, 'data.questions');
        $this->assertNotNull($res->json('data.deadline_at'));
        $q = $res->json('data.questions.0');
        $this->assertMatchesRegularExpression('/\p{Arabic}/u', $q['statement']);
        $this->assertStringStartsWith('Affermazione italiana', $q['statement_it']);

        $blob = $res->getContent();
        foreach (['is_true', 'correct_answer', 'explanation', 'rights_note', 'شرح', 'Spiegazione'] as $leak) {
            $this->assertStringNotContainsString($leak, $blob);
        }
        // and again when re-fetching the unfinished exam
        $again = $this->getJson('/api/v1/patente/exams/'.$res->json('data.id'))->assertOk();
        $this->assertStringNotContainsString('correct_answer', $again->getContent());
        $again->assertJsonPath('data.finished', false);
    }

    public function test_a_full_size_exam_is_required_never_a_shrunk_one(): void
    {
        $t = $this->topic();
        $this->question($t, true);
        $this->question($t, false);
        $this->user();

        $this->startExam()->assertStatus(422)->assertJsonPath('error.code', 'not_enough_questions')
            ->assertJsonPath('error.details.available.0', '2')->assertJsonPath('error.details.required.0', '4');
        $this->assertSame(0, PatenteExam::count());
    }

    public function test_drafts_and_questions_of_unpublished_topics_are_never_used(): void
    {
        $t = $this->topic();
        $draftTopic = $this->topic('hidden', publish: false);
        foreach ([true, false, true, false] as $v) {
            $this->question($t, $v);
        }
        $this->question($t, true, publish: false);
        $this->question($draftTopic, true);
        $this->user();

        $ids = collect($this->startExam()->json('data.questions'))->pluck('id');
        $this->assertCount(4, $ids);
        $this->assertSame(4, PatenteQuestion::published()->whereIn('id', $ids)->where('patente_topic_id', $t->id)->count());
    }

    public function test_practice_mode_by_topic_has_no_deadline_and_no_pass_fail(): void
    {
        $this->bank();
        $other = $this->topic('precedenza');
        $this->question($other, true);
        $this->user();

        $res = $this->postJson('/api/v1/patente/exams', ['mode' => 'practice', 'topics' => ['precedenza']])->assertCreated();
        $res->assertJsonPath('data.deadline_at', null)->assertJsonPath('data.max_errors', null)->assertJsonCount(1, 'data.questions');

        $this->postJson('/api/v1/patente/exams', ['mode' => 'practice', 'topics' => ['segnali'], 'size' => 2])->assertCreated()->assertJsonCount(2, 'data.questions');
    }

    public function test_start_validation(): void
    {
        $this->bank();
        $this->user();
        $this->postJson('/api/v1/patente/exams', [])->assertStatus(422);
        $this->postJson('/api/v1/patente/exams', ['mode' => 'cheat'])->assertStatus(422);
        $this->postJson('/api/v1/patente/exams', ['mode' => 'practice'])->assertStatus(422);
        $this->postJson('/api/v1/patente/exams', ['mode' => 'practice', 'topics' => ['nope']])->assertStatus(422);
        $this->postJson('/api/v1/patente/exams', ['mode' => 'practice', 'topics' => ['segnali'], 'size' => 999])->assertStatus(422);
        $this->postJson('/api/v1/patente/exams', ['mode' => 'practice', 'topics' => ['segnali'], 'size' => 0])->assertStatus(422);
    }

    public function test_starting_exams_is_rate_limited(): void
    {
        $this->bank();
        $this->user();
        for ($i = 0; $i < 20; $i++) {
            $this->startExam()->assertCreated();
        }
        $this->startExam()->assertStatus(429);
    }

    // ---- grading ------------------------------------------------------------------------------

    public function test_perfect_and_within_error_budget_pass_over_budget_fails(): void
    {
        [, $bank] = $this->bank();
        $this->user();

        $run = function (array $wrong, array $skip = []) use ($bank) {
            $exam = $this->startExam()->json('data');

            return $this->postJson("/api/v1/patente/exams/{$exam['id']}/answers", ['answers' => $this->answersFor($exam['questions'], $bank, $wrong, $skip)])->assertOk()->json('data');
        };
        $ids = collect($bank)->pluck('id')->all();

        $perfect = $run([]);
        $this->assertSame([4, 0, true], [$perfect['correct'], $perfect['errors'], $perfect['passed']]);

        $oneWrong = $run([$ids[0]]);
        $this->assertSame([3, 1, true], [$oneWrong['correct'], $oneWrong['errors'], $oneWrong['passed']]); // 1 error allowed

        $twoWrong = $run([$ids[0], $ids[1]]);
        $this->assertSame([2, 2, false], [$twoWrong['correct'], $twoWrong['errors'], $twoWrong['passed']]);

        $skipped = $run([$ids[0]], [$ids[1]]); // one wrong + one unanswered = 2 errors
        $this->assertSame([2, 2, false], [$skipped['correct'], $skipped['errors'], $skipped['passed']]);
        $this->assertNull(collect($skipped['review'])->firstWhere('question_id', $ids[1])['your_answer']);
    }

    public function test_review_reveals_answers_and_explanations_only_after_submission(): void
    {
        [, $bank] = $this->bank();
        $this->user();
        $exam = $this->startExam('it')->json('data');
        $res = $this->postJson("/api/v1/patente/exams/{$exam['id']}/answers", ['answers' => $this->answersFor($exam['questions'], $bank, [$bank[0]->id])], ['Accept-Language' => 'it'])->assertOk();

        $review = collect($res->json('data.review'))->keyBy('question_id');
        $this->assertTrue($review[$bank[0]->id]['correct_answer']);
        $this->assertFalse($review[$bank[0]->id]['your_answer']);
        $this->assertFalse($review[$bank[0]->id]['correct']);
        $this->assertTrue($review[$bank[2]->id]['correct']);
        $this->assertStringStartsWith('Spiegazione', $review[$bank[0]->id]['explanation']);

        $this->getJson("/api/v1/patente/exams/{$exam['id']}")->assertJsonPath('data.finished', true)->assertJsonCount(4, 'data.review');
    }

    public function test_late_submission_fails_even_when_perfect_but_within_grace_is_fine(): void
    {
        [, $bank] = $this->bank();
        $this->user();

        $exam = $this->startExam()->json('data');
        $this->travel(20)->minutes();
        $this->travel(20)->seconds(); // inside the 30 s grace
        $ok = $this->postJson("/api/v1/patente/exams/{$exam['id']}/answers", ['answers' => $this->answersFor($exam['questions'], $bank)])->json('data');
        $this->assertTrue($ok['passed']);

        $this->travelBack();
        $exam = $this->startExam()->json('data');
        $this->travel(25)->minutes();
        $late = $this->postJson("/api/v1/patente/exams/{$exam['id']}/answers", ['answers' => $this->answersFor($exam['questions'], $bank)])->json('data');
        $this->assertSame([4, 0, false, true], [$late['correct'], $late['errors'], $late['passed'], $late['timed_out']]);
    }

    public function test_practice_results_have_no_pass_verdict(): void
    {
        [, $bank] = $this->bank();
        $this->user();
        $exam = $this->postJson('/api/v1/patente/exams', ['mode' => 'practice', 'topics' => ['segnali'], 'size' => 4])->json('data');
        $res = $this->postJson("/api/v1/patente/exams/{$exam['id']}/answers", ['answers' => $this->answersFor($exam['questions'], $bank, [$bank[0]->id, $bank[1]->id, $bank[2]->id])])->assertOk();
        $this->assertNull($res->json('data.passed'));
        $this->assertSame(3, $res->json('data.errors'));
    }

    public function test_an_exam_can_only_be_submitted_once_and_only_with_its_own_questions(): void
    {
        [$t, $bank] = $this->bank();
        $foreign = $this->question($t, true, publish: false); // never selectable, so never part of the exam
        $this->user();
        $exam = $this->startExam()->json('data');

        $this->postJson("/api/v1/patente/exams/{$exam['id']}/answers", ['answers' => [['question_id' => $foreign->id, 'answer' => true]]])
            ->assertStatus(422)->assertJsonPath('error.code', 'validation_failed');
        $this->assertNull(PatenteExam::find($exam['id'])->finished_at);

        $this->postJson("/api/v1/patente/exams/{$exam['id']}/answers", ['answers' => $this->answersFor($exam['questions'], $bank)])->assertOk();
        $this->postJson("/api/v1/patente/exams/{$exam['id']}/answers", ['answers' => $this->answersFor($exam['questions'], $bank, [$bank[0]->id])])
            ->assertStatus(409)->assertJsonPath('error.code', 'exam_already_finished');
        $this->assertSame(4, PatenteExamAnswer::count()); // no double grading
    }

    public function test_submit_validation(): void
    {
        $this->bank();
        $this->user();
        $exam = $this->startExam()->json('data');
        $this->postJson("/api/v1/patente/exams/{$exam['id']}/answers", [])->assertStatus(422);
        $this->postJson("/api/v1/patente/exams/{$exam['id']}/answers", ['answers' => [['question_id' => 1, 'answer' => 'yes']]])->assertStatus(422);
        $this->postJson("/api/v1/patente/exams/{$exam['id']}/answers", ['answers' => [['question_id' => 1, 'answer' => true], ['question_id' => 1, 'answer' => false]]])->assertStatus(422);
    }

    public function test_other_users_exams_are_invisible(): void
    {
        [, $bank] = $this->bank();
        $this->user();
        $exam = $this->startExam()->json('data');

        $this->user();
        $this->getJson("/api/v1/patente/exams/{$exam['id']}")->assertNotFound();
        $this->postJson("/api/v1/patente/exams/{$exam['id']}/answers", ['answers' => $this->answersFor($exam['questions'], $bank)])->assertNotFound();
        $this->getJson('/api/v1/patente/exams')->assertJsonPath('meta.total', 0);
    }

    public function test_history_lists_only_finished_exams_newest_first(): void
    {
        [, $bank] = $this->bank();
        $this->user();
        $open = $this->startExam()->json('data');
        $a = $this->startExam()->json('data');
        $this->postJson("/api/v1/patente/exams/{$a['id']}/answers", ['answers' => $this->answersFor($a['questions'], $bank)])->assertOk();
        $this->travel(1)->minute();
        $b = $this->startExam()->json('data');
        $this->postJson("/api/v1/patente/exams/{$b['id']}/answers", ['answers' => $this->answersFor($b['questions'], $bank, [$bank[0]->id, $bank[1]->id])])->assertOk();

        $res = $this->getJson('/api/v1/patente/exams')->assertOk();
        $this->assertSame([$b['id'], $a['id']], array_column($res->json('data'), 'id'));
        $this->assertNotContains($open['id'], array_column($res->json('data'), 'id'));
    }

    // ---- analytics ----------------------------------------------------------------------------

    public function test_weak_topics_are_flagged_only_with_enough_data_and_sorted_weakest_first(): void
    {
        $strong = $this->topic('forti');
        $weak = $this->topic('deboli');
        $this->topic('nuovi');
        $few = $this->topic('pochi');
        $u = $this->user();
        $exam = new PatenteExam(['mode' => 'practice', 'question_ids' => [], 'finished_at' => now()]);
        $exam->user_id = $u->id;
        $exam->save();

        $answers = fn (PatenteTopic $t, int $right, int $wrong) => collect(range(1, $right + $wrong))->each(function ($i) use ($t, $exam, $u, $right) {
            $q = $this->question($t, true);
            $a = new PatenteExamAnswer(['answer' => true, 'correct' => $i <= $right, 'patente_topic_id' => $t->id]);
            $a->user_id = $u->id;
            $a->patente_exam_id = $exam->id;
            $a->patente_question_id = $q->id;
            $a->save();
        });
        $answers($strong, 9, 1);   // 90 %
        $answers($weak, 3, 7);     // 30 %, enough data → weak
        $answers($few, 0, 2);      // 0 % but only 2 answers → not flagged

        $topics = collect($this->getJson('/api/v1/patente/progress', ['Accept-Language' => 'it'])->assertOk()->json('data.topics'));
        $this->assertSame(['pochi', 'deboli', 'forti', 'nuovi'], $topics->pluck('topic.slug')->all());
        $by = $topics->keyBy('topic.slug');
        $this->assertTrue($by['deboli']['weak']);
        $this->assertSame(30, $by['deboli']['accuracy']);
        $this->assertFalse($by['forti']['weak']);
        $this->assertFalse($by['pochi']['weak']);
        $this->assertNull($by['nuovi']['accuracy']);
        $this->assertSame('Segnali', $topics->first()['topic']['title']);
    }

    public function test_progress_summary_counts_exams_and_recent_pass_rate(): void
    {
        [, $bank] = $this->bank();
        $this->user();
        $this->getJson('/api/v1/patente/progress')->assertJsonPath('data.summary.exams_taken', 0)->assertJsonPath('data.summary.recent_pass_rate', null);

        foreach ([[], [0, 1], []] as $i => $wrongIdx) { // pass, fail, pass
            $exam = $this->startExam()->json('data');
            $wrong = array_map(fn ($k) => $bank[$k]->id, $wrongIdx);
            $this->postJson("/api/v1/patente/exams/{$exam['id']}/answers", ['answers' => $this->answersFor($exam['questions'], $bank, $wrong)])->assertOk();
            $this->travel($i + 1)->minutes();
        }

        $s = $this->getJson('/api/v1/patente/progress')->json('data.summary');
        $this->assertSame([3, 2, 67], [$s['exams_taken'], $s['exams_passed'], $s['recent_pass_rate']]);
        $this->assertSame(0.7, $s['average_errors']);
    }

    // ---- AI knowledge & privacy ---------------------------------------------------------------

    public function test_ai_index_contains_theory_text_but_never_exam_questions(): void
    {
        [$t] = $this->bank();
        app(KnowledgeIndexer::class)->sync($t);

        $this->assertTrue(KnowledgeChunk::where('item_type', 'patente_topic')->exists());
        $this->assertSame(0, KnowledgeChunk::where('content', 'like', '%Affermazione%')->orWhere('content', 'like', '%عبارة عربية%')->count());
        $this->assertSame(['patente_topic'], KnowledgeChunk::pluck('item_type')->unique()->values()->all());
    }

    public function test_patente_questions_to_the_assistant_need_a_verified_source(): void
    {
        $this->user();
        $res = $this->postJson('/api/v1/ai/ask', ['message' => 'How do I get the driving licence patente?'], ['Accept-Language' => 'en'])->assertOk();
        $this->assertStringContainsString("don't have verified information", $res->json('data.message.content'));
        $this->assertCount(0, app(LlmClient::class)->calls);
    }

    public function test_export_and_erasure_cover_exams(): void
    {
        [, $bank] = $this->bank();
        $u = $this->user();
        $exam = $this->startExam()->json('data');
        $this->postJson("/api/v1/patente/exams/{$exam['id']}/answers", ['answers' => $this->answersFor($exam['questions'], $bank)])->assertOk();

        $export = $this->getJson('/api/v1/profile/export')->assertJsonPath('data.patente.0.passed', true);
        $this->assertStringNotContainsString('is_true', $export->getContent());

        $this->deleteJson('/api/v1/profile', ['password' => 'password'])->assertStatus(202);
        $this->assertSame(0, PatenteExam::where('user_id', $u->id)->count());
        $this->assertSame(0, PatenteExamAnswer::where('user_id', $u->id)->count());
    }
}
