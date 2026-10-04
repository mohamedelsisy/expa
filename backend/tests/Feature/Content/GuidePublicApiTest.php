<?php

namespace Tests\Feature\Content;

use App\Domains\Geo\Models\City;
use App\Domains\Guides\Enums\GuideCategory;
use App\Domains\Guides\Models\Guide;
use Database\Seeders\GeographySeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class GuidePublicApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(GeographySeeder::class);
    }

    public function test_only_published_guides_are_visible(): void
    {
        Guide::factory()->published()->create(['slug' => 'live']);
        Guide::factory()->translated()->create(['slug' => 'draft']);
        foreach (['review', 'approved', 'archived'] as $status) {
            Guide::factory()->translated()->create(['slug' => $status])->forceFill(['status' => $status])->save();
        }

        $this->getJson('/api/v1/guides')->assertOk()->assertJsonPath('meta.total', 1)->assertJsonPath('data.0.slug', 'live');
        $this->getJson('/api/v1/guides/live')->assertOk();
        foreach (['draft', 'review', 'approved', 'archived'] as $slug) {
            $this->getJson("/api/v1/guides/$slug")->assertNotFound()->assertJsonPath('error.code', 'not_found');
        }
    }

    public function test_soft_deleted_guides_are_hidden(): void
    {
        $g = Guide::factory()->published()->create(['slug' => 'gone']);
        $g->delete();
        $this->getJson('/api/v1/guides/gone')->assertNotFound();
    }

    public function test_detail_returns_full_localized_template_with_source_and_italian_term(): void
    {
        $g = Guide::factory()->published()->create(['slug' => 'permesso', 'italian_term' => 'Permesso di soggiorno']);
        $g->setTranslations(['ar' => [
            'title' => 'تصريح الإقامة', 'summary' => 'ملخص', 'what_is' => 'ما هو', 'who_needs' => 'من يحتاجه',
            'required_documents' => ['جواز السفر', 'صور'], 'steps' => [['title' => 'الخطوة 1', 'text' => 'نص']],
            'where_to_apply' => 'مكتب البريد', 'how_to_book' => 'عبر الموقع', 'costs' => 'انظر المصدر', 'processing_time' => 'حسب المصدر',
        ]]);

        $res = $this->getJson('/api/v1/guides/permesso', ['Accept-Language' => 'ar'])->assertOk();
        $res->assertJsonPath('data.title', 'تصريح الإقامة')
            ->assertJsonPath('data.italian_term', 'Permesso di soggiorno')
            ->assertJsonPath('data.required_documents', ['جواز السفر', 'صور'])
            ->assertJsonPath('data.steps.0.title', 'الخطوة 1')
            ->assertJsonPath('data.category_label', 'الأوراق والوثائق')
            ->assertJsonPath('data.fallback', false)
            ->assertJsonPath('data.source.type', 'official')
            ->assertJsonPath('data.source.freshness', 'fresh')
            ->assertJsonPath('data.applies_to', 'national');
        $this->assertNotNull($res->json('data.source.url'));
        $this->assertNotNull($res->json('data.source.last_verified_at'));
    }

    public function test_each_locale_is_served_and_fallback_is_flagged(): void
    {
        Guide::factory()->published()->create(['slug' => 'g1']);
        foreach (['ar', 'en', 'it'] as $l) {
            $this->getJson('/api/v1/guides/g1', ['Accept-Language' => $l])
                ->assertJsonPath('data.locale', $l)->assertJsonPath('data.fallback', false)
                ->assertJsonPath('meta.locale', $l);
        }

        $g = Guide::factory()->create(['slug' => 'only-ar']);
        $g->setTranslations(['ar' => ['title' => 'عربي فقط', 'summary' => 's', 'what_is' => 'w']]);
        $g->forceFill(['status' => 'published'])->save();

        $this->getJson('/api/v1/guides/only-ar', ['Accept-Language' => 'it'])
            ->assertJsonPath('data.title', 'عربي فقط')->assertJsonPath('data.locale', 'ar')
            ->assertJsonPath('data.fallback', true)->assertJsonPath('data.available_locales', ['ar']);
    }

    public function test_stale_and_outdated_sources_are_visible_to_clients(): void
    {
        Guide::factory()->published()->create(['slug' => 'old', 'last_verified_at' => now()->subDays(400)]);
        Guide::factory()->published()->create(['slug' => 'mid', 'last_verified_at' => now()->subDays(200)]);

        $this->getJson('/api/v1/guides/old')->assertJsonPath('data.source.freshness', 'outdated');
        $this->getJson('/api/v1/guides/mid')->assertJsonPath('data.source.freshness', 'stale');
    }

    public function test_filter_by_category_and_search(): void
    {
        Guide::factory()->published()->create(['slug' => 'a', 'category' => GuideCategory::Housing, 'italian_term' => 'Contratto di locazione']);
        Guide::factory()->published()->create(['slug' => 'b', 'category' => GuideCategory::Work]);

        $this->getJson('/api/v1/guides?category=housing')->assertJsonPath('meta.total', 1)->assertJsonPath('data.0.slug', 'a');
        $this->getJson('/api/v1/guides?category=nope')->assertStatus(422);
        $this->getJson('/api/v1/guides?q=locazione')->assertJsonPath('meta.total', 1);
        $this->getJson('/api/v1/guides?q=Test+title')->assertJsonPath('meta.total', 2);
        $this->getJson('/api/v1/guides?q=%25')->assertJsonPath('meta.total', 0);
    }

    public function test_arabic_search_matches_arabic_titles(): void
    {
        $g = Guide::factory()->published()->create(['slug' => 'ar-search']);
        $g->setTranslations(['ar' => ['title' => 'الرقم الضريبي', 'summary' => 's', 'what_is' => 'w']]);

        $this->getJson('/api/v1/guides?q='.urlencode('الضريبي'))->assertJsonPath('meta.total', 1);
    }

    public function test_place_applicability_national_region_and_city(): void
    {
        $roma = City::firstWhere('slug', 'roma');
        $milano = City::firstWhere('slug', 'milano');

        Guide::factory()->published()->create(['slug' => 'national']);
        Guide::factory()->published()->create(['slug' => 'lazio-only', 'region_id' => $roma->region_id]);
        Guide::factory()->published()->create(['slug' => 'roma-only', 'region_id' => $roma->region_id, 'city_id' => $roma->id]);
        Guide::factory()->published()->create(['slug' => 'milano-only', 'region_id' => $milano->region_id, 'city_id' => $milano->id]);

        $slugs = fn (string $qs) => collect($this->getJson("/api/v1/guides?$qs")->json('data'))->pluck('slug')->sort()->values()->all();

        $this->assertSame(['lazio-only', 'national', 'roma-only'], $slugs('city=roma'));
        $this->assertSame(['milano-only', 'national'], $slugs('city=milano'));
        // A region view shows national + region-level guides, not city-specific ones.
        $this->assertSame(['lazio-only', 'national'], $slugs('region=lazio'));
    }

    public function test_unknown_place_returns_empty_not_everything(): void
    {
        Guide::factory()->published()->create();
        $this->getJson('/api/v1/guides?city=atlantis')->assertOk()->assertJsonPath('meta.total', 0);
    }

    public function test_pagination_and_ordering(): void
    {
        foreach (range(1, 5) as $i) {
            Guide::factory()->published()->create(['slug' => "g$i", 'sort_order' => 10 - $i]);
        }
        $res = $this->getJson('/api/v1/guides?per_page=2&page=1')->assertOk();
        $res->assertJsonPath('meta.total', 5)->assertJsonPath('meta.last_page', 3)->assertJsonCount(2, 'data');
        $this->assertSame(['g5', 'g4'], collect($res->json('data'))->pluck('slug')->all());
        $this->getJson('/api/v1/guides?per_page=500')->assertStatus(422);
    }

    public function test_list_does_not_n_plus_one(): void
    {
        Guide::factory()->published()->count(15)->create();
        $count = 0;
        DB::listen(function () use (&$count) {
            $count++;
        });
        $this->getJson('/api/v1/guides?per_page=15')->assertOk();

        $this->assertLessThanOrEqual(8, $count, "ran $count queries");
    }

    public function test_list_is_light_and_detail_is_cacheable(): void
    {
        Guide::factory()->published()->create(['slug' => 'x']);
        $list = $this->getJson('/api/v1/guides')->assertOk();
        $this->assertArrayNotHasKey('steps', $list->json('data.0'));
        $this->assertArrayNotHasKey('body', $list->json('data.0'));
        $this->assertStringContainsString('max-age=300', $this->getJson('/api/v1/guides/x')->headers->get('Cache-Control'));
        $this->assertStringContainsString('Accept-Language', $this->getJson('/api/v1/guides/x')->headers->get('Vary'));
    }

    public function test_categories_are_localized(): void
    {
        $this->assertSame('رخصة القيادة (Patente)', collect($this->getJson('/api/v1/guides/categories', ['Accept-Language' => 'ar'])->json('data'))->firstWhere('value', 'driving')['label']);
        $this->assertSame('Lavoro', collect($this->getJson('/api/v1/guides/categories', ['Accept-Language' => 'it'])->json('data'))->firstWhere('value', 'work')['label']);
    }

    public function test_guides_slug_route_does_not_swallow_categories(): void
    {
        $this->getJson('/api/v1/guides/categories')->assertOk()->assertJsonStructure(['data' => [['value', 'label']]]);
    }
}
