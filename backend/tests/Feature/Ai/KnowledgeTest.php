<?php

namespace Tests\Feature\Ai;

use App\Domains\Access\Services\AccessSynchronizer;
use App\Domains\Ai\Models\KnowledgeChunk;
use App\Domains\Ai\Services\IntentDetector;
use App\Domains\Ai\Services\KeywordRetriever;
use App\Domains\Ai\Services\KnowledgeIndexer;
use App\Domains\Government\Models\GovernmentOffice;
use App\Domains\Guides\Models\Guide;
use App\Enums\ContentStatus;
use App\Enums\SourceType;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

class KnowledgeTest extends TestCase
{
    use RefreshDatabase;

    private function guide(array $attrs = [], ?array $translations = null, bool $publish = true): Guide
    {
        $g = Guide::factory()->create($attrs + ['slug' => 'g'.random_int(1, 999999)]);
        $g->setTranslations($translations ?? [
            'ar' => ['title' => 'الرقم الضريبي', 'summary' => 'ملخص', 'what_is' => 'الرقم الضريبي هو رمز تعريف أساسي', 'steps' => [['title' => 'قدّم الطلب', 'text' => 'في وكالة الإيرادات']]],
            'it' => ['title' => 'Codice fiscale', 'summary' => 'Sintesi', 'what_is' => 'Il codice fiscale è un identificativo'],
        ]);
        if ($publish) {
            $g->forceFill(['status' => 'published'])->save();
        }
        app(KnowledgeIndexer::class)->sync($g->fresh());

        return $g->fresh();
    }

    // ---- indexer ------------------------------------------------------------------------------

    public function test_published_content_is_chunked_per_locale_and_section_with_source(): void
    {
        $g = $this->guide(['italian_term' => 'Codice fiscale']);

        $chunks = KnowledgeChunk::where('item_id', $g->id)->get();
        $this->assertEqualsCanonicalizing(['ar', 'it'], $chunks->pluck('locale')->unique()->values()->all());
        $this->assertTrue($chunks->where('locale', 'ar')->pluck('section')->contains('steps'));
        $this->assertStringContainsString('- قدّم الطلب: في وكالة الإيرادات', $chunks->where('section', 'steps')->where('locale', 'ar')->first()->content);
        $c = $chunks->first();
        $this->assertSame($g->source_url, $c->source_url);
        $this->assertSame(SourceType::Official, $c->source_type);
        $this->assertSame('guide', $c->item_type);
    }

    public function test_drafts_unpublished_deleted_and_sourceless_content_are_never_indexed(): void
    {
        $draft = $this->guide(publish: false);
        $this->assertSame(0, KnowledgeChunk::where('item_id', $draft->id)->count());

        $g = $this->guide();
        $this->assertGreaterThan(0, KnowledgeChunk::where('item_id', $g->id)->count());

        $g->forceFill(['status' => ContentStatus::Approved])->save();
        app(KnowledgeIndexer::class)->sync($g->fresh());
        $this->assertSame(0, KnowledgeChunk::where('item_id', $g->id)->count());

        $g->forceFill(['status' => 'published', 'source_name' => null])->save();
        app(KnowledgeIndexer::class)->sync($g->fresh());
        $this->assertSame(0, KnowledgeChunk::where('item_id', $g->id)->count(), 'no source name');

        $g->forceFill(['source_name' => 'X', 'source_url' => 'http://insecure.example'])->save();
        app(KnowledgeIndexer::class)->sync($g->fresh());
        $this->assertSame(0, KnowledgeChunk::where('item_id', $g->id)->count(), 'non-https source');

        $g->forceFill(['source_url' => 'https://www.inps.it/x'])->save();
        app(KnowledgeIndexer::class)->sync($g->fresh());
        $g->delete();
        app(KnowledgeIndexer::class)->sync($g);
        $this->assertSame(0, KnowledgeChunk::where('item_id', $g->id)->count(), 'soft-deleted');
    }

    public function test_workflow_transitions_keep_the_index_in_step_automatically(): void
    {
        $g = Guide::factory()->translated()->create();
        $g->forceFill(['status' => 'approved'])->save();
        $this->assertSame(0, KnowledgeChunk::count());

        $g->transitionTo(ContentStatus::Published);
        $this->assertGreaterThan(0, KnowledgeChunk::where('item_id', $g->id)->count());

        $g->transitionTo(ContentStatus::Approved);
        $this->assertSame(0, KnowledgeChunk::count());
    }

    public function test_admin_edits_of_live_content_reach_the_index(): void
    {
        $g = $this->guide();
        $admin = User::factory()->create();
        app(AccessSynchronizer::class)->sync();
        $admin->syncRoleKeys(['content_manager']);

        $this->actingAs($admin, 'sanctum')->patchJson("/api/v1/admin/guides/{$g->id}", ['translations' => ['ar' => ['title' => 'عنوان جديد', 'summary' => 's', 'what_is' => 'نص محدّث فريد']]])->assertOk();

        $this->assertTrue(KnowledgeChunk::where('item_id', $g->id)->where('locale', 'ar')->where('content', 'like', '%نص محدّث فريد%')->exists());
    }

