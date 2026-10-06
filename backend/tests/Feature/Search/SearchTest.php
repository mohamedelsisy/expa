<?php

namespace Tests\Feature\Search;

use App\Domains\Access\Services\AccessSynchronizer;
use App\Domains\Government\Models\GovernmentOffice;
use App\Domains\Government\Models\GovernmentService;
use App\Domains\Guides\Models\Guide;
use App\Domains\Jobs\Models\JobListing;
use App\Domains\Jobs\Services\JobImportRunner;
use App\Domains\Learning\Models\ItalianLesson;
use App\Domains\Patente\Models\PatenteTopic;
use App\Domains\Search\Models\SearchDocument;
use App\Domains\Search\Services\SearchIndexer;
use App\Enums\ContentStatus;
use App\Models\User;
use App\Support\Text\TextNormalizer;
use Database\Seeders\GeographySeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Tests\Support\JobFixtures;
use Tests\TestCase;

class SearchTest extends TestCase
{
    use JobFixtures, RefreshDatabase;

    private function index($item)
    {
        app(SearchIndexer::class)->sync($item->fresh());

        return $item;
    }

    private function guide(string $slug, array $tr, array $over = [], bool $publish = true): Guide
    {
        $g = Guide::factory()->create($over + ['slug' => $slug]);
        $g->setTranslations($tr);
        if ($publish) {
            $g->forceFill(['status' => 'published'])->save();
        }

        return $this->index($g);
    }

    private function seedCorpus(): void
    {
        $this->guide('codice-fiscale', [
            'ar' => ['title' => 'الرقم الضريبي', 'summary' => 'كيف تحصل على الرقم الضريبي في إيطاليا', 'what_is' => 'رمز تعريف أساسي'],
            'it' => ['title' => 'Codice fiscale', 'summary' => 'Come ottenere il codice fiscale', 'what_is' => 'Identificativo fiscale'],
            'en' => ['title' => 'Tax code', 'summary' => 'How to get your tax code'],
        ], ['italian_term' => 'Codice fiscale']);
        $this->guide('permesso', [
            'ar' => ['title' => 'تجديد تصريح الإقامة', 'summary' => 'خطوات التجديد', 'what_is' => 'تصريح الإقامة'],
            'it' => ['title' => 'Rinnovo del permesso di soggiorno', 'summary' => 'Passaggi per il rinnovo', 'what_is' => 'Permesso'],
        ], ['italian_term' => 'Permesso di soggiorno']);

        $s = GovernmentService::factory()->create(['slug' => 'svc-permesso', 'italian_term' => 'Permesso di soggiorno']);
        $s->setTranslations(['ar' => ['name' => 'خدمة تصريح الإقامة', 'summary' => 's', 'how_to_apply' => 'عبر الموقع'], 'it' => ['name' => 'Servizio permesso di soggiorno', 'summary' => 's', 'how_to_apply' => 'online']]);
        $s->forceFill(['status' => 'published'])->save();
        $this->index($s);

        $l = ItalianLesson::factory()->create(['slug' => 'saluti-1']);
        $l->setTranslations(['ar' => ['title' => 'التحيات', 'summary' => 'كلمات التحية'], 'it' => ['title' => 'Saluti', 'summary' => 'Parole di saluto']]);
        $l->forceFill(['status' => 'published'])->save();
        $this->index($l);
    }

    // ---- indexing rules -----------------------------------------------------------------------

    public function test_only_published_items_are_indexed_and_unpublishing_removes_them(): void
    {
        $this->guide('draft', ['ar' => ['title' => 'مسودة', 'summary' => 's', 'what_is' => 'w']], publish: false);
        $g = $this->guide('live', ['ar' => ['title' => 'منشور', 'summary' => 's', 'what_is' => 'w']]);

        $this->assertSame(['live'], SearchDocument::pluck('slug')->all());

        $g->forceFill(['status' => ContentStatus::Approved])->save();
        $this->index($g);
        $this->assertSame(0, SearchDocument::count());

        $g->forceFill(['status' => 'published'])->save();
        $this->index($g);
        $g->delete();
        app(SearchIndexer::class)->sync($g);
        $this->assertSame(0, SearchDocument::count());
    }

