<?php

namespace Tests\Feature\Search;

use App\Domains\Access\Services\AccessSynchronizer;
use App\Domains\Ai\Models\KnowledgeChunk;
use App\Domains\Ai\Services\KnowledgeIndexer;
use App\Domains\Geo\Models\City;
use App\Domains\Geo\Models\CityBlock;
use App\Domains\Geo\Models\CityProfile;
use App\Domains\Learning\Models\ItalianVocabulary;
use App\Domains\Legal\Models\LegalDocument;
use App\Domains\Marketplace\Services\VerificationService;
use App\Domains\Search\Models\SearchDocument;
use App\Domains\Search\Services\SearchIndexer;
use App\Events\ContentChanged;
use App\Models\User;
use Database\Seeders\GeographySeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Event;
use Tests\Support\MarketplaceFixtures;
use Tests\TestCase;

/** RA-1: city profiles, providers, vocabulary and legal documents are searchable; only sourced city blocks reach the AI index. */
class SearchExpansionTest extends TestCase
{
    use MarketplaceFixtures, RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        app(AccessSynchronizer::class)->sync();
        $this->seed(GeographySeeder::class);
    }

    private function profile(): CityProfile
    {
        $city = City::firstWhere('slug', 'torino');
        $p = new CityProfile(['city_id' => $city->id, 'slug' => 'torino']);
        $p->save();
        $p->setTranslations(['ar' => ['headline' => 'تورينو', 'summary' => 'مدينة'], 'en' => ['headline' => 'Turin', 'summary' => 'A city']]);
        $mk = function (string $key, array $src) use ($p) {
            $b = new CityBlock(['info_type' => $src ? 'official_info' : 'general_guidance', 'sort_order' => 0] + $src);
            $b->block_key = $key;
            $b->city_profile_id = $p->id;
            $b->save();
            $b->setTranslations(['ar' => ['title' => 'عنوان', 'body' => 'نص '.$key], 'en' => ['title' => 'Title', 'body' => 'Zebrafish '.$key]]);
        };
        $mk('transport', []);
        $mk('bureaucracy', ['source_name' => 'Comune di Torino', 'source_url' => 'https://www.comune.torino.it/x', 'source_type' => 'official', 'last_verified_at' => now()->subDay()]);
        $p->forceFill(['status' => 'published', 'published_at' => now()])->save();

        return $p->fresh();
    }

    public function test_city_profile_is_searchable_and_only_sourced_blocks_reach_the_ai_index(): void
    {
        $p = $this->profile();
        app(SearchIndexer::class)->sync($p);
        app(KnowledgeIndexer::class)->sync($p);

        $this->assertSame(2, SearchDocument::where('type', 'city_profile')->count());
        $this->getJson('/api/v1/search?q=Zebrafish&locale=en')->assertOk()->assertJsonFragment(['type' => 'city_profile']);

        $chunks = KnowledgeChunk::where('item_type', 'city_profile')->get();
        $this->assertCount(2, $chunks); // ar + en for the single sourced block
        $this->assertSame(['bureaucracy'], $chunks->pluck('section')->unique()->values()->all());
        $this->assertSame('torino', $chunks->first()->item_slug);

        $p->forceFill(['status' => 'archived'])->save();
        app(SearchIndexer::class)->sync($p->fresh());
        app(KnowledgeIndexer::class)->sync($p->fresh());
        $this->assertSame(0, SearchDocument::where('type', 'city_profile')->count());
        $this->assertSame(0, KnowledgeChunk::where('item_type', 'city_profile')->count());
    }

    public function test_provider_is_searchable_only_while_listed_never_in_ai_index_and_follows_verification(): void
    {
        config(['marketplace.list_unverified' => false]);
        $p = $this->provider(['display_name' => 'Studio Quokka']);
        $p->forceFill(['verification_status' => 'verified', 'verified_at' => now(), 'verification_expires_at' => now()->addDays(10)])->save();
        $idx = app(SearchIndexer::class);
        $idx->sync($p->fresh());
        $this->assertGreaterThan(0, SearchDocument::where('type', 'provider')->count());
        $this->getJson('/api/v1/search?q=Quokka&locale=en')->assertOk()->assertJsonFragment(['type' => 'provider']);

        app(KnowledgeIndexer::class)->sync($p->fresh());
        $this->assertSame(0, KnowledgeChunk::where('item_type', 'provider')->count());

        // verification expires -> scheduled prune removes it
        $this->travel(11)->days();
        $this->assertGreaterThan(0, $idx->pruneProviders());
        $this->assertSame(0, SearchDocument::where('type', 'provider')->count());
    }

    public function test_verification_approval_dispatches_reindex_event(): void
    {
        Event::fake([ContentChanged::class]);
        $p = $this->provider();
        $admin = User::factory()->create();
        app(VerificationService::class)->approve($p, $admin, 'checked');
        Event::assertDispatched(ContentChanged::class);
    }

    public function test_vocabulary_and_legal_documents_are_searchable_but_not_in_ai_index(): void
    {
        $v = new ItalianVocabulary(['slug' => 'sportello', 'lemma' => 'sportello', 'part_of_speech' => 'noun', 'level' => 'a1', 'category' => 'office', 'example_it' => 'Vado allo sportello.']);
        $v->save();
        $v->setTranslations(['ar' => ['gloss' => 'شباك'], 'en' => ['gloss' => 'counter']]);
        $v->forceFill(['status' => 'published', 'published_at' => now()])->save();
        $d = new LegalDocument(['slug' => 'terms', 'version' => '2026-01-01']);
        $d->save();
        $d->setTranslations(['ar' => ['title' => 'الشروط', 'body' => 'نص تجريبي'], 'en' => ['title' => 'Terms', 'body' => 'Test text only']]);
        $d->forceFill(['status' => 'published', 'published_at' => now()])->save();
        app(SearchIndexer::class)->sync($v->fresh());
        app(SearchIndexer::class)->sync($d->fresh());

        $this->getJson('/api/v1/search?q=sportello&locale=en')->assertOk()->assertJsonFragment(['type' => 'italian_vocabulary']);
        $this->getJson('/api/v1/search?q=Terms&locale=en')->assertOk()->assertJsonFragment(['type' => 'legal_document']);
        $this->assertSame('office', SearchDocument::where('type', 'italian_vocabulary')->first()->meta['category']);
        $this->assertSame(0, KnowledgeChunk::count());
    }
}
