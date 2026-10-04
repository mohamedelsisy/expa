<?php

namespace Tests\Feature\Jobs;

use App\Domains\Geo\Models\City;
use App\Domains\Jobs\Models\JobListing;
use App\Domains\Jobs\Models\JobProfile;
use App\Domains\Jobs\Services\MatchScorer;
use App\Domains\Profile\Services\ConsentService;
use App\Models\User;
use Database\Seeders\GeographySeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\Support\JobFixtures;
use Tests\TestCase;

class JobApiTest extends TestCase
{
    use JobFixtures, RefreshDatabase;

    private int $n = 0;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(GeographySeeder::class);
    }

    private function job(array $over = []): JobListing
    {
        static $source = null;
        $source = $this->source();
        $this->n++;
        $j = new JobListing(array_merge([
            'title' => "Job {$this->n}", 'company' => "Co {$this->n}", 'description' => 'Descrizione del lavoro abbastanza lunga.', 'apply_url' => "https://careers.example.test/{$this->n}",
            'remote_mode' => 'onsite', 'employment_type' => 'full_time', 'category' => 'tech', 'skills' => ['php', 'laravel'],
            'published_at' => now()->subDays($this->n), 'status' => 'published',
        ], $over));
        $j->job_source_id = $source->id;
        $j->external_id = "e{$this->n}";
        $j->dedupe_hash = sha1("h{$this->n}");
        $j->content_hash = sha1("c{$this->n}");
        $j->save();

        return $j;
    }

    private function jobProfile(int $userId, array $attrs): JobProfile
    {
        $p = new JobProfile($attrs);
        $p->user_id = $userId; // ownership is guarded against mass assignment
        $p->save();

        return $p;
    }

    private function user(array $consents = ['profile_personalization' => true], array $profile = []): User
    {
        $u = User::factory()->create();
        app(ConsentService::class)->record($u, $consents);
        if ($profile) {
            $u->profile()->create($profile);
        }
        $this->actingAs($u, 'sanctum');

        return $u;
    }

    // ---- public listing -----------------------------------------------------------------------

    public function test_only_listed_jobs_are_public_newest_first(): void
    {
        $old = $this->job(['published_at' => now()->subDays(10)]);
        $new = $this->job(['published_at' => now()->subDay()]);
        $this->job(['status' => 'hidden']);
        $this->job(['status' => 'expired']);
        $this->job(['expires_at' => now()->subHour()]);
        $this->job(['expires_at' => now()->addDay()]);

        $res = $this->getJson('/api/v1/jobs')->assertOk();
        $this->assertSame(3, $res->json('meta.total'));
        $ids = array_column($res->json('data'), 'id');
        $this->assertSame($new->id, $ids[0]);
        $this->assertSame($old->id, $ids[count($ids) - 1]);
        $this->assertCount(3, $ids);
        foreach (JobListing::whereIn('status', ['hidden', 'expired'])->pluck('id') as $id) {
            $this->getJson("/api/v1/jobs/$id")->assertNotFound();
        }
    }

    public function test_list_hides_description_and_apply_url_detail_shows_them_with_the_notice(): void
    {
        $j = $this->job();
        $list = $this->getJson('/api/v1/jobs', ['Accept-Language' => 'en'])->json('data.0');
        $this->assertArrayNotHasKey('description', $list);
        $this->assertArrayNotHasKey('apply_url', $list);

        $d = $this->getJson("/api/v1/jobs/{$j->id}", ['Accept-Language' => 'en'])->assertOk()->json('data');
        $this->assertSame($j->apply_url, $d['apply_url']);
        $this->assertStringContainsString('does not submit applications', $d['apply_notice']);
        $this->assertSame('Full time', $d['employment_type_label']);
        $this->assertSame('Technology', $d['category_label']);
    }

    public function test_visa_sponsorship_is_reported_as_stated_only_when_the_source_said_so(): void
    {
        $no = $this->job();
        $yes = $this->job(['visa_sponsorship_stated' => true]);

        $this->getJson("/api/v1/jobs/{$no->id}", ['Accept-Language' => 'en'])->assertJsonPath('data.visa_sponsorship', ['stated' => false, 'label' => 'Visa sponsorship not stated']);
        $this->getJson("/api/v1/jobs/{$yes->id}", ['Accept-Language' => 'en'])->assertJsonPath('data.visa_sponsorship.stated', true);
        $this->assertStringContainsString('لم يُذكر', $this->getJson("/api/v1/jobs/{$no->id}", ['Accept-Language' => 'ar'])->json('data.visa_sponsorship.label'));
    }

    public function test_filters(): void
    {
        $roma = City::firstWhere('slug', 'roma');
        $this->job(['title' => 'PHP developer', 'category' => 'tech', 'remote_mode' => 'remote', 'city_id' => null]);
        $this->job(['title' => 'Cameriere', 'category' => 'hospitality', 'employment_type' => 'part_time', 'city_id' => $roma->id, 'italian_level' => 'a2']);
        $this->job(['title' => 'Infermiere', 'category' => 'healthcare', 'italian_level' => 'c1']);
        $count = fn (string $qs) => $this->getJson("/api/v1/jobs?$qs")->assertOk()->json('meta.total');

        $this->assertSame(1, $count('q=cameriere'));
        $this->assertSame(1, $count('q=Co+2'));
        $this->assertSame(1, $count('city=roma'));
        $this->assertSame(0, $count('city=atlantis'));
        $this->assertSame(1, $count('remote=remote'));
        $this->assertSame(1, $count('type=part_time'));
        $this->assertSame(1, $count('category=healthcare'));
        $this->assertSame(2, $count('italian_max=a2'));   // a2 job + the one that states no requirement
        $this->assertSame(3, $count('italian_max=c1'));
        $this->assertSame(0, $count('q=%25'));
        $this->getJson('/api/v1/jobs?remote=teleport')->assertStatus(422);
        $this->getJson('/api/v1/jobs?italian_max=z9')->assertStatus(422);
        $this->getJson('/api/v1/jobs?per_page=500')->assertStatus(422);
    }

    public function test_meta_is_localized(): void
    {
        $it = $this->getJson('/api/v1/jobs/meta', ['Accept-Language' => 'it'])->assertOk()->json('data');
        $this->assertSame('Da remoto', collect($it['remote_modes'])->firstWhere('value', 'remote')['label']);
        $this->assertSame('Sanità', collect($it['categories'])->firstWhere('value', 'healthcare')['label']);
        $this->assertCount(10, $it['categories']);
    }

    public function test_list_does_not_n_plus_one(): void
    {
        $roma = City::firstWhere('slug', 'roma');
        foreach (range(1, 12) as $i) {
            $this->job(['city_id' => $roma->id]);
        }
        $this->user();
        $count = 0;
        DB::listen(function () use (&$count) {
            $count++;
        });
        $this->getJson('/api/v1/jobs?per_page=12')->assertOk();

        $this->assertLessThanOrEqual(12, $count, "ran $count queries");
    }

    // ---- save / apply -------------------------------------------------------------------------

    public function test_save_unsave_and_list_saved(): void
    {
        $a = $this->job();
        $b = $this->job();
        $this->postJson("/api/v1/jobs/{$a->id}/save")->assertUnauthorized();

        $this->user();
        $this->postJson("/api/v1/jobs/{$a->id}/save")->assertNoContent();
        $this->postJson("/api/v1/jobs/{$a->id}/save")->assertNoContent(); // idempotent
        $this->postJson("/api/v1/jobs/{$b->id}/save")->assertNoContent();

        $this->assertSame([$b->id, $a->id], array_column($this->getJson('/api/v1/jobs/saved')->json('data'), 'id'));
        $this->assertTrue($this->getJson("/api/v1/jobs/{$a->id}")->json('data.saved'));
        $this->deleteJson("/api/v1/jobs/{$a->id}/save")->assertNoContent();
        $this->assertFalse($this->getJson("/api/v1/jobs/{$a->id}")->json('data.saved'));

        $this->postJson('/api/v1/jobs/99999/save')->assertNotFound();
        $hidden = $this->job(['status' => 'hidden']);
        $this->postJson("/api/v1/jobs/{$hidden->id}/save")->assertNotFound();
    }

    public function test_saved_lists_are_private(): void
    {
        $j = $this->job();
        $this->user();
        $this->postJson("/api/v1/jobs/{$j->id}/save")->assertNoContent();
        $this->user();
        $this->assertSame([], $this->getJson('/api/v1/jobs/saved')->json('data'));
        $this->assertFalse($this->getJson("/api/v1/jobs/{$j->id}")->json('data.saved'));
    }

    public function test_apply_click_counts_and_never_claims_a_submission(): void
    {
        $j = $this->job();
        $this->postJson("/api/v1/jobs/{$j->id}/apply-click")->assertUnauthorized();
        $this->user();

        $res = $this->postJson("/api/v1/jobs/{$j->id}/apply-click", [], ['Accept-Language' => 'en'])->assertOk();
        $res->assertJsonPath('data.apply_url', $j->apply_url)->assertJsonPath('data.submitted_by_expa', false);
        $this->postJson("/api/v1/jobs/{$j->id}/apply-click")->assertOk();
        $this->assertSame(2, $j->fresh()->apply_clicks);
    }

    // ---- candidate profile & matching ---------------------------------------------------------

    public function test_job_profile_needs_consent_validates_and_normalizes_skills(): void
    {
        $this->user(['marketing' => true]);
        $this->putJson('/api/v1/jobs/profile', ['skills' => ['PHP']])->assertForbidden()->assertJsonPath('error.code', 'consent_required');

        $this->user();
        $this->putJson('/api/v1/jobs/profile', ['skills' => ['  PHP ', 'Laravel', 'php', '<b>Docker</b>'], 'experience_years' => 4, 'remote_preference' => 'remote_only', 'employment_types' => ['full_time'], 'salary_min_year' => 30000])
            ->assertOk()->assertJsonPath('data.skills', ['php', 'laravel', 'docker'])->assertJsonPath('data.experience_years', 4);
        $this->getJson('/api/v1/jobs/profile')->assertJsonPath('data.remote_preference', 'remote_only');

        foreach ([['remote_preference' => 'sometimes'], ['experience_years' => -1], ['employment_types' => ['pirate']], ['education' => 'wizard'], ['city_id' => 99999], ['skills' => array_fill(0, 41, 'x')]] as $bad) {
            $this->putJson('/api/v1/jobs/profile', $bad)->assertStatus(422);
        }
    }

    public function test_match_is_explained_localized_and_unknowns_are_not_penalized(): void
    {
        $this->user(profile: ['italian_level' => 'b1', 'english_level' => 'b2']);
        $this->jobProfile(auth()->id(), ['skills' => ['php', 'laravel'], 'experience_years' => 3, 'remote_preference' => 'remote_only', 'employment_types' => ['full_time']]);
        $j = $this->job(['skills' => ['php', 'laravel'], 'experience_years' => 3, 'italian_level' => 'b1', 'english_level' => 'b2', 'remote_mode' => 'remote']);

        $m = $this->getJson("/api/v1/jobs/{$j->id}", ['Accept-Language' => 'en'])->json('data.match');
        $this->assertSame(100, $m['score']);
        $by = collect($m['reasons'])->keyBy('key');
        $this->assertSame('match', $by['skills']['status']);
        $this->assertSame('Your skills match the requirements', $by['skills']['label']);
        $this->assertSame('unknown', $by['salary']['status']);   // neither side stated a salary → ignored, not a penalty
        $this->assertSame('Salary or expectation not specified', $by['salary']['label']);
        $this->assertLessThan(100, $m['confidence']);             // …but confidence says part of the picture was missing
        $this->assertSame('أضف مهاراتك', mb_substr(__('jobs.match.skills.unknown', [], 'ar'), 0, 11));
    }

    public function test_match_scoring_rules(): void
    {
        $s = app(MatchScorer::class);
        $job = fn (array $o = []) => tap(new JobListing(array_merge(['remote_mode' => 'onsite', 'employment_type' => 'full_time', 'skills' => ['php', 'laravel', 'mysql', 'docker'], 'description' => 'x'], $o)), fn ($j) => $j->setRelation('city', null));
        $jp = fn (array $o) => new JobProfile($o);
        $status = fn (JobListing $j, ?JobProfile $p, string $key, array $facts = []) => collect($s->score($j, $p, $facts + ['italian_level' => null, 'english_level' => null, 'city_id' => null])['reasons'])->firstWhere('key', $key)['status'];

        // skills: ≥60 % match, some partial, none mismatch
        $this->assertSame('match', $status($job(), $jp(['skills' => ['php', 'laravel', 'mysql']]), 'skills'));
        $this->assertSame('partial', $status($job(), $jp(['skills' => ['php']]), 'skills'));
        $this->assertSame('mismatch', $status($job(), $jp(['skills' => ['cobol']]), 'skills'));
        $this->assertSame('unknown', $status($job(), $jp(['skills' => []]), 'skills'));
        // languages: gap 0 match, 1 partial, ≥2 mismatch
        $this->assertSame('match', $status($job(['italian_level' => 'b1']), null, 'italian', ['italian_level' => 'b2']));
        $this->assertSame('partial', $status($job(['italian_level' => 'b2']), null, 'italian', ['italian_level' => 'b1']));
        $this->assertSame('mismatch', $status($job(['italian_level' => 'c1']), null, 'italian', ['italian_level' => 'a2']));
        $this->assertSame('unknown', $status($job(['italian_level' => 'c1']), null, 'italian'));
        // experience
        $this->assertSame('partial', $status($job(['experience_years' => 3]), $jp(['experience_years' => 2]), 'experience'));
        $this->assertSame('mismatch', $status($job(['experience_years' => 5]), $jp(['experience_years' => 1]), 'experience'));
        // remote preference
        $this->assertSame('mismatch', $status($job(['remote_mode' => 'onsite']), $jp(['remote_preference' => 'remote_only']), 'remote'));
        $this->assertSame('partial', $status($job(['remote_mode' => 'hybrid']), $jp(['remote_preference' => 'remote_only']), 'remote'));
        $this->assertSame('unknown', $status($job(), $jp(['remote_preference' => 'any']), 'remote'));
        // salary only compares when the period is stated; monthly is annualized
        $this->assertSame('unknown', $status($job(['salary_max' => 3000, 'salary_currency' => 'EUR']), $jp(['salary_min_year' => 30000]), 'salary'));
        $this->assertSame('match', $status($job(['salary_max' => 3000, 'salary_currency' => 'EUR', 'salary_period' => 'month']), $jp(['salary_min_year' => 30000]), 'salary'));
        $this->assertSame('partial', $status($job(['salary_max' => 28000, 'salary_currency' => 'EUR', 'salary_period' => 'year']), $jp(['salary_min_year' => 30000]), 'salary'));
        $this->assertSame('mismatch', $status($job(['salary_max' => 18000, 'salary_currency' => 'EUR', 'salary_period' => 'year']), $jp(['salary_min_year' => 30000]), 'salary'));
        // location: remote jobs fit everyone
        $this->assertSame('match', $status($job(['remote_mode' => 'remote']), null, 'location'));
    }

    public function test_score_is_null_when_nothing_can_be_evaluated(): void
    {
        $j = new JobListing(['remote_mode' => 'onsite', 'employment_type' => 'other', 'skills' => [], 'description' => 'x']);
        $r = app(MatchScorer::class)->score($j, null, ['italian_level' => null, 'english_level' => null, 'city_id' => null]);
        $this->assertNull($r['score']);
        $this->assertSame(0, $r['confidence']);
    }

    public function test_without_personalization_consent_the_profile_is_ignored(): void
    {
        $u = $this->user(['marketing' => true], ['italian_level' => 'a0']);
        $this->jobProfile($u->id, ['skills' => ['php']]);
        $j = $this->job(['skills' => ['php'], 'italian_level' => 'c1']);

        $by = collect($this->getJson("/api/v1/jobs/{$j->id}")->json('data.match.reasons'))->keyBy('key');
        $this->assertSame('unknown', $by['skills']['status']);
        $this->assertSame('unknown', $by['italian']['status']);
    }

    public function test_recommendations_are_thresholded_sorted_and_need_enough_confidence(): void
    {
        $this->user(profile: ['italian_level' => 'b1']);
        $this->jobProfile(auth()->id(), ['skills' => ['php', 'laravel'], 'experience_years' => 3]);
        $great = $this->job(['skills' => ['php', 'laravel'], 'experience_years' => 4, 'italian_level' => 'b1']); // one year short → partial
        $perfect = $this->job(['skills' => ['php', 'laravel'], 'experience_years' => 3, 'italian_level' => 'b1', 'published_at' => now()->subDays(30)]);
        $this->job(['skills' => ['cobol'], 'experience_years' => 10, 'italian_level' => 'c1']);          // poor fit
        $this->job(['skills' => [], 'italian_level' => null, 'experience_years' => null]);               // nothing to evaluate

        $res = $this->getJson('/api/v1/jobs/recommended', ['Accept-Language' => 'it'])->assertOk();
        $this->assertSame([$perfect->id, $great->id], array_column($res->json('data'), 'id'));
        $this->assertGreaterThanOrEqual(config('jobs.recommend_min_score'), $res->json('data.1.match.score'));
        $this->assertSame('Le tue competenze corrispondono ai requisiti', collect($res->json('data.0.match.reasons'))->firstWhere('key', 'skills')['label']);
    }

    // ---- privacy ------------------------------------------------------------------------------

    public function test_export_and_erasure_cover_job_data(): void
    {
        $j = $this->job(['title' => 'Saved role']);
        $u = $this->user();
        $this->putJson('/api/v1/jobs/profile', ['skills' => ['php']])->assertOk();
        $this->postJson("/api/v1/jobs/{$j->id}/save")->assertNoContent();

        $this->getJson('/api/v1/profile/export')->assertJsonPath('data.jobs.preferences.skills', ['php'])->assertJsonPath('data.jobs.saved_jobs.0.title', 'Saved role');
        $this->deleteJson('/api/v1/profile', ['password' => 'password'])->assertStatus(202);

        $this->assertSame(0, DB::table('job_saves')->where('user_id', $u->id)->count());
        $this->assertSame(0, JobProfile::where('user_id', $u->id)->count());
        $this->assertSame(1, JobListing::count()); // public listings are not personal data
    }
}
