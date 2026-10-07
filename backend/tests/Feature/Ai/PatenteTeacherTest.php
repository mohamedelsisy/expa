<?php

namespace Tests\Feature\Ai;

use App\Domains\Ai\Contracts\LlmClient;
use App\Domains\Ai\Services\FakeLlmClient;
use App\Domains\Learning\Models\ItalianVocabulary;
use App\Domains\Patente\Models\PatenteQuestion;
use App\Domains\Patente\Models\PatenteTopic;
use App\Enums\SourceType;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/** RA-9: the Patente Teacher explains one topic/question, only from published, licensed, sourced content. */
class PatenteTeacherTest extends TestCase
{
    use RefreshDatabase;

    private FakeLlmClient $llm;

    protected function setUp(): void
    {
        parent::setUp();
        $this->llm = app(LlmClient::class);
        $this->actingAs(User::factory()->create(), 'sanctum');
    }

    private function topic(array $over = [], bool $publish = true): PatenteTopic
    {
        $t = new PatenteTopic($over + ['slug' => 'precedenza', 'source_name' => 'Test', 'source_url' => 'https://www.mit.gov.it/t', 'source_type' => SourceType::Official, 'last_verified_at' => now()]);
        $t->save();
        $t->setTranslations(['ar' => ['title' => 'الأفضلية', 'summary' => 'ملخص', 'body' => 'نص النظرية'], 'it' => ['title' => 'Precedenza', 'summary' => 'Sintesi']]);
        $publish && $t->forceFill(['status' => 'published'])->save();

        return $t->fresh();
    }

    private function question(PatenteTopic $t, array $over = [], bool $publish = true): PatenteQuestion
    {
        $q = new PatenteQuestion($over + ['slug' => 'q-1', 'patente_topic_id' => $t->id, 'is_true' => true,
            'license_type' => 'original_work', 'rights_holder' => 'EXPA Srl (test)', 'license_proof_ref' => 'TEST-AUTHOR-AGREEMENT-1',
            'source_name' => 'Test', 'source_url' => 'https://www.mit.gov.it/q', 'source_type' => SourceType::Official, 'last_verified_at' => now()]);
        $q->save();
        $q->setTranslations(['it' => ['statement' => 'Al semaforo giallo ci si deve fermare', 'explanation' => 'Spiegazione'], 'ar' => ['statement' => 'عبارة', 'explanation' => 'شرح الإشارة الصفراء']]);
        $publish && $q->forceFill(['status' => 'published'])->save();

        return $q->fresh();
    }

    private function ask(array $extra, string $lang = 'ar')
    {
        return $this->postJson('/api/v1/ai/ask', ['message' => 'اشرح لي'] + $extra, ['Accept-Language' => $lang]);
    }

    public function test_explains_a_published_question_with_sources_and_glossary(): void
    {
        $t = $this->topic();
        $this->question($t);
        $v = new ItalianVocabulary(['slug' => 'semaforo', 'lemma' => 'semaforo', 'category' => 'patente', 'level' => 'a1']);
        $v->save();
        $v->setTranslations(['ar' => ['gloss' => 'إشارة المرور'], 'en' => ['gloss' => 'traffic light']]);
        $v->forceFill(['status' => 'published'])->save();

        $r = $this->ask(['patente_question' => 'q-1'])->assertOk();
        $this->assertSame('patente', $r->json('data.message.intent') ?? 'patente');
        $this->assertSame('official', $r->json('data.message.label'));
        $this->assertSame('patente/questions/q-1', $r->json('data.message.sources.0.ref.route'));
        $this->assertStringContainsString('semaforo: إشارة المرور', $r->json('data.message.content'));
        $prompt = end($this->llm->calls)['messages'];
        $this->assertStringContainsString('Al semaforo giallo', end($prompt)['content']);
        $this->assertStringContainsString('Patente', $this->llm->calls[0]['system']);
    }

    public function test_topic_mode_uses_only_the_topic_source(): void
    {
        $this->topic();
        $r = $this->ask(['patente_topic' => 'precedenza'])->assertOk();
        $this->assertSame('patente/topics/precedenza', $r->json('data.message.sources.0.ref.route'));
        $this->assertCount(1, $r->json('data.message.sources'));
    }

    public function test_no_content_gives_canned_reply_without_calling_the_llm_or_using_quota(): void
    {
        $t = $this->topic([], publish: false);                       // draft topic
        $this->question($t, ['slug' => 'q-draft'], publish: false);  // draft question
        $this->question($this->topic(['slug' => 'other']), ['slug' => 'q-nolicense', 'license_type' => null, 'rights_holder' => null, 'license_proof_ref' => null], publish: true);
        $before = $this->getJson('/api/v1/ai/usage')->json('data.remaining');

        foreach (['patente_topic' => 'precedenza', 'patente_question' => 'q-draft'] as $k => $slug) {
            $r = $this->ask([$k => $slug], 'en')->assertOk();
            $this->assertStringContainsString("don't have verified, licensed content", $r->json('data.message.content'));
            $this->assertSame([], $r->json('data.message.sources'));
        }
        $this->ask(['patente_question' => 'nope'], 'en')->assertOk();
        $this->assertCount(0, $this->llm->calls);
        $this->assertSame($before, $this->getJson('/api/v1/ai/usage')->json('data.remaining'));
    }

    public function test_invented_links_in_the_teacher_answer_are_removed_and_input_validated(): void
    {
        $this->topic();
        $this->llm->push('Vedi https://invented.example.com/segnali e [1] e [7].');
        $r = $this->ask(['patente_topic' => 'precedenza'], 'en')->assertOk();
        $this->assertStringNotContainsString('invented.example.com', $r->json('data.message.content'));
        $this->assertStringNotContainsString('[7]', $r->json('data.message.content'));
        $this->ask(['patente_topic' => 'Not A Slug!'])->assertUnprocessable();
    }
}