    public function test_office_facts_get_their_own_chunk_and_reindex_command_rebuilds(): void
    {
        $o = GovernmentOffice::factory()->translated()->create(['address' => 'Via Test 1', 'phone' => '+39 06 1234567']);
        $o->forceFill(['status' => 'published'])->save();

        KnowledgeChunk::query()->delete();
        $this->artisan('expa:ai-reindex')->expectsOutputToContain('Indexed 1')->assertSuccessful();

        $details = KnowledgeChunk::where('section', 'details')->first();
        $this->assertStringContainsString('Via Test 1', $details->content);
        $this->assertStringContainsString('+39 06 1234567', $details->content);
    }

    // ---- retrieval ----------------------------------------------------------------------------

    public function test_arabic_question_finds_the_arabic_guide_despite_diacritics_and_article(): void
    {
        $g = $this->guide();
        $hits = app(KeywordRetriever::class)->retrieve('ما هو الرَّقْم الضريبى؟', 'ar');
        $this->assertSame($g->id, $hits->first()['chunk']->item_id);
    }

    public function test_italian_term_matches_across_languages(): void
    {
        $g = $this->guide(['italian_term' => 'Codice fiscale']);
        $hits = app(KeywordRetriever::class)->retrieve('cos\'è il codice fiscale', 'it');
        $this->assertSame('it', $hits->first()['chunk']->locale);

        // An Arabic user typing the Italian term still finds it (served from ar with fallback ordering)
        $this->assertSame($g->id, app(KeywordRetriever::class)->retrieve('Codice fiscale', 'ar')->first()['chunk']->item_id);
    }

    public function test_unrelated_questions_return_nothing(): void
    {
        $this->guide();
        $this->assertCount(0, app(KeywordRetriever::class)->retrieve('best pizza recipe', 'en'));
        $this->assertCount(0, app(KeywordRetriever::class)->retrieve('???', 'en'));
        $this->assertCount(0, app(KeywordRetriever::class)->retrieve('the a of', 'en')); // only stopwords
    }

    public function test_requested_locale_outranks_fallback_and_items_are_capped(): void
    {
        $g = $this->guide(['italian_term' => 'Codice fiscale']);
        $top = app(KeywordRetriever::class)->retrieve('codice fiscale', 'it')->first();
        $this->assertSame('it', $top['chunk']->locale);

        $perItem = app(KeywordRetriever::class)->retrieve('codice fiscale', 'it')->groupBy(fn ($r) => $r['chunk']->item_id)->map->count();
        $this->assertLessThanOrEqual(config('ai.retrieval.max_chunks_per_item'), $perItem[$g->id]);
    }

    public function test_stale_sources_rank_below_fresh_ones(): void
    {
        $fresh = $this->guide(['last_verified_at' => now()->subDays(5)], ['ar' => ['title' => 'تجديد الإقامة', 'summary' => 's', 'what_is' => 'نص']]);
        $old = $this->guide(['last_verified_at' => now()->subDays(500)], ['ar' => ['title' => 'تجديد الإقامة', 'summary' => 's', 'what_is' => 'نص']]);

        $order = app(KeywordRetriever::class)->retrieve('تجديد الإقامة', 'ar')->map(fn ($r) => $r['chunk']->item_id)->unique()->values()->all();
        $this->assertSame([$fresh->id, $old->id], $order);
    }

    public function test_retrieval_only_sees_published_chunks(): void
    {
        $this->guide(publish: false);
        $this->assertCount(0, app(KeywordRetriever::class)->retrieve('الرقم الضريبي', 'ar'));
    }

    // ---- intents ------------------------------------------------------------------------------

    public static function intents(): array
    {
        return [
            ['أنا جديد في إيطاليا، أعمل إيه أول حاجة؟', 'general'],
            ['كيف أجدد تصريح الإقامة؟', 'immigration'],
            ['How can I renew my residence permit?', 'immigration'],
            ['Come posso ottenere la residenza?', 'documents'],
            ['ما هو الرقم الضريبي', 'documents'],
            ['كيف أحجز موعد في الكويستورا', 'appointments'],
            ['I want to book an appointment at the Questura', 'appointments'],
            ['where can I find a job as a developer', 'jobs'],
            ['voglio studiare all\'università', 'study'],
            ['how do I get the driving licence', 'patente'],
            ['affitto una casa, il contratto di locazione è giusto?', 'housing'],
            ['I need a doctor, where is the hospital', 'health'],
            ['how much tax do I pay on my salary', 'money'],
            ['Partita IVA regime forfettario', 'business'],
            ['I have chest pain', 'emergency'],
            ['ho bisogno di un\'ambulanza', 'emergency'],
            ['أحتاج اسعاف', 'emergency'],
            ['hello there', 'general'],
        ];
    }

    #[DataProvider('intents')]
    public function test_intent_detection(string $message, string $expected): void
    {
        $this->assertSame($expected, app(IntentDetector::class)->detect($message));
    }

    public function test_sensitivity_flags(): void
    {
        $d = app(IntentDetector::class);
        foreach (['immigration', 'documents', 'health', 'money', 'business', 'housing', 'appointments', 'patente', 'study'] as $i) {
            $this->assertTrue($d->isSensitive($i), $i);
        }
        foreach (['general', 'jobs', 'learning', 'emergency'] as $i) {
            $this->assertFalse($d->isSensitive($i), $i);
        }
    }
}