    public function test_workflow_transitions_and_admin_edits_keep_search_in_step_automatically(): void
    {
        app(AccessSynchronizer::class)->sync();
        $g = Guide::factory()->translated()->create();
        $g->forceFill(['status' => 'approved'])->save();
        $this->assertSame(0, SearchDocument::count());

        $g->transitionTo(ContentStatus::Published);
        $this->assertGreaterThan(0, SearchDocument::where('type', 'guide')->count());

        $admin = User::factory()->create();
        $admin->syncRoleKeys(['content_manager']);
        $this->actingAs($admin, 'sanctum')->patchJson("/api/v1/admin/guides/{$g->id}", ['translations' => ['ar' => ['title' => 'عنوان فريد جدا', 'summary' => 's', 'what_is' => 'w']]])->assertOk();
        $this->getJson('/api/v1/search?q='.urlencode('عنوان فريد'), ['Accept-Language' => 'ar'])->assertJsonPath('meta.total', 1);

        $g->transitionTo(ContentStatus::Approved);
        $this->assertSame(0, SearchDocument::count());
    }

    public function test_reindex_command_rebuilds_from_public_content_only(): void
    {
        $this->seedCorpus();
        $this->guide('secret', ['ar' => ['title' => 'سري', 'summary' => 's', 'what_is' => 'w']], publish: false);
        SearchDocument::query()->delete();

        $this->artisan('expa:search-reindex')->assertSuccessful();

        $this->assertSame(['government_service', 'guide', 'italian_lesson'], SearchDocument::distinct()->pluck('type')->sort()->values()->all());
        $this->assertSame(0, SearchDocument::where('slug', 'secret')->count());
    }

    // ---- querying -----------------------------------------------------------------------------

    public function test_arabic_queries_match_despite_diacritics_article_and_letter_variants(): void
    {
        $this->seedCorpus();
        foreach (['الرقم الضريبي', 'رقم ضريبي', 'الرَّقْم الضَّريبى', 'ضريبي'] as $q) {
            $res = $this->getJson('/api/v1/search?q='.urlencode($q), ['Accept-Language' => 'ar'])->assertOk();
            $this->assertSame('codice-fiscale', $res->json('data.0.slug'), $q);
        }
        $this->assertSame('permesso', $this->getJson('/api/v1/search?q='.urlencode('تصريح الاقامه'), ['Accept-Language' => 'ar'])->json('data.0.slug'));
    }

    public function test_italian_and_english_queries_with_accents_and_case(): void
    {
        $this->seedCorpus();
        $this->assertSame('permesso', $this->getJson('/api/v1/search?q=RINNOVO+Permesso', ['Accept-Language' => 'it'])->json('data.0.slug'));
        $this->assertSame('codice-fiscale', $this->getJson('/api/v1/search?q=tax+code', ['Accept-Language' => 'en'])->json('data.0.slug'));
        $this->assertSame('saluti-1', $this->getJson('/api/v1/search?q=saluti', ['Accept-Language' => 'it'])->json('data.0.slug'));
    }

    public function test_the_italian_term_is_found_from_any_interface_language(): void
    {
        $this->seedCorpus();
        $res = $this->getJson('/api/v1/search?q='.urlencode('Permesso di soggiorno'), ['Accept-Language' => 'ar'])->assertOk();
        $slugs = array_column($res->json('data'), 'slug');
        $this->assertContains('permesso', $slugs);
        $this->assertContains('svc-permesso', $slugs);
        // the title is shown in the reader's language
        $this->assertMatchesRegularExpression('/\p{Arabic}/u', $res->json('data.0.title'));
    }

