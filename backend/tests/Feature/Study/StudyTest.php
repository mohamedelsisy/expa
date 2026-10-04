<?php

namespace Tests\Feature\Study;

use App\Domains\Access\Services\AccessSynchronizer;
use App\Domains\Ai\Models\KnowledgeChunk;
use App\Domains\Ai\Services\KnowledgeIndexer;
use App\Domains\Geo\Models\City;
use App\Domains\Profile\Services\ConsentService;
use App\Domains\Search\Models\SearchDocument;
use App\Domains\Search\Services\SearchIndexer;
use App\Domains\Study\Enums\DegreeLevel;
use App\Domains\Study\Enums\StudyField;
use App\Domains\Study\Models\Scholarship;
use App\Domains\Study\Models\StudyProgram;
use App\Domains\Study\Models\University;
use App\Enums\ContentStatus;
use App\Enums\SourceType;
use App\Models\User;
use Database\Seeders\GeographySeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class StudyTest extends TestCase
{
    use RefreshDatabase;

    private int $n = 0;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(GeographySeeder::class);
        app(AccessSynchronizer::class)->sync();
    }

    private function src(): array
    {
        return ['source_name' => 'University portal', 'source_url' => 'https://www.universitaly.it/test', 'source_type' => SourceType::Official, 'last_verified_at' => now()->subDays(4)];
    }

    private function publish($m)
    {
        $m->forceFill(['status' => 'published'])->save();
        app(SearchIndexer::class)->sync($m->fresh());
        app(KnowledgeIndexer::class)->sync($m->fresh());

        return $m->fresh();
    }

    private function uni(string $slug = 'polimi', string $city = 'milano', bool $publish = true): University
    {
        $u = new University(['slug' => $slug, 'kind' => 'public', 'city_id' => City::firstWhere('slug', $city)->id, 'website' => 'https://www.example-uni.test/'] + $this->src());
        $u->save();
        $u->setTranslations(['ar' => ['name' => 'جامعة '.$slug, 'summary' => 'ملخص'], 'it' => ['name' => 'Università '.$slug, 'summary' => 'Sintesi'], 'en' => ['name' => 'University '.$slug, 'summary' => 'Summary']]);

        return $publish ? $this->publish($u) : $u;
    }

    private function program(University $u, array $over = [], bool $publish = true): StudyProgram
    {
        $this->n++;
        $p = new StudyProgram(array_merge([
            'slug' => 'prog-'.$this->n, 'university_id' => $u->id, 'degree_level' => 'master', 'field' => 'computer_science', 'instruction_language' => 'en',
        ], $this->src(), $over));
        $p->save();
        $p->setTranslations(['ar' => ['title' => 'برنامج '.$this->n, 'summary' => 'ملخص'], 'it' => ['title' => 'Corso '.$this->n, 'summary' => 'Sintesi'], 'en' => ['title' => 'Programme '.$this->n, 'summary' => 'Summary', 'admission_requirements' => 'Bachelor degree in a related field']]);

        return $publish ? $this->publish($p) : $p;
    }

    private function finder(array $q, string $lang = 'en')
    {
        return $this->getJson('/api/v1/study/finder?'.http_build_query($q), ['Accept-Language' => $lang]);
    }

    // ---- public catalogue ---------------------------------------------------------------------

    public function test_only_published_content_is_public_and_programs_need_a_published_university(): void
    {
        $live = $this->uni('live');
        $draftUni = $this->uni('draft-uni', publish: false);
        $this->program($live, ['slug' => 'ok']);
        $this->program($live, ['slug' => 'draft-prog'], publish: false);
        $this->program($draftUni, ['slug' => 'orphan']);

        $this->getJson('/api/v1/study/universities')->assertOk()->assertJsonPath('meta.total', 1);
        $this->getJson('/api/v1/study/programs')->assertJsonPath('meta.total', 1)->assertJsonPath('data.0.slug', 'ok');
        $this->getJson('/api/v1/study/programs/draft-prog')->assertNotFound();
        $this->getJson('/api/v1/study/programs/orphan')->assertNotFound();
        $this->getJson('/api/v1/study/universities/draft-uni')->assertNotFound();
        $this->assertSame(['ok'], array_column($this->getJson('/api/v1/study/universities/live')->json('data.programs'), 'slug'));
    }

    public function test_program_payload_never_invents_tuition_or_deadlines_and_always_carries_the_verify_notice(): void
    {
        $u = $this->uni();
        $this->program($u, ['slug' => 'bare']);
        $this->program($u, ['slug' => 'full', 'tuition_min_year' => 1500, 'tuition_max_year' => 3000, 'application_deadline' => now()->addDays(20)->toDateString(), 'duration_years' => 2]);
        $this->program($u, ['slug' => 'past', 'application_deadline' => now()->subDays(20)->toDateString()]);

        $bare = $this->getJson('/api/v1/study/programs/bare', ['Accept-Language' => 'en'])->assertOk()->json('data');
        $this->assertNull($bare['tuition']);
        $this->assertSame(['date' => null, 'status' => 'not_stated'], $bare['deadline']);
        $this->assertStringContainsString('Always confirm on the university', $bare['verify_notice']);
        $this->assertSame('Bachelor degree in a related field', $bare['admission_requirements']);

        $full = $this->getJson('/api/v1/study/programs/full')->json('data');
        $this->assertSame(['min' => 1500, 'max' => 3000, 'currency' => 'EUR', 'period' => 'year'], $full['tuition']);
        $this->assertSame('upcoming', $full['deadline']['status']);
        $this->assertSame('passed', $this->getJson('/api/v1/study/programs/past')->json('data.deadline.status'));
        $this->assertSame('fresh', $full['source']['freshness']);
        $this->assertSame('Master\'s (Laurea magistrale)', $full['degree_level_label']);
    }

    public function test_localization_and_fallback(): void
    {
        $u = $this->uni();
        $p = $this->program($u, ['slug' => 'loc']);
        $p->translations()->where('locale', 'it')->delete();

        $ar = $this->getJson('/api/v1/study/programs/loc', ['Accept-Language' => 'ar'])->json('data');
        $this->assertSame('بكالوريوس (Laurea triennale)', $this->getJson('/api/v1/study/meta', ['Accept-Language' => 'ar'])->json('data.degree_levels.0.label'));
        $this->assertMatchesRegularExpression('/\p{Arabic}/u', $ar['title']);
        $it = $this->getJson('/api/v1/study/programs/loc', ['Accept-Language' => 'it'])->json('data');
        $this->assertSame(['en', true], [$it['locale'], $it['fallback']]); // it → en fallback
        $this->assertStringContainsString('Verifica sempre', $it['verify_notice']);
    }

    public function test_list_filters_and_validation(): void
    {
        $milano = $this->uni('mi', 'milano');
        $roma = $this->uni('rm', 'roma');
        $this->program($milano, ['slug' => 'a', 'field' => 'engineering', 'degree_level' => 'bachelor', 'instruction_language' => 'it']);
        $this->program($milano, ['slug' => 'b', 'field' => 'computer_science', 'degree_level' => 'master', 'instruction_language' => 'en']);
        $this->program($roma, ['slug' => 'c', 'field' => 'computer_science', 'degree_level' => 'master', 'instruction_language' => 'both']);
        $slugs = fn (string $qs) => collect($this->getJson("/api/v1/study/programs?$qs")->assertOk()->json('data'))->pluck('slug')->sort()->values()->all();

        $this->assertSame(['b', 'c'], $slugs('field=computer_science'));
        $this->assertSame(['a'], $slugs('degree=bachelor'));
        $this->assertSame(['b', 'c'], $slugs('language=en'));   // 'both' satisfies either language
        $this->assertSame(['a', 'c'], $slugs('language=it'));
        $this->assertSame(['c'], $slugs('city=roma'));
        $this->assertSame([], $slugs('city=atlantis'));
        $this->assertSame(['b'], $slugs('q=Programme+2'));
        $this->getJson('/api/v1/study/programs?field=magic')->assertStatus(422);
        $this->getJson('/api/v1/study/programs?budget=-5')->assertStatus(422);
        $this->getJson('/api/v1/study/programs?italian_level=z9')->assertStatus(422);
        $this->assertSame(0, $this->getJson('/api/v1/study/programs?q=%25')->json('meta.total'));
    }

    // ---- finder -------------------------------------------------------------------------------

    public function test_finder_ranks_by_supplied_criteria_and_explains_each_one(): void
    {
        $mi = $this->uni('mi', 'milano');
        $to = $this->uni('to', 'torino');
        $best = $this->program($mi, ['slug' => 'best', 'tuition_min_year' => 1000, 'tuition_max_year' => 2500, 'required_english_level' => 'b2']);
        $this->program($to, ['slug' => 'wrong-city', 'tuition_min_year' => 1000, 'tuition_max_year' => 2500]);
        $this->program($mi, ['slug' => 'wrong-field', 'field' => 'law', 'tuition_min_year' => 1000, 'tuition_max_year' => 2500]);
        $this->program($mi, ['slug' => 'too-pricey', 'tuition_min_year' => 9000, 'tuition_max_year' => 12000]);

        $res = $this->finder(['field' => 'computer_science', 'degree' => 'master', 'language' => 'en', 'budget' => 3000, 'city' => 'milano', 'english_level' => 'b2'])->assertOk();
        $slugs = array_column($res->json('data'), 'slug');

        $this->assertSame('best', $slugs[0]);
        $this->assertSame(100, $res->json('data.0.match.score'));
        $by = collect($res->json('data.0.match.reasons'))->keyBy('key');
        $this->assertSame(['match', 'match', 'match', 'match', 'match', 'match'], [$by['field']['status'], $by['degree']['status'], $by['language']['status'], $by['budget']['status'], $by['city']['status'], $by['english']['status']]);
        $this->assertSame('Yearly tuition is within your budget', $by['budget']['label']);
        $this->assertNotContains('wrong-field', $slugs);     // field is a must-have, not a weighted preference
        $this->assertContains('wrong-city', $slugs);         // city only ranks
        $this->assertLessThan($res->json('data.0.match.score'), $res->json('data.'.array_search('wrong-city', $slugs).'.match.score'));
        $this->assertSame(['field' => 'computer_science', 'degree' => 'master', 'language' => 'en', 'budget' => 3000, 'city' => 'milano', 'english_level' => 'b2'], $res->json('meta.criteria'));
        $this->assertStringContainsString('confirm', $res->json('meta.verify_notice'));
    }

    public function test_unknown_facts_are_not_penalized_but_lower_confidence(): void
    {
        $u = $this->uni();
        $this->program($u, ['slug' => 'no-tuition']); // tuition and levels not stated
        $this->program($u, ['slug' => 'priced', 'tuition_min_year' => 500, 'tuition_max_year' => 900]);

        $res = $this->finder(['field' => 'computer_science', 'budget' => 1000, 'english_level' => 'c1']);
        $by = collect($res->json('data'))->keyBy('slug');
        $this->assertSame(100, $by['no-tuition']['match']['score']);   // nothing contradicted
        $this->assertSame('unknown', collect($by['no-tuition']['match']['reasons'])->firstWhere('key', 'budget')['status']);
        $this->assertGreaterThan($by['no-tuition']['match']['confidence'], $by['priced']['match']['confidence']); // a stated price lets us evaluate more
        $this->assertNull($by['no-tuition']['tuition']);
    }

    public function test_budget_partial_and_mismatch(): void
    {
        $u = $this->uni();
        $this->program($u, ['slug' => 'range', 'tuition_min_year' => 1000, 'tuition_max_year' => 4000]);
        $this->program($u, ['slug' => 'over', 'tuition_min_year' => 5000, 'tuition_max_year' => 6000]);

        $by = collect($this->finder(['field' => 'computer_science', 'budget' => 2000])->json('data'))->keyBy('slug');
        $status = fn ($slug) => collect($by[$slug]['match']['reasons'])->firstWhere('key', 'budget')['status'];
        $this->assertSame('partial', $status('range'));
        $this->assertSame('mismatch', $status('over'));
        $this->assertGreaterThan($by['over']['match']['score'], $by['range']['match']['score']);
    }

    public function test_language_levels_only_matter_when_the_programme_uses_that_language(): void
    {
        $u = $this->uni();
        $this->program($u, ['slug' => 'english-only', 'instruction_language' => 'en', 'required_italian_level' => 'b2']);
        $this->program($u, ['slug' => 'italian', 'instruction_language' => 'it', 'required_italian_level' => 'b2']);

        $by = collect($this->finder(['field' => 'computer_science', 'italian_level' => 'a1'])->json('data'))->keyBy('slug');
        $it = fn ($s) => collect($by[$s]['match']['reasons'])->firstWhere('key', 'italian')['status'];
        $this->assertSame('unknown', $it('english-only')); // taught in English: the Italian requirement is irrelevant
        $this->assertSame('mismatch', $it('italian'));
    }

    public function test_finder_without_criteria_lists_everything_and_unpublished_never_appear(): void
    {
        $u = $this->uni();
        $this->program($u, ['slug' => 'one']);
        $this->program($u, ['slug' => 'draft'], publish: false);

        $res = $this->finder([])->assertOk();
        $this->assertSame(['one'], array_column($res->json('data'), 'slug'));
        $this->assertNull($res->json('data.0.match.score'));
    }

    public function test_finder_can_use_the_profile_only_with_consent(): void
    {
        $mi = $this->uni('mi', 'milano');
        $to = $this->uni('to', 'torino');
        $this->program($mi, ['slug' => 'milan', 'instruction_language' => 'it', 'required_italian_level' => 'b1']);
        $this->program($to, ['slug' => 'turin', 'instruction_language' => 'it', 'required_italian_level' => 'b1']);

        $u = User::factory()->create();
        $u->profile()->create(['italian_level' => 'b2', 'city_id' => City::firstWhere('slug', 'milano')->id]);
        $this->actingAs($u, 'sanctum');

        $without = $this->finder(['field' => 'computer_science', 'use_profile' => 1])->json('meta.criteria');
        $this->assertArrayNotHasKey('italian_level', $without);

        app(ConsentService::class)->record($u, ['profile_personalization' => true]);
        $res = $this->finder(['field' => 'computer_science', 'use_profile' => 1]);
        $this->assertSame(['milano', 'b2'], [$res->json('meta.criteria.city'), $res->json('meta.criteria.italian_level')]);
        $this->assertSame('milan', $res->json('data.0.slug'));

        $this->finder(['field' => 'computer_science', 'use_profile' => 1, 'city' => 'torino'])->assertJsonPath('meta.criteria.city', 'torino'); // explicit input wins
    }

    public function test_finder_pagination_and_query_count(): void
    {
        $u = $this->uni();
        foreach (range(1, 25) as $i) {
            $this->program($u, ['slug' => "p$i"]);
        }
        $count = 0;
        DB::listen(function () use (&$count) {
            $count++;
        });
        $res = $this->finder(['field' => 'computer_science', 'page' => 2])->assertOk();
        $this->assertLessThanOrEqual(6, $count, "ran $count queries");
        $this->assertSame([20, 25, 2, 5], [$res->json('meta.per_page'), $res->json('meta.total'), $res->json('meta.page'), count($res->json('data'))]);
    }

    // ---- scholarships -------------------------------------------------------------------------

    public function test_scholarships_filter_by_degree_and_open_deadline(): void
    {
        $mk = function (string $slug, array $over = []) {
            $s = new Scholarship(['slug' => $slug] + $over + $this->src());
            $s->save();
            $s->setTranslations(['ar' => ['name' => 'منحة '.$slug, 'summary' => 's'], 'en' => ['name' => 'Scholarship '.$slug, 'summary' => 's', 'eligibility' => 'See the official call']]);

            return $this->publish($s);
        };
        $mk('open-master', ['degree_levels' => ['master'], 'deadline' => now()->addDays(30)->toDateString()]);
        $mk('closed-master', ['degree_levels' => ['master'], 'deadline' => now()->subDays(30)->toDateString()]);
        $mk('any-level');
        $mk('phd-only', ['degree_levels' => ['phd']]);

        $slugs = fn (string $qs) => collect($this->getJson("/api/v1/study/scholarships?$qs")->assertOk()->json('data'))->pluck('slug')->sort()->values()->all();
        $this->assertSame(['any-level', 'closed-master', 'open-master', 'phd-only'], $slugs(''));
        $this->assertSame(['any-level', 'closed-master', 'open-master'], $slugs('degree=master'));
        $this->assertSame(['any-level', 'open-master', 'phd-only'], $slugs('open_only=1'));
        $this->getJson('/api/v1/study/scholarships?degree=nope')->assertStatus(422);

        $d = $this->getJson('/api/v1/study/scholarships/open-master', ['Accept-Language' => 'en'])->assertOk()->json('data');
        $this->assertSame(['upcoming', 'See the official call'], [$d['deadline']['status'], $d['eligibility']]);
        $this->assertStringContainsString('confirm', $d['verify_notice']);
        $this->getJson('/api/v1/study/scholarships/none')->assertNotFound();
    }

    // ---- admin workflow -----------------------------------------------------------------------

    private function staff(string $role): User
    {
        $u = User::factory()->create();
        $u->syncRoleKeys([$role]);
        $this->actingAs($u, 'sanctum');

        return $u;
    }

    public function test_admin_workflow_sources_and_the_university_prerequisite(): void
    {
        $this->actingAs(User::factory()->create(), 'sanctum')->getJson('/api/v1/admin/study/programs')->assertForbidden();
        $this->staff('editor');
        $uni = $this->postJson('/api/v1/admin/study/universities', ['slug' => 'new-uni', 'kind' => 'public', 'city_id' => City::firstWhere('slug', 'roma')->id, 'website' => 'https://www.example-uni.test'] + $this->src() + [
            'source_type' => 'official', 'last_verified_at' => now()->toDateString(),
            'translations' => ['ar' => ['name' => 'جامعة جديدة', 'summary' => 'ملخص']],
        ])->assertCreated();
        $uniId = $uni->json('data.id');

        $prog = $this->postJson('/api/v1/admin/study/programs', ['slug' => 'new-prog', 'university_id' => $uniId, 'degree_level' => 'master', 'field' => 'engineering', 'instruction_language' => 'both',
            'tuition_min_year' => 1000, 'tuition_max_year' => 2000, 'required_english_level' => 'b2', 'application_deadline' => now()->addMonths(3)->toDateString(),
            'source_name' => 'Official page', 'source_url' => 'https://www.universitaly.it/p', 'source_type' => 'official', 'last_verified_at' => now()->toDateString(),
            'translations' => ['ar' => ['title' => 'هندسة', 'summary' => 'ملخص']]])->assertCreated();
        $progId = $prog->json('data.id');
        $this->assertSame(['master', 'engineering', 1000], [$prog->json('data.degree_level'), $prog->json('data.field'), $prog->json('data.tuition_min_year')]);

        // publishing a programme before its university is live is refused
        $this->postJson("/api/v1/admin/study/programs/$progId/transition", ['to' => 'review'])->assertOk();
        $this->staff('content_manager');
        $this->postJson("/api/v1/admin/study/programs/$progId/transition", ['to' => 'approved'])->assertOk();
        $this->postJson("/api/v1/admin/study/programs/$progId/transition", ['to' => 'published'])
            ->assertStatus(422)->assertJsonFragment(['code' => 'university_not_published']);

        foreach (['review', 'approved', 'published'] as $to) {
            $this->postJson("/api/v1/admin/study/universities/$uniId/transition", ['to' => $to])->assertOk();
            if ($to === 'review') {
                $this->staff('content_manager'); // four-eyes: a different person approves
            }
        }
        $this->postJson("/api/v1/admin/study/programs/$progId/transition", ['to' => 'published'])->assertOk();
        $this->getJson('/api/v1/study/programs/new-prog')->assertOk();
        $this->assertSame(1, SearchDocument::where('type', 'study_program')->count()); // indexed by the workflow itself
    }

    public function test_admin_validation(): void
    {
        $u = $this->uni();
        $this->staff('editor');
        $base = ['slug' => 'v', 'university_id' => $u->id, 'degree_level' => 'master', 'field' => 'engineering', 'instruction_language' => 'en',
            'translations' => ['ar' => ['title' => 't', 'summary' => 's']]] + $this->src();
        $base['source_type'] = 'official';
        $bad = fn (array $o) => $this->postJson('/api/v1/admin/study/programs', array_merge($base, ['slug' => 'v'.random_int(1, 99999)], $o))->assertStatus(422);

        $bad(['degree_level' => 'wizard']);
        $bad(['field' => 'magic']);
        $bad(['instruction_language' => 'fr']);
        $bad(['university_id' => 99999]);
        $bad(['tuition_min_year' => 5000, 'tuition_max_year' => 1000]);
        $bad(['tuition_min_year' => -1]);
        $bad(['application_deadline' => 'tomorrow-ish']);
        $bad(['program_url' => 'http://insecure.test']);
        $bad(['required_italian_level' => 'z9']);
        $this->postJson('/api/v1/admin/study/scholarships', ['slug' => 's', 'degree_levels' => ['master', 'master'], 'translations' => ['ar' => ['name' => 'n']]])->assertStatus(422);
    }

    // ---- search, AI and sources ---------------------------------------------------------------

    public function test_programs_universities_and_scholarships_are_searchable_and_unpublish_removes_them(): void
    {
        $u = $this->uni('bocconi');
        $p = $this->program($u, ['slug' => 'ai-msc']);
        $p->setTranslations(['en' => ['title' => 'Artificial Intelligence MSc', 'summary' => 'Machine learning programme']]);
        $this->publish($p);

        $res = $this->getJson('/api/v1/search?q=artificial+intelligence', ['Accept-Language' => 'en'])->assertOk();
        $this->assertSame(['study_program', 'study/programs/ai-msc'], [$res->json('data.0.type'), $res->json('data.0.route')]);
        $this->assertSame('Study programme', $res->json('data.0.type_label'));
        $this->assertSame('university', $this->getJson('/api/v1/search?q=bocconi', ['Accept-Language' => 'en'])->json('data.0.type'));

        $p->forceFill(['status' => ContentStatus::Approved])->save();
        app(SearchIndexer::class)->sync($p->fresh());
        $this->assertSame(0, $this->getJson('/api/v1/search?q=artificial+intelligence')->json('meta.total'));
    }

    public function test_the_assistant_can_cite_study_content_but_study_questions_need_sources(): void
    {
        $u = $this->uni('unibo', 'milano');
        $p = $this->program($u, ['slug' => 'cs-msc']);
        $p->setTranslations(['en' => ['title' => 'Computer science master degree admission requirements', 'summary' => 'Admission requirements for the master in computer science', 'admission_requirements' => 'A bachelor in computer science']]);
        $this->publish($p);
        $this->assertTrue(KnowledgeChunk::where('item_type', 'study_program')->exists());

        $this->actingAs(User::factory()->create(), 'sanctum');
        $none = $this->postJson('/api/v1/ai/ask', ['message' => 'Which scholarship exists for studying abroad in Finland?'], ['Accept-Language' => 'en'])->assertOk();
        $this->assertStringContainsString("don't have verified information", $none->json('data.message.content')); // study is a sensitive intent

        $ok = $this->postJson('/api/v1/ai/ask', ['message' => 'computer science master degree admission requirements'], ['Accept-Language' => 'en'])->assertOk();
        $this->assertSame('official', $ok->json('data.message.label'));
        $this->assertSame('study/programs/cs-msc', $ok->json('data.message.sources.0.ref.route'));
    }

    public function test_meta_and_labels_exist_in_every_locale(): void
    {
        foreach (array_keys(config('expa.locales')) as $locale) {
            app()->setLocale($locale);
            foreach (DegreeLevel::cases() as $c) {
                $this->assertNotSame("study.degree_levels.{$c->value}", __("study.degree_levels.{$c->value}"));
            }
            foreach (StudyField::cases() as $c) {
                $this->assertNotSame("study.fields.{$c->value}", __("study.fields.{$c->value}"));
            }
            foreach (['budget', 'city', 'italian', 'english', 'field', 'degree', 'language'] as $k) {
                foreach (['match', 'mismatch'] as $s) {
                    $this->assertNotSame("study.match.$k.$s", __("study.match.$k.$s"), "$locale $k.$s");
                }
            }
            $this->assertNotSame('study.verify_notice', __('study.verify_notice'));
        }
    }
}
