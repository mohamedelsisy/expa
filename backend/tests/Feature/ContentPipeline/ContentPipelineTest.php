<?php

namespace Tests\Feature\ContentPipeline;

use App\Domains\Access\Services\AccessSynchronizer;
use App\Domains\Geo\Models\City;
use App\Domains\Patente\Models\PatenteTopic;
use App\Domains\Study\Models\University;
use App\Models\User;
use Database\Seeders\GeographySeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

/**
 * End-to-end content pipeline for EVERY content type, driven only through the admin API:
 * create (ar required) -> review -> approve (second person) -> publish (source guard) -> public API (ar/en/it, fallback,
 * source, freshness) -> search/AI index -> stale detection -> unpublish -> archive. Nothing here is official data:
 * all texts are obvious test fixtures.
 */
class ContentPipelineTest extends TestCase
{
    use RefreshDatabase;

    private const SRC = ['source_name' => 'Fixture Source', 'source_url' => 'https://www.interno.gov.it/fixture', 'source_type' => 'official'];

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(GeographySeeder::class);
        app(AccessSynchronizer::class)->sync();
    }

    private function ok($response, int $status = 200)
    {
        $this->assertSame($status, $response->status(), 'L'.debug_backtrace()[0]['line'].' '.substr($response->getContent(), 0, 500));

        return $response;
    }

    private function src(): array
    {
        return self::SRC + ['last_verified_at' => now()->subDays(3)->toDateString()];
    }

    private function as(string $role): User
    {
        $u = User::factory()->create();
        $u->syncRoleKeys([$role]);
        $this->actingAs($u, 'sanctum');

        return $u;
    }

    /**
     * type => admin uri, primary translated field, extra translated fields, locales required to publish,
     *         attributes (closure), public reader (closure returning the public `data` for a slug), search type, knowledge type.
     */
    private function spec(string $type): array
    {
        $roma = fn () => City::firstWhere('slug', 'roma')->id;
        $pub = fn (string $path) => fn (string $slug) => $path;   // path is a template with {slug}
        $specs = [
            'guides' => ['guides', 'title', ['summary' => 'sum', 'what_is' => 'what'], ['ar'], fn () => ['category' => 'immigration', 'italian_term' => 'Fixture', 'city_id' => $roma()], '/api/v1/guides/{slug}', 'guide', 'guide'],
            'government_services' => ['government/services', 'name', ['summary' => 'sum', 'how_to_apply' => 'how'], ['ar'], fn () => ['domain' => 'immigration', 'italian_term' => 'Fixture'], '/api/v1/government/services/{slug}', 'government_service', 'government_service'],
            'government_offices' => ['government/offices', 'name', [], ['ar'], fn () => ['office_type' => 'questura', 'booking_method' => 'online', 'official_url' => 'https://questure.poliziadistato.it/fixture', 'city_id' => $roma()], '/api/v1/government/offices/{slug}', 'government_office', 'government_office'],
            'appointment_guides' => ['appointments/guides', 'title', ['summary' => 'sum', 'steps' => [['title' => 'step', 'text' => 'text']]], ['ar'], fn () => ['office_type' => 'questura', 'booking_method' => 'online', 'booking_portal_url' => 'https://www.portaleimmigrazione.it/fixture'], '/api/v1/appointments/guides/{slug}', 'appointment_guide', 'appointment_guide'],
            'italian_lessons' => ['italian/lessons', 'title', ['summary' => 'sum', 'body' => 'body'], ['ar'], fn () => ['level' => 'a1', 'type' => 'vocabulary', 'duration_minutes' => 5], '/api/v1/italian/lessons/{slug}', 'italian_lesson', null],
            'italian_vocabulary' => ['italian/vocabulary', 'gloss', [], ['ar', 'en'], fn () => ['lemma' => 'fixture', 'level' => 'a1'], '/api/v1/italian/vocabulary/{slug}', 'italian_vocabulary', null],
            'italian_exercises' => ['italian/exercises', 'prompt', [], ['ar'], fn () => ['type' => 'multiple_choice', 'level' => 'a1', 'content' => ['choices' => ['a', 'b'], 'correct_index' => 0]], '/api/v1/italian/exercises/{slug}', null, null],
            'patente_categories' => ['patente/categories', 'title', ['summary' => 'sum'], ['ar'], fn () => [], '/api/v1/patente/categories/{slug}', 'patente_category', 'patente_category'],
            'patente_topics' => ['patente/topics', 'title', ['summary' => 'sum'], ['ar'], fn () => [], '/api/v1/patente/topics/{slug}', 'patente_topic', 'patente_topic'],
            'patente_questions' => ['patente/questions', 'statement', [], ['it', 'ar'], fn () => ['patente_topic_id' => $this->topic(), 'is_true' => true, 'license_type' => 'licensed', 'rights_holder' => 'Fixture Holder Ltd', 'license_proof_ref' => 'CONTRACT-FIXTURE-1'], null, null, null],
            'universities' => ['study/universities', 'name', ['summary' => 'sum'], ['ar'], fn () => ['kind' => 'public', 'website' => 'https://www.unibo.it/', 'city_id' => $roma()], '/api/v1/study/universities/{slug}', 'university', 'university'],
            'study_programs' => ['study/programs', 'title', ['summary' => 'sum'], ['ar'], fn () => ['university_id' => $this->university(), 'degree_level' => 'master', 'field' => 'computer_science', 'instruction_language' => 'en'], '/api/v1/study/programs/{slug}', 'study_program', 'study_program'],
            'scholarships' => ['study/scholarships', 'name', ['summary' => 'sum'], ['ar'], fn () => [], '/api/v1/study/scholarships/{slug}', 'scholarship', 'scholarship'],
            'articles' => ['articles', 'title', ['excerpt' => 'ex', 'body' => 'body'], ['ar'], fn () => ['category' => 'news', 'city_id' => $roma()], '/api/v1/articles/{slug}', 'article', 'article'],
            'city_profiles' => ['city-profiles', 'headline', ['summary' => 'sum'], ['ar'], fn () => ['city_id' => $roma(), 'blocks' => [['key' => 'healthcare', 'info_type' => 'official_info', 'source_name' => 'Fixture', 'source_url' => 'https://www.comune.roma.it/fixture', 'source_type' => 'official', 'last_verified_at' => now()->subDay()->toDateString(), 'translations' => ['ar' => ['title' => 'FIXTURE block', 'body' => 'FIXTURE body']]]]], '/api/v1/cities/roma', 'city_profile', null],
            'legal_documents' => ['legal', 'title', ['body' => 'LEGAL_REVIEW_REQUIRED fixture text'], ['ar'], fn () => ['slug' => 'privacy', 'version' => 'fixture-1'], '/api/v1/legal/privacy', 'legal_document', null],
            'tax_tables' => ['money/tax-tables', 'name', [], ['ar'], fn () => ['tax_year' => (int) now()->year, 'brackets' => [['up_to' => 28000, 'rate' => 23], ['up_to' => null, 'rate' => 43]]], null, null, null],
            'travel_requirements' => ['travel/requirements', 'title', ['summary' => 'sum', 'requirements' => 'req'], ['ar'], fn () => ['nationality' => 'EG', 'destination' => 'IT'], null, null, null],
        ];

        return $specs[$type];
    }

    public static function types(): array
    {
        return array_map(fn ($k) => [$k], ['guides', 'government_services', 'government_offices', 'appointment_guides', 'italian_lessons', 'italian_vocabulary',
            'italian_exercises', 'patente_categories', 'patente_topics', 'patente_questions', 'universities', 'study_programs', 'scholarships',
            'articles', 'city_profiles', 'legal_documents', 'tax_tables', 'travel_requirements']);
    }

    public function topic(): int
    {
        $t = PatenteTopic::create(['slug' => 'fixture-topic', 'source_name' => 'x']);
        $t->forceFill(['status' => 'published'])->save();

        return $t->id;
    }

    public function university(): int
    {
        $u = University::create(['slug' => 'fixture-uni', 'kind' => 'public']);
        $u->forceFill(['status' => 'published'])->save();

        return $u->id;
    }

    private function translations(array $spec, array $locales): array
    {
        [, $primary, $extra] = $spec;
        $out = [];
        foreach ($locales as $loc) {
            $out[$loc] = [$primary => "FIXTURE title $loc"] + array_map(fn ($v) => is_string($v) ? "$v $loc" : $v, $extra);
        }

        return $out;
    }

    /** The public `data` of the item for the locale, or null when the type has no public reader. */
    private function readPublic(string $type, array $spec, string $locale, ?string $slug)
    {
        $h = ['Accept-Language' => $locale];
        if ($type === 'patente_questions') {
            return null; // questions are only served inside exams; counted through the topic list (assertQuestionCount)
        }
        if ($type === 'tax_tables') {
            return $this->postJson('/api/v1/money/net-salary', ['gross_annual' => 30000, 'tax_year' => (int) now()->year], $h)->assertOk()->json('data');
        }
        if ($type === 'travel_requirements') {
            return $this->getJson('/api/v1/travel/requirements?nationality=EG&destination=IT', $h)->assertOk()->json('data');
        }

        return $this->getJson(str_replace('{slug}', (string) $slug, $spec[5]), $h);
    }

    #[DataProvider('types')]
    public function test_full_pipeline(string $type): void
    {
        $spec = $this->spec($type);
        [$uri, $primary, , $required, $attrs] = $spec;
        $slug = $type === 'city_profiles' ? 'roma' : ($type === 'legal_documents' ? 'privacy' : 'fx-'.str_replace('_', '-', $type));
        $base = '/api/v1/admin/'.$uri;
        $payload = ['slug' => $slug, 'translations' => $this->translations($spec, $required)] + $attrs();

        // 1. create: draft, Arabic present, English/Italian reported missing (never silently blocking drafts)
        $author = $this->as('content_manager');
        $created = $this->ok($this->postJson($base, $payload), 201);
        $id = $created->json('data.id');
        $this->assertSame('draft', $created->json('data.status'));
        $this->assertNotContains('ar', $created->json('data.missing_locales'));
        $this->assertNotEmpty(array_diff(['en', 'it'], $required), 'every type must allow publishing without en/it unless explicitly required');

        // 2. review -> author cannot approve own work (four-eyes) -> a second person approves
        $go = fn (string $to) => $this->postJson("$base/$id/transition", ['to' => $to]);
        $this->ok($go('review'));
        $go('approved')->assertForbidden();
        $this->as('admin');
        $this->ok($go('approved'));

        // 3. publish guard: machine readable problems list (source types: missing source; every type: stays unpublished)
        $res = $go('published');
        $sourceTypes = ! in_array($type, ['italian_lessons', 'italian_vocabulary', 'italian_exercises', 'articles', 'city_profiles', 'legal_documents'], true);
        if ($sourceTypes) {
            $res->assertStatus(422)->assertJsonPath('error.code', 'content_not_publishable')
                ->assertJsonFragment(['code' => 'missing_source_field', 'field' => 'source_url']);
            // approved content cannot be edited into an unpublishable state: a look-alike "official" domain is refused
            $this->patchJson("$base/$id", ['source_name' => 'Lookalike', 'source_url' => 'https://www.interno-gov-it.example/x', 'source_type' => 'official', 'last_verified_at' => now()->toDateString()])
                ->assertStatus(422)->assertJsonFragment(['code' => 'source_domain_not_official']);
            $this->ok($this->patchJson("$base/$id", $this->src()));
        } else {
            $this->ok($res);            // sources are optional for this type: it published, so unpublish and attach one to test the full shape
            $this->ok($go('approved'));
            $this->ok($this->patchJson("$base/$id", $this->src()));
        }
        $this->as('admin');
        $this->ok($go('published'))->assertJsonPath('data.status', 'published');

        // 4. public API: Arabic served as-is, en/it fall back to ar with explicit metadata, then real translations replace the fallback
        foreach (array_diff(['en', 'it'], $required) as $loc) {
            $data = $this->publicData($type, $spec, $loc, $slug);
            if ($data !== null && array_key_exists('fallback', $data)) {
                $this->assertTrue($data['fallback'], "$type/$loc should flag fallback");
                $chain = array_values(array_filter(config("content.fallbacks.$loc"), fn ($l) => in_array($l, $required, true)));
                $this->assertSame($chain[0], $data['locale']);
            }
        }
        // translators work on drafts; once content is live only a publisher may touch it (content_locked)
        $this->ok($this->patchJson("$base/$id/translations", ['translations' => $this->translations($spec, array_diff(['en', 'it'], $required))]));
        foreach (['ar', 'en', 'it'] as $loc) {
            $data = $this->publicData($type, $spec, $loc, $slug);
            if ($data === null) {
                continue;
            }
            if (array_key_exists('locale', $data)) {
                $this->assertSame($loc, $data['locale'], "$type serves $loc");
                $this->assertFalse($data['fallback']);
            }
            $this->assertOfficialShape($type, $data, $sourceTypes);
        }

        $this->assertIndexed($spec, $id, true);
        if ($type === 'patente_questions') {
            $this->assertQuestionCount(1);
        }

        // 5. stale detection: an old verification date flags the item everywhere it should show up
        $this->as('admin');
        $table = (new ($this->modelFor($type)))->getTable();
        DB::table($table)->where('id', $id)->update(['last_verified_at' => now()->subDays(200)]);
        $this->getJson("$base?filter.stale=1")->assertOk()->assertJsonFragment(['id' => $id]);
        $row = collect($this->getJson('/api/v1/admin/content-readiness')->assertOk()->json('data.types'))->firstWhere('type', $this->typeKey($type));
        $this->assertGreaterThanOrEqual(1, $row['stale'], "$type stale counted");
        $this->assertFalse($row['ready'] && $row['requires_source']);
        $pd = $this->publicData($type, $spec, 'ar', $slug);
        if ($pd !== null && isset($pd['source']['freshness'])) {
            $this->assertSame('stale', $pd['source']['freshness']);
        }

        // 6. unpublish -> gone from public + indexes; archive afterwards
        $this->ok($go('approved'));
        $this->assertIndexed($spec, $id, false);
        $this->assertUnpublished($type, $spec, $slug);
        $go('published')->assertOk();
        $this->assertIndexed($spec, $id, true);
        $go('archived')->assertOk()->assertJsonPath('data.status', 'archived');
        $this->assertIndexed($spec, $id, false);
        $this->assertUnpublished($type, $spec, $slug);
        $go('draft')->assertOk(); // archived content can be restored for rework, never straight back to live
        $go('published')->assertStatus(422);
    }

    /** A bad item (only a non-required language) never passes the guard: the problems list names the missing locale. */
    #[DataProvider('types')]
    public function test_publish_without_required_translation_lists_problems(string $type): void
    {
        $spec = $this->spec($type);
        [$uri, , , $required, $attrs] = $spec;
        $locale = count($required) > 1 ? end($required) : 'en';
        $this->as('content_manager');
        $slug = $type === 'city_profiles' ? 'roma' : ($type === 'legal_documents' ? 'terms' : 'bad-'.str_replace('_', '-', $type));
        $payload = ['slug' => $slug, 'translations' => $this->translations($spec, [$locale])] + $attrs() + $this->src();
        if ($type === 'legal_documents') {
            $payload['version'] = 'bad-1';
        }
        $base = '/api/v1/admin/'.$uri;
        $id = $this->ok($this->postJson($base, $payload), 201)->json('data.id');
        $this->postJson("$base/$id/transition", ['to' => 'review'])->assertOk();
        $this->as('admin');
        $this->postJson("$base/$id/transition", ['to' => 'approved'])->assertOk();
        $this->postJson("$base/$id/transition", ['to' => 'published'])->assertStatus(422)
            ->assertJsonPath('error.code', 'content_not_publishable')
            ->assertJsonStructure(['error' => ['details' => ['problems' => [['code']]]]])
            ->assertJsonFragment(['code' => 'missing_translation']);
    }

    private function modelFor(string $type): string
    {
        return collect(config('content.models'))->first(fn ($c) => Str::snake(Str::plural(class_basename($c))) === $type
            || Str::snake(class_basename($c)).'s' === $type || Str::snake(class_basename($c)) === Str::singular($type)
            || Str::snake(Str::plural(class_basename($c))) === str_replace('city_profiles', 'city_profiles', $type));
    }

    private function typeKey(string $type): string
    {
        return Str::snake(class_basename($this->modelFor($type)));
    }

    private function publicData(string $type, array $spec, string $locale, string $slug): ?array
    {
        $r = $this->readPublic($type, $spec, $locale, $slug);
        if ($r === null || is_array($r)) {
            return $r;
        }

        return $r->assertOk()->json('data');
    }

    private function assertQuestionCount(int $expected): void
    {
        $this->assertSame($expected, $this->getJson('/api/v1/patente/topics')->assertOk()->json('data.0.question_count'));
    }

    private function assertUnpublished(string $type, array $spec, string $slug): void
    {
        if (in_array($type, ['patente_questions'], true)) {
            $this->assertQuestionCount(0);

            return;
        }
        if ($type === 'tax_tables') {
            $this->postJson('/api/v1/money/net-salary', ['gross_annual' => 30000, 'tax_year' => (int) now()->year])->assertJsonPath('data.available', false);

            return;
        }
        if ($type === 'travel_requirements') {
            $this->getJson('/api/v1/travel/requirements?nationality=EG&destination=IT')->assertJsonPath('data.available', false);

            return;
        }
        $this->getJson(str_replace('{slug}', $slug, $spec[5]))->assertNotFound();
    }

    private function assertIndexed(array $spec, int $id, bool $expected): void
    {
        if ($spec[6]) {
            $this->assertSame($expected, DB::table('search_documents')->where('type', $spec[6])->where('item_id', $id)->exists(), "search index {$spec[6]}");
        }
        if ($spec[7]) {
            $this->assertSame($expected, DB::table('knowledge_chunks')->where('item_type', $spec[7])->where('item_id', $id)->exists(), "AI knowledge {$spec[7]}");
        }
    }

    /** Official/sensitive items must expose title/content, language, source name+url+type, last_verified_at, freshness. */
    private function assertOfficialShape(string $type, array $data, bool $sourceRequired): void
    {
        $source = $data['source'] ?? $data['table']['source'] ?? $data['items'][0]['source'] ?? $data['blocks'][0]['source'] ?? null;
        $blob = json_encode($data);
        foreach (['created_by', 'updated_by', 'publish_at', 'four_eyes_blocked', 'license_proof_ref', 'rights_holder', 'rights_note', 'deleted_at', 'allowed_transitions'] as $internal) {
            $this->assertStringNotContainsString('"'.$internal.'"', $blob, "$type public output leaks $internal");
        }
        if (isset($data['status'])) {
            $this->assertSame('published', $data['status']);
        }
        if (! in_array($type, ['tax_tables', 'travel_requirements', 'city_profiles'], true)) {
            $this->assertNotEmpty(array_filter(array_intersect_key($data, array_flip(['title', 'name', 'headline', 'prompt', 'gloss']))), "$type exposes a title");
            $this->assertArrayHasKey('locale', $data, "$type exposes its language");
            $this->assertArrayHasKey('status', $data, "$type exposes status");
        }
        if (in_array($type, ['guides', 'government_offices', 'articles', 'universities'], true)) {
            $this->assertSame('roma', $data['city']['slug'] ?? null, "$type exposes its city");
            $this->assertNotNull($data['region']['slug'] ?? null, "$type exposes its region");
        }
        $this->assertNotNull($source, "$type must expose its source");
        foreach (['name', 'url', 'type', 'last_verified_at', 'freshness'] as $k) {
            $this->assertArrayHasKey($k, $source, "$type source.$k");
            if ($sourceRequired) {
                $this->assertNotNull($source[$k], "$type source.$k filled");
            }
        }
    }
}
