<?php

namespace Tests\Feature\Seeders;

use App\Domains\Content\Services\PublishGuard;
use App\Domains\Geo\Models\CityProfile;
use App\Domains\Government\Models\GovernmentService;
use App\Domains\Guides\Models\Guide;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * The official content packs (V1-V4) must stay seedable, idempotent, complete in ar/en/it and valid for the publish
 * guard. In local/testing they are seeded as published so the app is immediately useful; elsewhere they are in review.
 */
class OfficialContentSeedersTest extends TestCase
{
    use RefreshDatabase;

    public function test_database_seeder_seeds_all_official_packs_published_and_searchable(): void
    {
        $this->seed(DatabaseSeeder::class);

        $this->assertSame(26, Guide::count());
        $this->assertSame(23, GovernmentService::count());
        $this->assertSame(1, CityProfile::count());

        foreach (['permesso-di-soggiorno-rinnovo-roma', 'patente-b-italia', 'spid-per-servizi-pubblici', 'codice-fiscale-stranieri',
            'isee-2026', 'registrazione-contratto-affitto', 'assegno-inclusione-2026', 'oepac-roma-2026-2027'] as $slug) {
            $this->assertTrue(Guide::where('slug', $slug)->where('status', 'published')->exists(), "$slug is published in testing");
        }

        // Search was reindexed by the seeder (seeders do not fire ContentChanged).
        $this->getJson('/api/v1/search?q=ISEE')->assertOk()->assertJsonPath('data.0.type', fn ($t) => in_array($t, ['guide', 'government_service'], true));
    }

    public function test_every_seeded_record_is_trilingual_sourced_and_passes_the_publish_guard(): void
    {
        $this->seed(DatabaseSeeder::class);
        $guard = app(PublishGuard::class);

        foreach ([Guide::with('translations')->get(), GovernmentService::with('translations')->get()] as $items) {
            foreach ($items as $item) {
                $this->assertSame(['ar', 'en', 'it'], $item->translations->pluck('locale')->sort()->values()->all(), "{$item->slug} has ar, en and it");
                $this->assertSame('official', $item->source_type->value ?? $item->source_type);
                $this->assertNotEmpty($item->source_name);
                $this->assertNotNull($item->last_verified_at);
                $this->assertSame([], $guard->problems($item), "{$item->slug} has no publish problems");
            }
        }

        $profile = CityProfile::with('blocks.translations')->firstOrFail();
        $this->assertSame([], $guard->problems($profile));
        $this->assertCount(5, $profile->blocks);
        foreach ($profile->blocks as $block) {
            $this->assertSame(['ar', 'en', 'it'], $block->translations->pluck('locale')->sort()->values()->all());
            $this->assertNotEmpty($block->source_url);
        }
    }

    public function test_reseeding_is_idempotent(): void
    {
        $this->seed(DatabaseSeeder::class);
        $counts = [Guide::count(), GovernmentService::count(), CityProfile::count()];

        foreach (['V1', 'V2', 'V3', 'V4'] as $v) {
            $this->artisan('db:seed', ['--class' => "Database\\Seeders\\OfficialContent{$v}Seeder", '--force' => true])->assertSuccessful();
        }

        $this->assertSame($counts, [Guide::count(), GovernmentService::count(), CityProfile::count()]);
    }

    public function test_outside_local_and_testing_the_packs_go_to_review_not_published(): void
    {
        $this->app['env'] = 'production';
        $this->artisan('db:seed', ['--class' => DatabaseSeeder::class, '--force' => true])->assertSuccessful();

        $this->assertSame(0, Guide::where('status', 'published')->count());
        $this->assertSame(26, Guide::where('status', 'review')->count());
    }
}
