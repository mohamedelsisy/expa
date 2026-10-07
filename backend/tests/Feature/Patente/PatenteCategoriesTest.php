<?php

namespace Tests\Feature\Patente;

use App\Domains\Patente\Models\PatenteCategory;
use App\Enums\SourceType;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/** RA-10: public GET patente/categories and /{slug}, plus GET articles/categories. */
class PatenteCategoriesTest extends TestCase
{
    use RefreshDatabase;

    private function category(string $slug, bool $publish, int $sort = 0): PatenteCategory
    {
        $c = new PatenteCategory(['slug' => $slug, 'sort_order' => $sort, 'source_name' => 'Test', 'source_url' => 'https://www.mit.gov.it/c', 'source_type' => SourceType::Official, 'last_verified_at' => now()]);
        $c->save();
        $c->setTranslations(['ar' => ['title' => "فئة $slug", 'summary' => 'ملخص', 'body' => 'نص كامل'], 'en' => ['title' => "Category $slug", 'summary' => 'Summary', 'body' => 'Full body']]);
        $publish && $c->forceFill(['status' => 'published'])->save();

        return $c;
    }

    public function test_list_shows_only_published_in_order_with_source_and_locale(): void
    {
        $this->category('b-cat', true, 2);
        $this->category('a-cat', true, 1);
        $this->category('draft-cat', false);

        $r = $this->getJson('/api/v1/patente/categories', ['Accept-Language' => 'en'])->assertOk()->assertHeader('Cache-Control', 'max-age=300, public');
        $this->assertSame(['a-cat', 'b-cat'], collect($r->json('data'))->pluck('slug')->all());
        $r->assertJsonPath('data.0.title', 'Category a-cat')->assertJsonPath('data.0.source.name', 'Test')->assertJsonMissingPath('data.0.body');
        $this->getJson('/api/v1/patente/categories', ['Accept-Language' => 'ar'])->assertJsonPath('data.0.title', 'فئة a-cat');
    }

    public function test_detail_returns_body_and_404_for_draft_or_unknown(): void
    {
        $this->category('b-cat', true);
        $this->category('draft-cat', false);

        $this->getJson('/api/v1/patente/categories/b-cat', ['Accept-Language' => 'en'])->assertOk()
            ->assertJsonPath('data.slug', 'b-cat')->assertJsonPath('data.body', 'Full body')->assertJsonPath('data.fallback', false);
        $this->getJson('/api/v1/patente/categories/draft-cat')->assertNotFound();
        $this->getJson('/api/v1/patente/categories/nope')->assertNotFound();
    }

    public function test_article_categories_lists_every_category_with_a_label_in_each_locale(): void
    {
        foreach (['ar', 'en', 'it'] as $lang) {
            $r = $this->getJson('/api/v1/articles/categories', ['Accept-Language' => $lang])->assertOk();
            $this->assertNotEmpty($r->json('data'));
            foreach ($r->json('data') as $c) {
                $this->assertNotSame('articles.categories.'.$c['value'], $c['label'], "$lang label missing for {$c['value']}");
            }
        }
        $this->getJson('/api/v1/articles/categories')->assertJsonStructure(['data' => [['value', 'label']]]);
    }
}