    public function test_one_result_per_item_in_the_best_available_language(): void
    {
        $this->guide('only-it', ['it' => ['title' => 'Solo italiano guida', 'summary' => 's', 'what_is' => 'w']]);
        $this->seedCorpus();

        $res = $this->getJson('/api/v1/search?q=codice+fiscale', ['Accept-Language' => 'ar'])->assertOk();
        $this->assertSame(1, collect($res->json('data'))->where('slug', 'codice-fiscale')->count());
        $this->assertSame('ar', collect($res->json('data'))->firstWhere('slug', 'codice-fiscale')['locale']);

        $fallback = $this->getJson('/api/v1/search?q=italiano+guida', ['Accept-Language' => 'ar'])->json('data');
        $this->assertSame('it', $fallback[0]['locale']); // not available in Arabic → served from the fallback chain
    }

    public function test_title_matches_outrank_body_matches(): void
    {
        $this->guide('body-only', ['ar' => ['title' => 'دليل عام', 'summary' => 'يذكر تصريح الإقامة في الفقرة', 'what_is' => 'نص']]);
        $this->guide('title-hit', ['ar' => ['title' => 'تصريح الإقامة', 'summary' => 'ملخص', 'what_is' => 'نص']]);

        $slugs = array_column($this->getJson('/api/v1/search?q='.urlencode('تصريح الإقامة'), ['Accept-Language' => 'ar'])->json('data'), 'slug');
        $this->assertSame(['title-hit', 'body-only'], $slugs);
    }

    public function test_type_filter_facets_and_labels(): void
    {
        $this->seedCorpus();
        $res = $this->getJson('/api/v1/search?q=permesso', ['Accept-Language' => 'it'])->assertOk();
        $facets = collect($res->json('meta.facets'))->keyBy('type');
        $this->assertSame(1, $facets['guide']['count']);
        $this->assertSame(1, $facets['government_service']['count']);
        $this->assertSame('Guida', $facets['guide']['label']);

        $only = $this->getJson('/api/v1/search?q=permesso&types[]=guide', ['Accept-Language' => 'it'])->json();
        $this->assertSame(['guide'], array_unique(array_column($only['data'], 'type')));
        $this->assertSame('Guida', $only['data'][0]['type_label']);
        $this->assertSame('guides/permesso', $only['data'][0]['route']);
        $this->getJson('/api/v1/search?q=permesso&types[]=bogus')->assertStatus(422);
    }

    public function test_jobs_are_searchable_while_listed_and_vanish_when_hidden_or_expired(): void
    {
        $s = $this->source();
        $job = new JobListing(['title' => 'Sviluppatore Laravel senior', 'company' => 'Acme', 'description' => 'Lavoro con PHP e Laravel in team agile e distribuito.', 'apply_url' => 'https://c.example.test/1', 'skills' => ['php', 'laravel'],
            'remote_mode' => 'remote', 'employment_type' => 'full_time', 'category' => 'tech', 'published_at' => now()->subDay(), 'status' => 'published']);
        $job->job_source_id = $s->id;
        $job->external_id = 'j1';
        $job->dedupe_hash = sha1('x');
        $job->content_hash = sha1('y');
        $job->save();
        app(SearchIndexer::class)->syncJob($job);

        $res = $this->getJson('/api/v1/search?q=laravel+sviluppatore')->assertOk();
        $this->assertSame(['job', $job->id, 'jobs/'.$job->id, null], [$res->json('data.0.type'), $res->json('data.0.id'), $res->json('data.0.route'), $res->json('data.0.locale')]);
        // language-neutral: found from every interface language
        foreach (['ar', 'en', 'it'] as $l) {
            $this->assertSame(1, $this->getJson('/api/v1/search?q=laravel', ['Accept-Language' => $l])->json('meta.total'), $l);
        }

        $job->update(['status' => 'hidden']);
        app(SearchIndexer::class)->syncJob($job);
        $this->assertSame(0, $this->getJson('/api/v1/search?q=laravel')->json('meta.total'));

        $job->update(['status' => 'published', 'expires_at' => now()->addHour()]);
        app(SearchIndexer::class)->syncJob($job);
        $this->assertSame(1, $this->getJson('/api/v1/search?q=laravel')->json('meta.total'));
        $this->travel(2)->hours();
        $this->assertSame(1, app(SearchIndexer::class)->pruneJobs()); // expiry run drops it
        $this->assertSame(0, $this->getJson('/api/v1/search?q=laravel')->json('meta.total'));
    }

