<?php

namespace Tests\Feature\Jobs;

use App\Domains\Access\Services\AccessSynchronizer;
use App\Domains\Audit\Models\AuditLog;
use App\Domains\Jobs\Models\JobImportRun;
use App\Domains\Jobs\Models\JobListing;
use App\Domains\Jobs\Models\JobSource;
use App\Domains\Jobs\Services\JobImportRunner;
use App\Jobs\RunJobImport;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Queue;
use Tests\Support\JobFixtures;
use Tests\TestCase;

class JobAdminTest extends TestCase
{
    use JobFixtures, RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        app(AccessSynchronizer::class)->sync();
    }

    private function as(string $role): User
    {
        $u = User::factory()->create();
        $u->syncRoleKeys([$role]);
        $this->actingAs($u, 'sanctum');

        return $u;
    }

    private function payload(array $over = []): array
    {
        return array_replace_recursive([
            'key' => 'acme-feed', 'name' => 'Acme careers feed', 'driver' => 'json_feed',
            'config' => ['url' => 'https://feeds.example.test/acme.json?token=SECRET-TOKEN', 'headers' => ['Authorization' => 'Bearer SECRET-HEADER']],
            'legal_basis' => 'Acme publishes this feed for reuse; terms section 4 permits automated retrieval.',
            'active' => true, 'schedule_hours' => 6,
        ], $over);
    }

    public function test_access_control(): void
    {
        $this->getJson('/api/v1/admin/job-sources')->assertUnauthorized();
        $this->as('user');
        $this->getJson('/api/v1/admin/job-sources')->assertForbidden();
        foreach (['translator', 'editor', 'support_agent'] as $role) {
            $this->as($role);
            $this->getJson('/api/v1/admin/job-sources')->assertForbidden(); // sources need a legal judgement: not an editorial role
            $this->postJson('/api/v1/admin/job-sources', $this->payload())->assertForbidden();
        }
        $this->as('content_manager');
        $this->getJson('/api/v1/admin/job-sources')->assertOk();
        $this->postJson('/api/v1/admin/job-sources', $this->payload())->assertCreated();
        $this->as('support_agent');
        $this->getJson('/api/v1/admin/jobs')->assertForbidden();
    }

    public function test_create_never_returns_the_url_or_headers_and_encrypts_them(): void
    {
        $this->as('content_manager');
        $res = $this->postJson('/api/v1/admin/job-sources', $this->payload())->assertCreated();

        $res->assertJsonPath('data.config_summary.host', 'feeds.example.test')->assertJsonPath('data.config_summary.has_headers', true);
        $blob = $res->getContent();
        $this->assertStringNotContainsString('SECRET-TOKEN', $blob);
        $this->assertStringNotContainsString('SECRET-HEADER', $blob);
        $this->assertStringNotContainsString('SECRET', $this->getJson('/api/v1/admin/job-sources')->getContent());
        $this->assertStringNotContainsString('SECRET', \DB::table('job_sources')->value('config'));

        $audit = json_encode(AuditLog::where('action', 'like', 'job_source.%')->get()->toArray());
        $this->assertStringNotContainsString('SECRET', $audit);
    }

    public function test_an_active_source_requires_a_documented_legal_basis(): void
    {
        $this->as('content_manager');
        $this->postJson('/api/v1/admin/job-sources', $this->payload(['legal_basis' => null]))->assertStatus(422)->assertJsonStructure(['error' => ['details' => ['legal_basis']]]);
        $this->postJson('/api/v1/admin/job-sources', $this->payload(['legal_basis' => 'ok']))->assertStatus(422);
        // inactive sources may be drafted without one…
        $id = $this->postJson('/api/v1/admin/job-sources', $this->payload(['key' => 'draft', 'legal_basis' => null, 'active' => false]))->assertCreated()->json('data.id');
        // …but cannot be switched on until it is documented
        $this->patchJson("/api/v1/admin/job-sources/$id", ['active' => true])->assertStatus(422)->assertJsonStructure(['error' => ['details' => ['legal_basis']]]);
        $this->patchJson("/api/v1/admin/job-sources/$id", ['active' => true, 'legal_basis' => 'Documented: robots.txt and ToS allow automated reuse of this feed.'])->assertOk()->assertJsonPath('data.active', true);
    }

    public function test_validation_and_ssrf_rejection_at_configuration_time(): void
    {
        config(['jobs.ssrf_dns_check' => true]);
        $this->as('content_manager');
        $n = 0;
        $post = fn (array $override, ?string $url = null) => $this->postJson('/api/v1/admin/job-sources', tap(
            array_merge($this->payload(), ['key' => 'k'.++$n], $override),
            function (&$p) use ($url) {
                if ($url !== null) {
                    $p['config']['url'] = $url;
                }
            }
        ));

        foreach (['http://feeds.example.test/x', 'https://127.0.0.1/x', 'https://10.0.0.1/x', 'https://169.254.169.254/x', 'https://localhost/x', 'https://u:p@feeds.example.test/x', 'javascript:alert(1)'] as $url) {
            $post([], $url)->assertStatus(422)->assertJsonStructure(['error' => ['details' => ['config.url']]]);
        }
        foreach ([['driver' => 'scraper'], ['key' => 'Bad Key!'], ['schedule_hours' => 0], ['schedule_hours' => 999], ['name' => '']] as $override) {
            $post($override, 'https://203.0.113.10/jobs.json')->assertStatus(422);
        }
        $this->assertSame(0, JobSource::count());
    }

    public function test_key_must_be_unique(): void
    {
        $this->as('content_manager');
        config(['jobs.ssrf_dns_check' => false]);
        $this->postJson('/api/v1/admin/job-sources', $this->payload())->assertCreated();
        $this->postJson('/api/v1/admin/job-sources', $this->payload())->assertStatus(422)->assertJsonStructure(['error' => ['details' => ['key']]]);
    }

    public function test_partial_config_update_merges_instead_of_wiping(): void
    {
        $this->as('content_manager');
        $id = $this->postJson('/api/v1/admin/job-sources', $this->payload())->json('data.id');

        $this->patchJson("/api/v1/admin/job-sources/$id", ['config' => ['map' => ['title' => 'role']]])->assertOk()->assertJsonPath('data.config_summary.map.title', 'role');

        $cfg = JobSource::find($id)->config;
        $this->assertSame('https://feeds.example.test/acme.json?token=SECRET-TOKEN', $cfg['url']);
        $this->assertSame('Bearer SECRET-HEADER', $cfg['headers']['Authorization']);
    }

    public function test_reactivating_resets_the_failure_counter_and_changes_are_audited(): void
    {
        $this->as('content_manager');
        $s = $this->source(['active' => false]);
        $s->forceFill(['consecutive_failures' => 3])->save();

        $this->patchJson("/api/v1/admin/job-sources/{$s->id}", ['active' => true])->assertOk()->assertJsonPath('data.consecutive_failures', 0);
        $log = AuditLog::firstWhere('action', 'job_source.updated');
        $this->assertSameJson(['old' => false, 'new' => true], $log->changes['active']);
    }

    public function test_manual_run_queues_only_active_sources_and_runs_are_listed(): void
    {
        Queue::fake();
        $this->as('content_manager');
        $active = $this->source();
        $inactive = $this->source(['active' => false]);

        $this->postJson("/api/v1/admin/job-sources/{$active->id}/run")->assertStatus(202);
        Queue::assertPushed(RunJobImport::class, fn ($j) => $j->sourceId === $active->id);
        $this->postJson("/api/v1/admin/job-sources/{$inactive->id}/run")->assertStatus(422);

        $run = new JobImportRun(['status' => 'partial', 'created' => 3, 'invalid' => 1, 'error_samples' => ['missing_title'], 'started_at' => now()]);
        $run->job_source_id = $active->id;
        $run->save();
        $this->getJson("/api/v1/admin/job-sources/{$active->id}/runs")->assertOk()->assertJsonPath('data.0.error_samples', ['missing_title'])->assertJsonPath('data.0.created', 3);
        $this->getJson("/api/v1/admin/job-sources/{$active->id}")->assertJsonCount(1, 'data.recent_runs');
        $this->getJson('/api/v1/admin/job-sources/99999')->assertNotFound();
    }

    public function test_run_endpoint_imports_end_to_end_with_the_sync_queue(): void
    {
        Http::fake(['*' => Http::response($this->feed($this->item(['id' => 'e2e'])))]);
        $this->as('content_manager');
        $s = $this->source();

        $this->postJson("/api/v1/admin/job-sources/{$s->id}/run")->assertStatus(202);

        $this->assertSame(1, JobListing::count());
        $this->getJson("/api/v1/admin/job-sources/{$s->id}")->assertJsonPath('data.last_status', 'success');
    }

    public function test_delete_is_refused_for_a_source_with_data_and_allowed_for_an_empty_one(): void
    {
        $this->as('admin');
        $s = $this->source();
        Http::fake(['*' => Http::response($this->feed($this->item()))]);
        app(JobImportRunner::class)->run($s);
        $this->assertSame(1, JobListing::count());

        // BE-29: deleting would cascade to every listing and every user's saved jobs
        $this->deleteJson("/api/v1/admin/job-sources/{$s->id}")->assertStatus(409)->assertJsonPath('error.code', 'source_has_data');
        $this->assertSame(1, JobListing::count());
        $empty = $this->source();
        $this->deleteJson("/api/v1/admin/job-sources/{$empty->id}")->assertNoContent();

        $this->as('content_manager');
        $s2 = $this->source();
        $this->deleteJson("/api/v1/admin/job-sources/{$s2->id}")->assertForbidden(); // deleting a source is admin-only
    }

    public function test_moderation_lists_filters_and_hides_jobs(): void
    {
        $s = $this->source();
        Http::fake(['*' => Http::response($this->feed($this->item(['id' => 'a', 'title' => 'Alpha role']), $this->item(['id' => 'b', 'title' => 'Beta role'])))]);
        app(JobImportRunner::class)->run($s);
        $a = JobListing::where('external_id', 'a')->first();

        $this->as('editor');
        $this->getJson('/api/v1/admin/jobs')->assertOk()->assertJsonPath('meta.total', 2);
        $this->getJson('/api/v1/admin/jobs?filter[q]=alpha')->assertJsonPath('meta.total', 1);
        $this->getJson("/api/v1/admin/jobs?filter[source_id]={$s->id}&filter[status]=published")->assertJsonPath('meta.total', 2);
        $this->getJson('/api/v1/admin/jobs?filter[status]=bogus')->assertStatus(422);
        $this->patchJson("/api/v1/admin/jobs/{$a->id}", ['status' => 'hidden'])->assertForbidden(); // hiding needs jobs.publish

        $this->as('content_manager');
        $this->patchJson("/api/v1/admin/jobs/{$a->id}", ['status' => 'hidden'])->assertOk()->assertJsonPath('data.status', 'hidden');
        $this->getJson("/api/v1/jobs/{$a->id}")->assertNotFound();
        $this->patchJson("/api/v1/admin/jobs/{$a->id}", ['status' => 'expired'])->assertStatus(422); // only publish/hide by hand
        $this->assertNotNull(AuditLog::firstWhere('action', 'job.status_changed'));
    }
}
