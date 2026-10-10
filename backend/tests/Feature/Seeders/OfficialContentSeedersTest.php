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
 * All official content packs must be seedable, idempotent, trilingual and pass publishing validation.
 */
class OfficialContentSeedersTest extends TestCase
{
    use RefreshDatabase;

    public function test_database_seeder_seeds_all_official_packs_published_and_searchable(): void
    {
        $this->seed(DatabaseSeeder::class);

        $this->assertSame(44, Guide::count());
        $this->assertSame(23, GovernmentService::count());
        $this->assertSame(1, CityProfile::count());

        foreach ([
            'permesso-di-soggiorno-rinnovo-roma',
            'patente-b-italia',
            'spid-per-servizi-pubblici',
            'codice-fiscale-stranieri',
            'isee-2026',
            'registrazione-contratto-affitto',
            'assegno-inclusione-2026',
            'oepac-roma-2026-2027',
            'ssn-healthcare-registration-foreigners',
            'isee-dsu-how-to-apply',
            'register-rental-contract-italy',
            'family-reunification-italy',
            'study-finder-universitaly-international-students',
            'employment-contract-and-payslip-basics',
            'open-partita-iva-first-steps',
            'permesso-soggiorno-renewal-checklist',
            'codice-fiscale-request-and-corrections',
            'patente-b-driving-exam-roadmap',
            'choose-family-doctor-roma',
            'residenza-anagrafica-change-address',
            'university-scholarships-italy',
            'employment-payslip-checklist',
            'partita-iva-starting-checklist',
            'family-marriage-documents-italy',
            'rental-home-viewing-checklist',
            'italian-language-course-levels',
        ] as $slug) {
            $this->assertTrue(Guide::where('slug', $slug)->where('status', 'published')->exists(), "$slug is published in testing");
        }

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

        foreach (['V1', 'V2', 'V3', 'V4', 'V5', 'V6'] as $v) {
            $this->artisan('db:seed', ['--class' => "Database\\Seeders\\OfficialContent{$v}Seeder", '--force' => true])->assertSuccessful();
        }

        $this->assertSame($counts, [Guide::count(), GovernmentService::count(), CityProfile::count()]);
    }

    public function test_outside_local_and_testing_the_packs_go_to_review_not_published(): void
    {
        $this->app['env'] = 'production';
        $this->artisan('db:seed', ['--class' => DatabaseSeeder::class, '--force' => true])->assertSuccessful();

        $this->assertSame(0, Guide::where('status', 'published')->count());
        $this->assertSame(44, Guide::where('status', 'review')->count());
    }
}