    public function test_imported_and_moderated_jobs_flow_into_the_index_automatically(): void
    {
        app(AccessSynchronizer::class)->sync();
        $this->seed(GeographySeeder::class);
        Http::fake(['*' => Http::response($this->feed($this->item(['id' => 'z', 'title' => 'Magazziniere notturno'])))]);
        app(JobImportRunner::class)->run($this->source());

        $this->assertSame(1, $this->getJson('/api/v1/search?q=magazziniere')->json('meta.total'));

        $admin = User::factory()->create();
        $admin->syncRoleKeys(['content_manager']);
        $this->actingAs($admin, 'sanctum')->patchJson('/api/v1/admin/jobs/'.JobListing::first()->id, ['status' => 'hidden'])->assertOk();
        $this->assertSame(0, $this->getJson('/api/v1/search?q=magazziniere')->json('meta.total'));
    }

    public function test_patente_topics_and_offices_are_searchable(): void
    {
        $t = new PatenteTopic(['slug' => 'segnali', 'source_name' => 'S', 'source_url' => 'https://www.mit.gov.it/x', 'source_type' => 'official', 'last_verified_at' => now()]);
        $t->save();
        $t->setTranslations(['ar' => ['title' => 'إشارات المرور', 'summary' => 'ملخص'], 'it' => ['title' => 'Segnali stradali', 'summary' => 'Sintesi']]);
        $t->forceFill(['status' => 'published'])->save();
        $this->index($t);
        $o = GovernmentOffice::factory()->create(['slug' => 'questura-roma']);
        $o->setTranslations(['it' => ['name' => 'Questura di Roma'], 'ar' => ['name' => 'مديرية أمن روما']]);
        $o->forceFill(['status' => 'published'])->save();
        $this->index($o);

        $this->assertSame('patente/topics/segnali', $this->getJson('/api/v1/search?q=segnali', ['Accept-Language' => 'it'])->json('data.0.route'));
        $this->assertSame('government/offices/questura-roma', $this->getJson('/api/v1/search?q=questura', ['Accept-Language' => 'it'])->json('data.0.route'));
    }

    // ---- API behaviour ------------------------------------------------------------------------

    public function test_validation_pagination_and_no_results(): void
    {
        $this->seedCorpus();
        $this->getJson('/api/v1/search')->assertStatus(422);
        $this->getJson('/api/v1/search?q=a')->assertStatus(422);
        $this->getJson('/api/v1/search?q='.str_repeat('x', 101))->assertStatus(422);
        $this->getJson('/api/v1/search?q=permesso&per_page=500')->assertStatus(422);

        $none = $this->getJson('/api/v1/search?q=zzzzqqqq')->assertOk();
        $this->assertSame([[], 0, []], [$none->json('data'), $none->json('meta.total'), $none->json('meta.facets')]);
        $this->assertSame(0, $this->getJson('/api/v1/search?q=%25%25')->json('meta.total')); // wildcards are literal
        $this->assertSame(0, $this->getJson('/api/v1/search?q=the+of+a')->json('meta.total')); // stopwords only

        $one = $this->getJson('/api/v1/search?q=permesso&per_page=1&page=2', ['Accept-Language' => 'it'])->assertOk();
        $this->assertCount(1, $one->json('data'));
        $this->assertSame([1, 2, 2], [$one->json('meta.per_page'), $one->json('meta.page'), $one->json('meta.last_page')]);
    }

    public function test_search_is_public_and_rate_limited_and_does_not_n_plus_one(): void
    {
        $this->seedCorpus();
        $count = 0;
        DB::listen(function () use (&$count) {
            $count++;
        });
        $this->getJson('/api/v1/search?q=permesso')->assertOk();
        $this->assertLessThanOrEqual(3, $count, "ran $count queries");

        for ($i = 0; $i < 59; $i++) {
            $this->getJson('/api/v1/search?q=permesso')->assertOk();
        }
        $this->getJson('/api/v1/search?q=permesso')->assertStatus(429)->assertJsonPath('error.code', 'too_many_requests');
    }

