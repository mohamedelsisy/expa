<?php

namespace Tests\Feature\Articles;

use App\Domains\Access\Services\AccessSynchronizer;
use App\Domains\Articles\Models\Article;
use App\Domains\Geo\Models\City;
use App\Domains\Geo\Models\CityProfile;
use App\Domains\Guides\Models\Guide;
use App\Domains\Search\Models\SearchDocument;
use App\Models\User;
use Database\Seeders\GeographySeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ArticlesAndCitiesTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        app(AccessSynchronizer::class)->sync();
        $this->seed(GeographySeeder::class);
    }

    private function as(string $role): User
    {
        $u = User::factory()->create();
        $u->syncRoleKeys([$role]);
        $this->actingAs($u, 'sanctum');

        return $u;
    }

    private function article(array $over = []): array
    {
        return array_replace_recursive([
            'slug' => 'first-month-in-italy', 'category' => 'tips', 'tags' => ['arrival', 'checklist'],
            'translations' => [
                'ar' => ['title' => 'شهرك الأول', 'excerpt' => 'ملخص', 'body' => 'نص المقال'],
                'en' => ['title' => 'First month', 'excerpt' => 'Summary', 'body' => 'Body'],
            ],
        ], $over);
    }

    private function publishArticle(array $over = []): array
    {
        $this->as('content_manager');
        $a = $this->postJson('/api/v1/admin/articles', $this->article($over))->assertCreated()->json('data');
        // four-eyes: a second person approves, a publisher publishes
        $this->as('admin');
        foreach (['review', 'approved', 'published'] as $to) {
            $this->postJson("/api/v1/admin/articles/{$a['id']}/transition", ['to' => $to])->assertOk();
        }

        return $a;
    }

    public function test_admin_crud_requires_permissions(): void
    {
        $this->getJson('/api/v1/admin/articles')->assertUnauthorized();
        $this->as('user');
        $this->getJson('/api/v1/admin/articles')->assertForbidden();
        $this->as('provider');
        $this->postJson('/api/v1/admin/articles', $this->article())->assertForbidden();
        $this->as('moderator');
        $this->getJson('/api/v1/admin/articles')->assertForbidden();
    }

    public function test_draft_is_not_public_and_published_article_is_with_related_guide(): void
    {
        $guide = Guide::factory()->published()->create(['slug' => 'codice-fiscale']);
        $this->as('editor');
        $a = $this->postJson('/api/v1/admin/articles', $this->article(['related_guides' => ['codice-fiscale']]))->assertCreated()->json('data');
        $this->getJson('/api/v1/articles/first-month-in-italy')->assertNotFound();
        $this->getJson('/api/v1/articles')->assertOk()->assertJsonCount(0, 'data');

        $this->as('admin');
        foreach (['review', 'approved', 'published'] as $to) {
            $this->postJson("/api/v1/admin/articles/{$a['id']}/transition", ['to' => $to])->assertOk();
        }
        $this->app['auth']->forgetGuards();

        $r = $this->withHeader('Accept-Language', 'ar')->getJson('/api/v1/articles/first-month-in-italy')->assertOk();
        $r->assertJsonPath('data.title', 'شهرك الأول')->assertJsonPath('data.content_type', 'editorial')
            ->assertJsonPath('data.source', null)->assertJsonPath('data.related_guides.0.slug', $guide->slug)
            ->assertJsonPath('data.tags', ['arrival', 'checklist'])->assertJsonPath('data.seo.canonical_path', '/articles/first-month-in-italy');
        $this->assertNotEmpty($r->json('data.disclaimer'));
        $this->assertDatabaseHas('search_documents', ['type' => 'article', 'slug' => 'first-month-in-italy', 'locale' => 'ar']);
    }

    public function test_listing_filters_sort_whitelist_and_pagination(): void
    {
        $this->publishArticle();
        $this->publishArticle(['slug' => 'rome-tips', 'category' => 'city_life', 'tags' => ['rome'], 'city_id' => City::firstWhere('slug', 'roma')->id,
            'translations' => ['ar' => ['title' => 'روما'], 'en' => ['title' => 'Rome']]]);
        $this->app['auth']->forgetGuards();

        $this->getJson('/api/v1/articles?category=city_life')->assertJsonCount(1, 'data')->assertJsonPath('data.0.slug', 'rome-tips');
        $this->getJson('/api/v1/articles?city=roma')->assertJsonCount(1, 'data');
        $this->getJson('/api/v1/articles?tag=arrival')->assertJsonCount(1, 'data')->assertJsonPath('data.0.slug', 'first-month-in-italy');
        $this->getJson('/api/v1/articles?q=Rome')->assertJsonCount(1, 'data');
        $this->getJson('/api/v1/articles?per_page=1')->assertJsonPath('meta.total', 2)->assertJsonPath('meta.last_page', 2);
        $this->getJson('/api/v1/articles?sort=title')->assertOk();
        $this->getJson('/api/v1/articles?sort=password')->assertUnprocessable();
        $this->getJson('/api/v1/articles?category=nope')->assertUnprocessable();
    }

    public function test_partial_or_non_official_source_blocks_publishing_and_https_is_enforced(): void
    {
        $this->as('content_manager');
        $a = $this->postJson('/api/v1/admin/articles', $this->article(['source_name' => 'Only a name']))->assertCreated()->json('data');
        $this->postJson("/api/v1/admin/articles/{$a['id']}/transition", ['to' => 'review'])->assertOk();
        $this->as('admin');
        $this->postJson("/api/v1/admin/articles/{$a['id']}/transition", ['to' => 'approved'])->assertOk();
        $this->postJson("/api/v1/admin/articles/{$a['id']}/transition", ['to' => 'published'])->assertUnprocessable()->assertJsonPath('error.code', 'content_not_publishable');

        $this->postJson('/api/v1/admin/articles', $this->article(['slug' => 'x2', 'cover_image_url' => 'http://insecure.test/a.png']))->assertUnprocessable();
        $this->postJson('/api/v1/admin/articles', $this->article(['slug' => 'x3', 'tags' => ['Bad Tag']]))->assertUnprocessable();
        $this->postJson('/api/v1/admin/articles', $this->article(['slug' => 'x4', 'related_guides' => ['missing']]))->assertUnprocessable();
    }

    public function test_html_is_stripped_and_unpublish_removes_from_search(): void
    {
        $a = $this->publishArticle(['translations' => ['ar' => ['title' => '<script>x</script>عنوان']]]);
        $this->assertSame('xعنوان', Article::find($a['id'])->localized('title', 'ar'));
        $this->assertSame(2, SearchDocument::where('type', 'article')->count());
        $this->postJson("/api/v1/admin/articles/{$a['id']}/transition", ['to' => 'approved'])->assertOk();
        $this->assertSame(0, SearchDocument::where('type', 'article')->count());
    }

    public function test_city_profile_lifecycle_blocks_and_sources(): void
    {
        $city = City::firstWhere('slug', 'milano');
        $payload = [
            'city_id' => $city->id,
            'translations' => ['ar' => ['headline' => 'ميلانو', 'summary' => 'ملخص']],
            'blocks' => [
                ['key' => 'transport', 'info_type' => 'general_guidance', 'translations' => ['ar' => ['title' => 'المواصلات', 'body' => 'نص']]],
                ['key' => 'bureaucracy', 'info_type' => 'official_info', 'translations' => ['ar' => ['title' => 'المكاتب', 'body' => 'نص']]],
            ],
        ];
        $this->as('content_manager');
        $p = $this->postJson('/api/v1/admin/city-profiles', $payload)->assertCreated()->assertJsonPath('data.blocks.1.key', 'bureaucracy')->json('data');
        $this->assertSame('milano', CityProfile::find($p['id'])->slug);
        $this->postJson('/api/v1/admin/city-profiles', $payload)->assertUnprocessable(); // one profile per city

        $this->postJson("/api/v1/admin/city-profiles/{$p['id']}/transition", ['to' => 'review'])->assertOk();
        $this->as('admin');
        $this->postJson("/api/v1/admin/city-profiles/{$p['id']}/transition", ['to' => 'approved'])->assertOk();
        // official block without a source cannot go live
        $this->postJson("/api/v1/admin/city-profiles/{$p['id']}/transition", ['to' => 'published'])->assertUnprocessable()
            ->assertJsonFragment(['code' => 'missing_source_field']);

        $payload['blocks'][1] += ['source_name' => 'Comune di Milano', 'source_url' => 'https://www.comune.milano.it/x', 'source_type' => 'official', 'last_verified_at' => now()->subDay()->toDateString()];
        unset($payload['city_id']);
        $this->putJson("/api/v1/admin/city-profiles/{$p['id']}", $payload)->assertOk();
        $this->postJson("/api/v1/admin/city-profiles/{$p['id']}/transition", ['to' => 'published'])->assertOk();
        $this->app['auth']->forgetGuards();

        $guide = Guide::factory()->published()->create(['category' => 'immigration', 'city_id' => $city->id]);
        $r = $this->getJson('/api/v1/cities/milano')->assertOk();
        $r->assertJsonPath('data.headline', 'ميلانو')->assertJsonPath('data.blocks.0.info_type', 'general_guidance')
            ->assertJsonPath('data.blocks.0.source', null)->assertJsonPath('data.blocks.1.source.name', 'Comune di Milano')
            ->assertJsonPath('data.guides.0.slug', $guide->slug);
        $this->getJson('/api/v1/city-profiles')->assertJsonCount(1, 'data');
        $this->getJson('/api/v1/cities/roma')->assertNotFound();

        // region/city hook for guides
        $this->getJson("/api/v1/guides/{$guide->slug}/local-info?city=milano")->assertOk()->assertJsonPath('data.block.key', 'bureaucracy');
        $this->getJson("/api/v1/guides/{$guide->slug}/local-info")->assertUnprocessable();
    }

    public function test_official_block_with_non_official_domain_is_rejected(): void
    {
        $city = City::firstWhere('slug', 'roma');
        $this->as('admin');
        $p = $this->postJson('/api/v1/admin/city-profiles', [
            'city_id' => $city->id, 'translations' => ['ar' => ['headline' => 'روما', 'summary' => 's']],
            'blocks' => [['key' => 'overview', 'info_type' => 'official_info', 'source_name' => 'x', 'source_url' => 'https://phish.example.com', 'source_type' => 'official',
                'last_verified_at' => now()->toDateString(), 'translations' => ['ar' => ['title' => 't', 'body' => 'b']]]],
        ])->assertCreated()->json('data');
        $this->postJson("/api/v1/admin/city-profiles/{$p['id']}/transition", ['to' => 'review'])->assertOk();
        $this->postJson("/api/v1/admin/city-profiles/{$p['id']}/transition", ['to' => 'approved'])->assertForbidden(); // four-eyes: author cannot approve
    }
}
