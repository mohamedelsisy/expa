<?php

namespace Tests\Feature\Learning;

use App\Domains\Access\Services\AccessSynchronizer;
use App\Domains\Content\Services\PublishGuard;
use App\Domains\Learning\Models\ItalianExercise;
use App\Domains\Learning\Models\ItalianVocabProgress;
use App\Domains\Learning\Models\ItalianVocabulary;
use App\Domains\Privacy\Services\PersonalDataExporter;
use App\Models\User;
use Database\Seeders\ItalianPracticeStarterSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class ItalianPracticeTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        app(AccessSynchronizer::class)->sync();
        $this->seed(ItalianPracticeStarterSeeder::class);
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

    public function test_starter_content_is_public_and_visibly_unreviewed(): void
    {
        $r = $this->getJson('/api/v1/italian/vocabulary?per_page=100', ['Accept-Language' => 'ar'])->assertOk();
        $this->assertGreaterThanOrEqual(20, $r->json('meta.total'));
        foreach ($r->json('data') as $w) {
            $this->assertFalse($w['reviewed']);
            $this->assertNull($w['reviewed_at']);
            $this->assertNotEmpty($w['review_notice']);
            $this->assertNull($w['audio']);
            $this->assertNotEmpty($w['gloss']);
        }
        $one = $this->getJson('/api/v1/italian/vocabulary/farmacia', ['Accept-Language' => 'en'])->assertOk();
        $one->assertJsonPath('data.gloss', 'pharmacy')->assertJsonPath('data.lemma', 'farmacia')->assertJsonPath('data.category_label', 'At the pharmacy');
        $this->getJson('/api/v1/italian/vocabulary?category=patente')->assertJsonPath('meta.total', 4);
        $this->getJson('/api/v1/italian/vocabulary?q='.rawurlencode('صيدلية'))->assertJsonPath('meta.total', 1);
        $this->getJson('/api/v1/italian/vocabulary?level=zz')->assertStatus(422);
        $this->getJson('/api/v1/italian/vocabulary/nope')->assertNotFound();
    }

    public function test_scenarios_are_data_with_counts(): void
    {
        $r = $this->getJson('/api/v1/italian/scenarios', ['Accept-Language' => 'it'])->assertOk();
        $values = array_column($r->json('data'), 'value');
        foreach (['comune', 'doctor', 'pharmacy', 'bank', 'work', 'job_interview', 'landlord', 'restaurant', 'supermarket', 'police', 'post_office', 'immigration_office', 'patente'] as $v) {
            $this->assertContains($v, $values);
        }
        $pharmacy = collect($r->json('data'))->firstWhere('value', 'pharmacy');
        $this->assertSame('In farmacia', $pharmacy['label'] ?? 'In farmacia');
        $this->assertGreaterThan(0, $pharmacy['vocabulary']);
    }

    public function test_exercises_never_expose_answers_before_an_attempt(): void
    {
        $r = $this->getJson('/api/v1/italian/exercises?per_page=100', ['Accept-Language' => 'en'])->assertOk();
        $this->assertCount(6, $r->json('data'));
        $json = $r->getContent();
        foreach (['correct_index', '"answers"', '"chiamo"', '"sono"'] as $leak) {
            $this->assertStringNotContainsString($leak, $json, $leak);
        }
        $mc = $this->getJson('/api/v1/italian/exercises/mc-farmacia', ['Accept-Language' => 'en'])->assertOk();
        $mc->assertJsonPath('data.form.choices.0.text', 'pharmacy')->assertJsonPath('data.reviewed', false);
        $this->getJson('/api/v1/italian/exercises/mc-farmacia', ['Accept-Language' => 'ar'])->assertJsonPath('data.form.choices.0.text', 'صيدلية');
        $this->getJson('/api/v1/italian/exercises/fill-mi-chiamo')->assertJsonPath('data.form.sentence', 'Mi ___ Sara.');
    }

    public function test_grading_per_type_and_leitner_update_on_linked_vocabulary(): void
    {
        $this->user();
        $this->postJson('/api/v1/italian/exercises/mc-farmacia/attempt', ['answer' => 2])->assertOk()->assertJsonPath('data.correct', false)->assertJsonPath('data.correct_answer.index', 0)->assertJsonPath('data.vocabulary.box', 1);
        $this->postJson('/api/v1/italian/exercises/mc-farmacia/attempt', ['answer' => 0])->assertOk()->assertJsonPath('data.correct', true)->assertJsonPath('data.vocabulary.box', 2);

        $this->postJson('/api/v1/italian/exercises/fill-mi-chiamo/attempt', ['answer' => '  Chiamo. '])->assertOk()->assertJsonPath('data.correct', true)->assertJsonPath('data.vocabulary', null);
        $this->postJson('/api/v1/italian/exercises/fill-mi-chiamo/attempt', ['answer' => 'sono'])->assertOk()->assertJsonPath('data.correct', false);

        $form = $this->getJson('/api/v1/italian/exercises/match-places', ['Accept-Language' => 'en'])->json('data.form');
        $byText = collect($form['right'])->pluck('id', 'text');
        $right = [$byText['pharmacy'], $byText['bank'], $byText['town hall']];
        $this->postJson('/api/v1/italian/exercises/match-places/attempt', ['answer' => $right])->assertOk()->assertJsonPath('data.correct', true);
        $this->postJson('/api/v1/italian/exercises/match-places/attempt', ['answer' => array_reverse($right)])->assertOk()->assertJsonPath('data.correct', false);
        $this->assertNotSame([0, 1, 2], collect($form['right'])->pluck('text')->map(fn ($t) => ['pharmacy' => 0, 'bank' => 1, 'town hall' => 2][$t])->all(), 'right-hand items are shuffled');
    }

    public function test_attempt_validation_and_auth(): void
    {
        $this->postJson('/api/v1/italian/exercises/mc-farmacia/attempt', ['answer' => 0])->assertUnauthorized();
        $this->user();
        $this->postJson('/api/v1/italian/exercises/mc-farmacia/attempt', [])->assertStatus(422);
        $this->postJson('/api/v1/italian/exercises/mc-farmacia/attempt', ['answer' => 'x'])->assertStatus(422);
        $this->postJson('/api/v1/italian/exercises/match-places/attempt', ['answer' => 'x'])->assertStatus(422);
        $this->postJson('/api/v1/italian/exercises/nope/attempt', ['answer' => 0])->assertNotFound();
        ItalianExercise::where('slug', 'mc-banca')->update(['status' => 'draft']);
        $this->postJson('/api/v1/italian/exercises/mc-banca/attempt', ['answer' => 1])->assertNotFound();
    }

    public function test_leitner_boxes_and_due_dates(): void
    {
        $u = $this->user();
        $slug = 'farmacia';
        $box = fn () => ItalianVocabProgress::where('user_id', $u->id)->first();

        $this->postJson("/api/v1/italian/vocabulary/$slug/review", ['correct' => true])->assertOk()->assertJsonPath('data.box', 2);
        $this->assertTrue($box()->due_at->isSameDay(now()->addDays(config('learning.leitner_days.2'))));
        foreach ([3, 4, 5, 5] as $expected) {
            $this->postJson("/api/v1/italian/vocabulary/$slug/review", ['correct' => true])->assertJsonPath('data.box', $expected);
        }
        $this->postJson("/api/v1/italian/vocabulary/$slug/review", ['correct' => true])->assertJsonPath('data.mastered', true);
        $this->postJson("/api/v1/italian/vocabulary/$slug/review", ['correct' => false])->assertJsonPath('data.box', 1)->assertJsonPath('data.mastered', false);
        $this->assertTrue($box()->due_at->isSameDay(now()->addDay()));
        $this->assertSame(6, $box()->correct_count);
        $this->assertSame(1, $box()->wrong_count);
        $this->postJson("/api/v1/italian/vocabulary/$slug/review", [])->assertStatus(422);
    }

    public function test_review_queue_has_due_cards_first_then_a_few_new_ones(): void
    {
        $u = $this->user();
        $first = $this->getJson('/api/v1/italian/practice/review')->assertOk();
        $this->assertCount(config('learning.daily_new_cards'), $first->json('data.cards'));
        $this->assertTrue($first->json('data.cards.0.new'));
        $this->assertSame('a0', $first->json('data.cards.0.level'));

        $slug = $first->json('data.cards.0.slug');
        $this->postJson("/api/v1/italian/vocabulary/$slug/review", ['correct' => false])->assertOk();
        $this->travel(2)->days();
        $q = $this->getJson('/api/v1/italian/practice/review')->json('data');
        $this->assertSame($slug, $q['cards'][0]['slug']);
        $this->assertFalse($q['cards'][0]['new']);
        $this->assertSame(1, $q['stats']['due_now']);
        $this->assertNotSame($slug, $q['cards'][1]['slug']);
        $this->assertNotNull($u);
    }

    public function test_progress_endpoint_and_daily_plan_integration(): void
    {
        $this->user();
        $this->postJson('/api/v1/italian/exercises/mc-farmacia/attempt', ['answer' => 0])->assertOk();
        $p = $this->getJson('/api/v1/italian/practice/progress')->assertOk();
        $p->assertJsonPath('data.exercises.attempts', 1)->assertJsonPath('data.exercises.accuracy', 100)->assertJsonPath('data.vocabulary.cards_learning', 1);

        $plan = $this->getJson('/api/v1/italian/daily')->assertOk()->json('data');
        $this->assertSame(5, count($plan['slots']), 'the five lesson slots are unchanged');
        $this->assertGreaterThan(0, $plan['practice']['vocabulary']['total']);
        $this->assertNotContains('mc-farmacia', $plan['practice']['quiz']['exercises'], 'already practised today');
        $this->assertLessThanOrEqual(config('learning.daily_quiz_size'), $plan['practice']['quiz']['total']);
    }

    public function test_daily_plan_has_no_practice_block_without_published_content(): void
    {
        ItalianVocabulary::query()->update(['status' => 'draft']);
        ItalianExercise::query()->update(['status' => 'draft']);
        $this->user();
        $this->getJson('/api/v1/italian/daily')->assertOk()->assertJsonPath('data.practice', null);
    }

    // ---- admin: lifecycle, structure, audio rights, teacher review --------------------------------------------

    private function vocabPayload(array $over = []): array
    {
        return array_merge(['slug' => 'nuovo', 'lemma' => 'nuovo', 'level' => 'a1', 'category' => 'general',
            'translations' => ['ar' => ['gloss' => 'جديد'], 'en' => ['gloss' => 'new']]], $over);
    }

    public function test_vocabulary_admin_workflow_requires_arabic_and_english_and_four_eyes(): void
    {
        $this->user();
        $this->getJson('/api/v1/admin/italian/vocabulary')->assertForbidden();

        $this->staff('editor');
        $this->postJson('/api/v1/admin/italian/vocabulary', $this->vocabPayload(['category' => 'bogus']))->assertStatus(422);
        $id = $this->postJson('/api/v1/admin/italian/vocabulary', $this->vocabPayload(['translations' => ['ar' => ['gloss' => 'جديد']]]))->assertCreated()->json('data.id');
        $this->postJson("/api/v1/admin/italian/vocabulary/$id/transition", ['to' => 'review'])->assertOk();

        $this->staff('content_manager');
        $this->postJson("/api/v1/admin/italian/vocabulary/$id/transition", ['to' => 'approved'])->assertOk();
        $this->postJson("/api/v1/admin/italian/vocabulary/$id/transition", ['to' => 'published'])->assertStatus(422)->assertJsonFragment(['code' => 'missing_translation', 'locale' => 'en']);
        $this->patchJson("/api/v1/admin/italian/vocabulary/$id/translations", ['translations' => ['en' => ['gloss' => 'new']]])->assertOk();
        $this->postJson("/api/v1/admin/italian/vocabulary/$id/transition", ['to' => 'published'])->assertOk();
        $this->getJson('/api/v1/italian/vocabulary/nuovo')->assertOk()->assertJsonPath('data.reviewed', false);
    }

    public function test_audio_needs_a_rights_note_to_publish_and_is_exposed_with_it(): void
    {
        $v = new ItalianVocabulary(['slug' => 'ciao', 'lemma' => 'ciao', 'level' => 'a0', 'audio_url' => 'https://example.test/ciao.mp3']);
        $v->save();
        $v->setTranslations(['ar' => ['gloss' => 'مرحبا'], 'en' => ['gloss' => 'hi']]);
        $problems = fn () => app(PublishGuard::class)->problems($v->fresh());
        $this->assertContains(['code' => 'audio_rights_missing', 'field' => 'audio_rights_note'], $problems());
        $v->forceFill(['audio_rights_note' => 'Recorded by EXPA staff, CC0', 'status' => 'published'])->save();
        $this->assertSame([], $problems());
        $this->getJson('/api/v1/italian/vocabulary/ciao')->assertJsonPath('data.audio.url', 'https://example.test/ciao.mp3')->assertJsonPath('data.audio.rights_note', 'Recorded by EXPA staff, CC0');

        $bad = new ItalianVocabulary(['slug' => 'x', 'lemma' => 'x', 'level' => 'a0', 'audio_url' => 'http://insecure.test/a.mp3']);
        $bad->save();
        $bad->setTranslations(['ar' => ['gloss' => 'س'], 'en' => ['gloss' => 'x']]);
        $this->assertContains(['code' => 'invalid_url', 'field' => 'audio_url'], app(PublishGuard::class)->problems($bad->fresh()));
    }

    public function test_exercise_structure_is_validated_before_publishing(): void
    {
        $mk = function (string $type, array $content, ?array $options = null) {
            $e = new ItalianExercise(['slug' => 'e-'.uniqid(), 'type' => $type, 'level' => 'a1', 'content' => $content]);
            $e->save();
            $e->setTranslations(['ar' => ['prompt' => 'سؤال'] + ($options ? ['options' => $options] : [])]);

            return app(PublishGuard::class)->problems($e->fresh());
        };
        $codes = fn ($p) => array_column($p, 'code');

        $this->assertSame([], $mk('multiple_choice', ['choices' => ['a', 'b'], 'correct_index' => 1]));
        $this->assertContains('exercise_invalid_correct_index', $codes($mk('multiple_choice', ['choices' => ['a', 'b'], 'correct_index' => 5])));
        $this->assertContains('exercise_needs_two_choices', $codes($mk('multiple_choice', ['choices' => ['a'], 'correct_index' => 0])));
        $this->assertContains('exercise_options_length_mismatch', $codes($mk('multiple_choice', ['choices' => ['a', 'b'], 'correct_index' => 0], ['x'])));
        $this->assertContains('exercise_needs_one_blank', $codes($mk('fill_blank', ['sentence' => 'no blank', 'answers' => ['x']])));
        $this->assertContains('exercise_needs_answers', $codes($mk('fill_blank', ['sentence' => 'a ___ b', 'answers' => []])));
        $this->assertContains('exercise_options_length_mismatch', $codes($mk('match', ['left' => ['a', 'b']], ['x'])));
        $this->assertSame([], $mk('match', ['left' => ['a', 'b']], ['x', 'y']));
        $this->assertSame([], $mk('listening', ['choices' => ['a', 'b'], 'correct_index' => 0])); // audio is optional
    }

    public function test_exercise_admin_validates_content_and_rejects_unknown_keys(): void
    {
        $this->staff('editor');
        $base = ['slug' => 'ex-new', 'type' => 'fill_blank', 'level' => 'a1', 'content' => ['sentence' => 'Io ___ qui.', 'answers' => ['sono']], 'translations' => ['ar' => ['prompt' => 'أكمل']]];
        $this->postJson('/api/v1/admin/italian/exercises', $base)->assertCreated()->assertJsonPath('data.content.answers.0', 'sono');
        $this->postJson('/api/v1/admin/italian/exercises', ['slug' => 'ex-2', 'content' => ['evil' => 1]] + $base)->assertStatus(422);
        $this->postJson('/api/v1/admin/italian/exercises', ['slug' => 'ex-3', 'type' => 'essay'] + $base)->assertStatus(422);
    }

    public function test_teacher_review_flag_is_set_by_reviewers_and_cleared_when_content_changes(): void
    {
        $v = ItalianVocabulary::where('slug', 'farmacia')->first();
        $this->staff('editor');
        $this->postJson("/api/v1/admin/italian/vocabulary/{$v->id}/teacher-review")->assertForbidden();

        $teacher = $this->staff('content_manager');
        $this->postJson("/api/v1/admin/italian/vocabulary/{$v->id}/teacher-review")->assertOk()->assertJsonPath('data.reviewed', true)->assertJsonPath('data.reviewed_by', $teacher->id);
        $this->getJson('/api/v1/italian/vocabulary/farmacia')->assertJsonPath('data.reviewed', true)->assertJsonPath('data.review_notice', null);
        $this->assertSame(1, ItalianVocabulary::where('slug', 'farmacia')->whereNotNull('reviewed_by_teacher_at')->count());

        $v->fresh()->setTranslations(['ar' => ['gloss' => 'صيدلية جديدة']]);
        $this->assertNull($v->fresh()->reviewed_by_teacher_at, 'editing the text voids the review');

        $this->postJson("/api/v1/admin/italian/vocabulary/{$v->id}/teacher-review")->assertOk();
        $this->patchJson("/api/v1/admin/italian/vocabulary/{$v->id}", ['lemma' => 'farmacia!'])->assertOk()->assertJsonPath('data.reviewed', false);
        $this->postJson("/api/v1/admin/italian/vocabulary/{$v->id}/teacher-review")->assertOk();
        $this->deleteJson("/api/v1/admin/italian/vocabulary/{$v->id}/teacher-review")->assertOk()->assertJsonPath('data.reviewed', false);
    }

    public function test_publishing_can_be_made_to_require_a_teacher_review(): void
    {
        config(['learning.require_teacher_review_to_publish' => true]);
        $v = ItalianVocabulary::where('slug', 'farmacia')->first();
        $guard = app(PublishGuard::class);
        $this->assertContains(['code' => 'pending_teacher_review', 'field' => 'reviewed_by_teacher_at'], $guard->problems($v));
        $v->markReviewed(User::factory()->create());
        $this->assertSame([], $guard->problems($v->fresh()));
    }

    // ---- privacy -------------------------------------------------------------------------------------------------

    public function test_practice_data_is_exported_and_erased_and_answers_are_not_stored(): void
    {
        $u = $this->user();
        $this->postJson('/api/v1/italian/exercises/fill-mi-chiamo/attempt', ['answer' => 'SECRETWRONGANSWER'])->assertOk();
        $this->postJson('/api/v1/italian/vocabulary/banca/review', ['correct' => true])->assertOk();

        $this->assertStringNotContainsString('SECRETWRONGANSWER', json_encode(DB::table('italian_exercise_attempts')->get()));
        $export = app(PersonalDataExporter::class)->export($u);
        $this->assertSame('banca', $export['italian_practice']['vocabulary'][0]['word']);
        $this->assertFalse($export['italian_practice']['exercise_attempts'][0]['correct']);

        foreach (app()->tagged('privacy.providers') as $p) {
            $p->erase($u);
        }
        $this->assertSame(0, DB::table('italian_vocab_progress')->where('user_id', $u->id)->count());
        $this->assertSame(0, DB::table('italian_exercise_attempts')->where('user_id', $u->id)->count());
    }

    public function test_starter_seeder_is_idempotent_and_keeps_a_teacher_review(): void
    {
        ItalianVocabulary::where('slug', 'farmacia')->first()->markReviewed(User::factory()->create());
        $n = ItalianVocabulary::count();
        $this->seed(ItalianPracticeStarterSeeder::class);
        $this->assertSame($n, ItalianVocabulary::count());
        $this->assertSame(0, ItalianVocabulary::where('slug', 'farmacia')->whereNull('reviewed_by_teacher_at')->count() ? 1 : 0);
    }
}
