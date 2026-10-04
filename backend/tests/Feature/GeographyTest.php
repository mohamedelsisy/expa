<?php

namespace Tests\Feature;

use App\Domains\Access\Services\AccessSynchronizer;
use App\Domains\Geo\Models\City;
use App\Domains\Geo\Models\Region;
use App\Domains\Profile\Services\ConsentService;
use App\Models\User;
use Database\Seeders\GeographySeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class GeographyTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(GeographySeeder::class);
    }

    public function test_seeder_is_idempotent_and_complete(): void
    {
        $this->seed(GeographySeeder::class);

        $this->assertSame(20, Region::count());
        $this->assertSame(16, City::count());
        foreach (Region::with('translations')->get() as $r) {
            $this->assertSame([], $r->missingLocales(), $r->slug);
        }
        foreach (City::with('translations')->get() as $c) {
            $this->assertSame([], $c->missingLocales(), $c->slug);
        }
        $this->assertSame('lazio', City::firstWhere('slug', 'roma')->region->slug);
        $this->assertSame('lombardia', City::firstWhere('slug', 'milano')->region->slug);
    }

    public function test_regions_are_localized(): void
    {
        $ar = collect($this->getJson('/api/v1/regions', ['Accept-Language' => 'ar'])->assertOk()->json('data'));
        $en = collect($this->getJson('/api/v1/regions', ['Accept-Language' => 'en'])->json('data'));
        $it = collect($this->getJson('/api/v1/regions', ['Accept-Language' => 'it'])->json('data'));

        $this->assertCount(20, $ar);
        $this->assertSame('صقلية', $ar->firstWhere('slug', 'sicilia')['name']);
        $this->assertSame('Sicily', $en->firstWhere('slug', 'sicilia')['name']);
        $this->assertSame('Sicilia', $it->firstWhere('slug', 'sicilia')['name']);
    }

    public function test_cities_localized_filter_by_region_and_search(): void
    {
        $roma = $this->getJson('/api/v1/cities?region=lazio', ['Accept-Language' => 'ar'])->assertOk();
        $this->assertCount(1, $roma->json('data'));
        $this->assertSame('روما', $roma->json('data.0.name'));
        $this->assertSame('لاتسيو', $roma->json('data.0.region.name'));

        $this->assertCount(3, $this->getJson('/api/v1/cities?region=veneto')->json('data'));
        $this->assertCount(1, $this->getJson('/api/v1/cities?region=12')->json('data')); // by ISTAT code
        $this->assertSame('milano', $this->getJson('/api/v1/cities?q=Milan', ['Accept-Language' => 'en'])->json('data.0.slug'));
        $this->assertSame('napoli', $this->getJson('/api/v1/cities?q='.urlencode('نابولي'), ['Accept-Language' => 'ar'])->json('data.0.slug'));
        $this->assertSame([], $this->getJson('/api/v1/cities?q=%25')->json('data'));
    }

    public function test_cities_endpoint_does_not_n_plus_one(): void
    {
        $queries = 0;
        \DB::listen(function () use (&$queries) {
            $queries++;
        });
        $this->getJson('/api/v1/cities')->assertOk();

        $this->assertLessThanOrEqual(5, $queries, "cities endpoint ran $queries queries");
    }

    public function test_profile_city_can_be_set_validated_and_is_localized(): void
    {
        app(AccessSynchronizer::class)->sync();
        $user = User::factory()->create();
        app(ConsentService::class)->record($user, ['profile_personalization' => true]);
        $this->actingAs($user, 'sanctum');

        $roma = City::firstWhere('slug', 'roma');
        $this->patchJson('/api/v1/profile', ['city_id' => 99999])->assertStatus(422)
            ->assertJsonStructure(['error' => ['details' => ['city_id']]]);

        $this->patchJson('/api/v1/profile', ['city_id' => $roma->id], ['Accept-Language' => 'ar'])->assertOk()
            ->assertJsonPath('data.city.slug', 'roma')->assertJsonPath('data.city.name', 'روما')
            ->assertJsonPath('data.onboarding.steps.2', ['key' => 'city', 'required' => false, 'status' => 'answered']);

        $this->getJson('/api/v1/profile', ['Accept-Language' => 'it'])->assertJsonPath('data.city.name', 'Roma');
        $this->getJson('/api/v1/profile/export')->assertJsonPath('data.profile.city', 'roma');
    }

    public function test_city_deletion_nulls_profile_reference(): void
    {
        $user = User::factory()->create();
        $city = City::firstWhere('slug', 'bari');
        $profile = $user->profile()->create(['city_id' => $city->id]);

        $city->delete();
        $this->assertNull($profile->fresh()->city_id);
    }
}