    public function test_snippets_never_contain_markup(): void
    {
        $this->guide('xss', ['ar' => ['title' => 'عنوان', 'summary' => 'ملخص <script>alert(1)</script> نص', 'what_is' => 'w']]);
        $s = $this->getJson('/api/v1/search?q='.urlencode('عنوان'), ['Accept-Language' => 'ar'])->json('data.0.snippet');
        $this->assertStringNotContainsString('<script>', $s);
    }

    public function test_suggestions_complete_titles_in_the_readers_language(): void
    {
        $this->seedCorpus();
        $ar = $this->getJson('/api/v1/search/suggest?q='.urlencode('الرق'), ['Accept-Language' => 'ar'])->assertOk()->json('data');
        $this->assertSame([['title' => 'الرقم الضريبي', 'type' => 'guide']], $ar);

        $it = $this->getJson('/api/v1/search/suggest?q=rin', ['Accept-Language' => 'it'])->json('data');
        $this->assertSame('Rinnovo del permesso di soggiorno', $it[0]['title']);
        $this->getJson('/api/v1/search/suggest?q=x')->assertStatus(422);
        $this->assertSame([], $this->getJson('/api/v1/search/suggest?q=zzzz')->json('data'));
    }

    public function test_every_type_label_exists_in_all_locales(): void
    {
        foreach (array_keys(config('expa.locales')) as $locale) {
            app()->setLocale($locale);
            foreach (SearchIndexer::TYPES as $t) {
                $this->assertNotSame("search.types.$t", __("search.types.$t"), "$locale $t");
            }
        }
    }

    // ---- BE-10: bounded work ------------------------------------------------------------------------

    public function test_repeated_queries_are_served_from_cache_and_any_index_write_invalidates_it(): void
    {
        config(['search.cache_ttl' => 60]);
        $this->seedCorpus();
        $this->getJson('/api/v1/search?q=permesso&lang=it')->assertOk(); // warm
        DB::enableQueryLog();
        $first = $this->getJson('/api/v1/search?q=permesso&lang=it')->assertOk();
        $searchQueries = collect(DB::getQueryLog())->filter(fn ($q) => str_contains($q['query'], 'like'))->count();
        DB::disableQueryLog();
        $this->assertSame(0, $searchQueries, 'a cached ranking performs no LIKE scan');
        $this->assertGreaterThan(0, $first->json('meta.total'));

        // unpublishing goes through the indexer, so the cached ranking cannot resurrect it
        $guide = Guide::where('slug', 'permesso')->first();
        $guide->forceFill(['status' => 'draft'])->save();
        app(SearchIndexer::class)->sync($guide->fresh());
        $after = collect($this->getJson('/api/v1/search?q=permesso&lang=it')->json('data'))->pluck('slug')->all();
        $this->assertNotContains('permesso', $after);
    }

    public function test_the_number_of_like_terms_is_capped(): void
    {
        config(['search.cache_ttl' => 0, 'search.max_tokens' => 3]);
        $this->seedCorpus();
        DB::enableQueryLog();
        $this->getJson('/api/v1/search?q='.rawurlencode('alpha bravo charlie delta echo foxtrot golf'))->assertOk();
        $likes = collect(DB::getQueryLog())->filter(fn ($q) => str_contains($q['query'], 'like'))->max(fn ($q) => substr_count($q['query'], 'like'));
        DB::disableQueryLog();
        $this->assertSame(3, $likes);
    }

    public function test_overlong_terms_and_queries_are_bounded(): void
    {
        $this->getJson('/api/v1/search?q='.str_repeat('a', 101))->assertStatus(422);
        $tokens = app(TextNormalizer::class)->tokens(str_repeat('x', 500));
        $this->assertSame(40, mb_strlen($tokens[0]));
    }
}
