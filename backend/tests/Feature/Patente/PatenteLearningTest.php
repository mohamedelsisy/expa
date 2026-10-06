<?php

namespace Tests\Feature\Patente;

use App\Domains\Access\Services\AccessSynchronizer;
use App\Domains\Content\Services\PublishGuard;
use App\Domains\Learning\Models\ItalianVocabulary;
use App\Domains\Patente\Models\PatenteQuestion;
use App\Domains\Patente\Models\PatenteTopic;
use App\Enums\SourceType;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PatenteLearningTest extends TestCase
{
    use RefreshDatabase;

    private int $n = 0;

    protected function setUp(): void
    {
        parent::setUp();
        app(AccessSynchronizer::class)->sync();
        config(['patente.weak_min_answers' => 2, 'patente.daily_practice_limit' => 1000]);
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

    private function topic(string $slug): PatenteTopic
    {
        $t = new PatenteTopic(['slug' => $slug, 'source_name' => 'Test', 'source_url' => 'https://www.mit.gov.it/t', 'source_type' => SourceType::Official, 'last_verified_at' => now()]);
        $t->save();
        $t->setTranslations(['ar' => ['title' => "موضوع $slug", 'summary' => 'ملخص'], 'it' => ['title' => "Argomento $slug", 'summary' => 'Sintesi']]);
        $t->forceFill(['status' => 'published'])->save();

        return $t;
    }

    private function question(PatenteTopic $t, bool $truth = true, array $rights = []): PatenteQuestion
    {
        $q = new PatenteQuestion(array_merge(['slug' => 'lq-'.++$this->n, 'patente_topic_id' => $t->id, 'is_true' => $truth,
            'license_type' => 'original_work', 'rights_holder' => 'EXPA Srl (test)', 'license_proof_ref' => 'TEST-AUTHOR-AGREEMENT-1',
            'source_name' => 'Test', 'source_url' => 'https://www.mit.gov.it/q', 'source_type' => SourceType::Official, 'last_verified_at' => now()], $rights));
        $q->save();
        $q->setTranslations([
            'it' => ['statement' => "Affermazione {$this->n}", 'explanation' => "Spiegazione {$this->n}"],
            'ar' => ['statement' => "عبارة {$this->n}", 'explanation' => "شرح {$this->n}"],
            'en' => ['statement' => "Statement {$this->n}", 'explanation' => "Explanation {$this->n}"],
        ]);
        $q->forceFill(['status' => 'published'])->save();

        return $q->fresh();
    }

    // ---- licensing guard -------------------------------------------------------------------------------

    public function test_structured_license_is_required_complete_and_blocks_publication_when_partial(): void
    {
        $guard = fn (array $f) => array_column(app(PublishGuard::class)->problems($this->draftQuestion($f)), 'field');

        $this->assertSame([], $guard(['license_type' => 'licensed', 'rights_holder' => 'Editore X', 'license_proof_ref' => 'Contract 2026/17']));
        $this->assertSame(['rights_holder', 'license_proof_ref'], $guard(['license_type' => 'licensed']));
        $this->assertSame(['license_proof_ref'], $guard(['license_type' => 'licensed', 'rights_holder' => 'Editore X']));
        $this->assertSame(['license_proof_ref'], $guard(['license_type' => 'licensed', 'rights_holder' => 'Editore X', 'license_proof_ref' => 'tbd']));
        // a partial structured licence is never rescued by the legacy note
        $this->assertContains('rights_holder', $guard(['license_type' => 'licensed', 'rights_note' => 'Licensed from X, contract 123 attached']));
    }

    private function draftQuestion(array $f): PatenteQuestion
    {
        $t = PatenteTopic::first() ?? $this->topic('base');
        $q = new PatenteQuestion(array_merge(['slug' => 'dq-'.++$this->n, 'patente_topic_id' => $t->id, 'is_true' => true,
            'source_name' => 'Test', 'source_url' => 'https://www.mit.gov.it/q', 'source_type' => SourceType::Official, 'last_verified_at' => now()], $f));
        $q->save();
        $q->setTranslations(['it' => ['statement' => 'Affermazione'], 'ar' => ['statement' => 'عبارة']]);

        return $q->fresh();
    }

    public function test_legacy_note_works_only_while_allowed_and_nothing_at_all_never_publishes(): void
    {
        $guard = fn (array $f) => array_column(app(PublishGuard::class)->problems($this->draftQuestion($f)), 'code');

        $this->assertSame([], $guard(['rights_note' => 'Original text written by EXPA staff, CC0']));
        $this->assertSame(['missing_rights_note'], $guard([]));

        config(['patente.legacy_rights_note_allowed' => false]);
        $this->assertSame(['missing_license_field'], $guard(['rights_note' => 'Original text written by EXPA staff, CC0']));
        $this->assertSame([], $guard(['license_type' => 'public_domain', 'rights_holder' => 'Public body', 'license_proof_ref' => 'Gazzetta ref 123']));
    }

    public function test_admin_can_create_with_structured_license_only_and_publish_is_guarded(): void
    {
        $t = $this->topic('segnali');
        $this->staff('editor');
        $base = ['slug' => 'adm-q', 'patente_topic_id' => $t->id, 'is_true' => true, 'source_name' => 'Test', 'source_url' => 'https://www.mit.gov.it/q', 'source_type' => 'official', 'last_verified_at' => '2026-09-01',
            'translations' => ['it' => ['statement' => 'Affermazione'], 'ar' => ['statement' => 'عبارة', 'explanation' => 'شرح']]];

        $this->postJson('/api/v1/admin/patente/questions', $base)->assertStatus(422)->assertJsonStructure(['error' => ['details' => ['rights_note']]]);
        $this->postJson('/api/v1/admin/patente/questions', $base + ['license_type' => 'bogus'])->assertStatus(422);
        $res = $this->postJson('/api/v1/admin/patente/questions', $base + ['license_type' => 'licensed', 'rights_holder' => 'Editore X'])->assertCreated();
        $res->assertJsonPath('data.license_type', 'licensed')->assertJsonPath('data.rights_complete', false)->assertJsonPath('data.rights_note', null);
        $id = $res->json('data.id');

        $this->patchJson("/api/v1/admin/patente/questions/$id", ['license_proof_ref' => 'Contract 2026/17'])->assertOk()->assertJsonPath('data.rights_complete', true);
        $this->postJson("/api/v1/admin/patente/questions/$id/transition", ['to' => 'review'])->assertOk();

        $this->staff('content_manager');
        $this->patchJson("/api/v1/admin/patente/questions/$id", ['license_proof_ref' => null])->assertOk()->assertJsonPath('data.rights_complete', false);
        PatenteQuestion::whereKey($id)->update(['status' => 'approved']);
        $this->postJson("/api/v1/admin/patente/questions/$id/transition", ['to' => 'published'])->assertStatus(422)->assertJsonFragment(['code' => 'missing_license_field', 'field' => 'license_proof_ref']);
    }

    public function test_admin_meta_exposes_licence_vocabulary_and_rights_state(): void
    {
        $t = $this->topic('x');
        $this->question($t);
        PatenteQuestion::create(['slug' => 'incomplete', 'patente_topic_id' => $t->id, 'is_true' => true]);

        $this->user();
        $this->getJson('/api/v1/admin/patente/meta')->assertForbidden();
        $this->staff('editor');
        $r = $this->getJson('/api/v1/admin/patente/meta', ['Accept-Language' => 'ar'])->assertOk();
        $this->assertContains('licensed', array_column($r->json('data.license_types'), 'value'));
        $this->assertSame(['license_type', 'rights_holder', 'license_proof_ref'], $r->json('data.rights_policy.required_fields'));
        $this->assertSame(1, $r->json('data.questions.published'));
        $this->assertSame(1, $r->json('data.questions.unpublished_with_incomplete_rights'));
        $this->assertSame(['it', 'ar'], $r->json('data.required_locales'));
    }

    // ---- weak topics + practice ---------------------------------------------------------------------------------

    public function test_weak_topic_analysis_and_recommendation(): void
    {
        $a = $this->topic('segnali');
        $b = $this->topic('precedenza');
        $qa = [$this->question($a, true), $this->question($a, true), $this->question($a, true)];
        $qb = [$this->question($b, true), $this->question($b, true)];
        $this->question($this->topic('parcheggio'), true);

        $this->getJson('/api/v1/patente/weak-topics')->assertUnauthorized();
        $this->user();
        $this->getJson('/api/v1/patente/weak-topics')->assertOk()->assertJsonPath('data.weak', [])->assertJsonPath('data.recommended', 'segnali');

        // topic a: all wrong; topic b: all right
        $id = $this->postJson('/api/v1/patente/topics/segnali/practice', ['size' => 3])->assertCreated()->json('data.id');
        $answers = collect($qa)->map(fn ($q) => ['question_id' => $q->id, 'answer' => false])->all();
        $this->postJson("/api/v1/patente/exams/$id/answers", ['answers' => $answers])->assertOk();
        $id2 = $this->postJson('/api/v1/patente/topics/precedenza/practice')->assertCreated()->json('data.id');
        $this->postJson("/api/v1/patente/exams/$id2/answers", ['answers' => collect($qb)->map(fn ($q) => ['question_id' => $q->id, 'answer' => true])->all()])->assertOk();

        $r = $this->getJson('/api/v1/patente/weak-topics', ['Accept-Language' => 'it'])->assertOk();
        $this->assertSame(['segnali'], array_column(array_column($r->json('data.weak'), 'topic'), 'slug'));
        $this->assertSame(0, $r->json('data.weak.0.accuracy'));
        $this->assertSame(3, $r->json('data.weak.0.available_questions'));
        $this->assertSame('segnali', $r->json('data.recommended'));
        $this->assertContains('parcheggio', array_column(array_column($r->json('data.untouched'), 'topic'), 'slug'));
        $this->assertSame(70, $r->json('data.threshold'));
    }

    public function test_topic_practice_session_is_not_an_exam_and_validates(): void
    {
        $t = $this->topic('segnali');
        foreach (range(1, 5) as $i) {
            $this->question($t, $i % 2 === 0);
        }
        $this->user();
        $r = $this->postJson('/api/v1/patente/topics/segnali/practice', ['size' => 3], ['Accept-Language' => 'ar'])->assertCreated();
        $r->assertJsonPath('data.mode', 'practice')->assertJsonPath('data.deadline_at', null)->assertJsonPath('data.max_errors', null);
        $this->assertCount(3, $r->json('data.questions'));
        $this->assertStringNotContainsString('is_true', $r->getContent());
        $this->postJson('/api/v1/patente/topics/nope/practice')->assertNotFound();
        $this->postJson('/api/v1/patente/topics/segnali/practice', ['size' => 999])->assertStatus(422);

        $unverified = User::factory()->unverified()->create();
        $this->actingAs($unverified, 'sanctum')->postJson('/api/v1/patente/topics/segnali/practice')->assertForbidden();
    }

    public function test_weak_practice_needs_weak_topics(): void
    {
        $a = $this->topic('segnali');
        $qs = [$this->question($a, true), $this->question($a, true)];
        $this->user();
        $this->postJson('/api/v1/patente/practice/weak')->assertStatus(422)->assertJsonPath('error.code', 'no_weak_topics');

        $id = $this->postJson('/api/v1/patente/topics/segnali/practice')->json('data.id');
        $this->postJson("/api/v1/patente/exams/$id/answers", ['answers' => collect($qs)->map(fn ($q) => ['question_id' => $q->id, 'answer' => false])->all()])->assertOk();
        $r = $this->postJson('/api/v1/patente/practice/weak')->assertCreated();
        $this->assertSame('practice', $r->json('data.mode'));
    }

    public function test_instant_feedback_exists_only_for_own_unfinished_practice_sessions(): void
    {
        $t = $this->topic('segnali');
        $q = $this->question($t, true);
        $owner = $this->user();
        $id = $this->postJson('/api/v1/patente/topics/segnali/practice')->json('data.id');

        $this->postJson("/api/v1/patente/exams/$id/check", ['question_id' => $q->id, 'answer' => false], ['Accept-Language' => 'ar'])->assertOk()
            ->assertJsonPath('data.correct', false)->assertJsonPath('data.correct_answer', true)->assertJsonPath('data.explanation', "شرح {$this->n}")
            ->assertJsonPath('data.explanations.it', "Spiegazione {$this->n}")->assertJsonPath('data.explanations.en', "Explanation {$this->n}");
        $this->postJson("/api/v1/patente/exams/$id/check", ['question_id' => 99999, 'answer' => true])->assertStatus(422);
        $this->postJson("/api/v1/patente/exams/$id/check", ['question_id' => $q->id])->assertStatus(422);

        // not another user's session
        $this->actingAs(User::factory()->create(), 'sanctum')->postJson("/api/v1/patente/exams/$id/check", ['question_id' => $q->id, 'answer' => true])->assertNotFound();

        // finished sessions and exams give no instant feedback
        $this->actingAs($owner, 'sanctum');
        $this->postJson("/api/v1/patente/exams/$id/answers", ['answers' => [['question_id' => $q->id, 'answer' => true]]])->assertOk();
        $this->postJson("/api/v1/patente/exams/$id/check", ['question_id' => $q->id, 'answer' => true])->assertStatus(409)->assertJsonPath('error.code', 'practice_only');
    }

    public function test_exam_sessions_never_give_instant_feedback(): void
    {
        $t = $this->topic('segnali');
        config(['patente.exam.questions' => 2, 'patente.exam.min_submit_fraction' => 0, 'patente.daily_exam_limit' => 100]);
        $qs = [$this->question($t), $this->question($t)];
        $this->user();
        $id = $this->postJson('/api/v1/patente/exams', ['mode' => 'exam'])->assertCreated()->json('data.id');
        $this->postJson("/api/v1/patente/exams/$id/check", ['question_id' => $qs[0]->id, 'answer' => true])->assertStatus(409)->assertJsonPath('error.code', 'practice_only');
    }

    // ---- glossary ------------------------------------------------------------------------------------------------------

    public function test_glossary_is_the_patente_category_of_the_vocabulary_module(): void
    {
        foreach ([['precedenza', 'patente', 'published'], ['farmacia', 'pharmacy', 'published'], ['divieto-di-sosta', 'patente', 'draft']] as $i => [$slug, $cat, $status]) {
            $v = new ItalianVocabulary(['slug' => $slug, 'lemma' => str_replace('-', ' ', $slug), 'level' => 'a2', 'category' => $cat, 'sort_order' => $i]);
            $v->save();
            $v->setTranslations(['ar' => ['gloss' => "ع-$slug"], 'en' => ['gloss' => "en-$slug"]]);
            $v->forceFill(['status' => $status])->save();
        }
        $r = $this->getJson('/api/v1/patente/glossary', ['Accept-Language' => 'ar'])->assertOk();
        $this->assertSame(['precedenza'], array_column($r->json('data'), 'slug'));
        $this->assertSame('ع-precedenza', $r->json('data.0.gloss'));
        $this->assertFalse($r->json('data.0.reviewed'));
    }
}
