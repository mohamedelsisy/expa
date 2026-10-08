<?php

namespace Tests\Feature\ContentPipeline;

use App\Domains\Access\Services\AccessSynchronizer;
use App\Domains\Jobs\Models\JobListing;
use App\Domains\Jobs\Services\JobImportRunner;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\Support\JobFixtures;
use Tests\TestCase;

/** Job ingestion end to end through the admin API with a faked feed: legal basis gate -> run -> public -> moderate -> readiness. */
class JobIngestionPipelineTest extends TestCase
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

    public function test_source_needs_legal_basis_then_imports_publishes_and_can_be_hidden(): void
    {
        $this->as('content_manager');
        $src = [
            'key' => 'fixture-feed', 'name' => 'Fixture feed', 'driver' => 'json_feed',
            'config' => ['url' => 'https://feeds.example.test/fixture.json'], 'schedule_hours' => 6,
        ];

        // active without a documented legal basis is refused; the readiness report counts none as "active without basis"
        $this->postJson('/api/v1/admin/job-sources', $src + ['active' => true])->assertStatus(422)->assertJsonStructure(['error' => ['details' => ['legal_basis']]]);
        $this->postJson('/api/v1/admin/job-sources', $src + ['active' => true, 'legal_basis' => 'short'])->assertStatus(422);
        $id = $this->postJson('/api/v1/admin/job-sources', $src + ['active' => false])->assertCreated()->json('data.id');
        $this->postJson("/api/v1/admin/job-sources/$id/run")->assertStatus(422); // inactive sources never run

        $this->patchJson("/api/v1/admin/job-sources/$id", ['active' => true, 'legal_basis' => 'Fixture feed: the publisher terms allow automated reuse (test fixture).'])
            ->assertOk()->assertJsonPath('data.active', true);

        Http::fake(['feeds.example.test/*' => Http::response($this->feed(
            $this->item(['id' => 'a1', 'title' => 'Sviluppatore PHP Laravel']),
            $this->item(['id' => 'a2', 'title' => 'Cameriere sala']),
            $this->item(['id' => 'a1', 'title' => 'Sviluppatore PHP Laravel']),   // duplicate in the same feed
        ), 200)]);
        $this->postJson("/api/v1/admin/job-sources/$id/run")->assertStatus(202);

        $runs = $this->getJson("/api/v1/admin/job-sources/$id/runs")->assertOk()->json('data');
        $this->assertNotEmpty($runs);
        $this->assertSame(2, JobListing::where('job_source_id', $id)->count(), 'duplicates are collapsed');

        // public listing exposes the original application URL and the source; never claims sponsorship
        $list = $this->getJson('/api/v1/jobs')->assertOk()->json('data');
        $this->assertCount(2, $list);
        $this->assertNotContains(true, array_column(array_column($list, 'visa_sponsorship'), 'stated'), 'sponsorship is never claimed unless the source states it');

        // moderation: hide removes it from the public API
        $job = JobListing::where('job_source_id', $id)->first();
        $this->as('support_agent');
        $this->patchJson("/api/v1/admin/jobs/{$job->id}", ['status' => 'hidden'])->assertForbidden();
        $this->as('content_manager');
        $this->patchJson("/api/v1/admin/jobs/{$job->id}", ['status' => 'hidden'])->assertOk();
        $this->getJson("/api/v1/jobs/{$job->id}")->assertNotFound();

        // readiness: jobs section reflects the source state; permission gated
        $jobs = $this->getJson('/api/v1/admin/content-readiness')->assertOk()->json('data.jobs');
        $this->assertSame(1, $jobs['sources_active']);
        $this->assertSame(0, $jobs['active_without_legal_basis']);
        $this->assertSame(1, $jobs['listings_listed']);
    }

    public function test_failing_feed_does_not_corrupt_existing_listings(): void
    {
        $this->as('content_manager');
        $source = $this->source();
        Http::fake(['feeds.example.test/*' => Http::sequence()->push($this->feed($this->item(['id' => 'ok1'])), 200)->push('boom', 500)]);
        $this->postJson("/api/v1/admin/job-sources/{$source->id}/run")->assertStatus(202);
        $before = JobListing::count();
        $this->assertSame(1, $before);

        $run = app(JobImportRunner::class)->run($source->fresh()); // the queued job would retry; the runner records the failure
        $this->assertSame('failed', $run->status);
        $this->assertSame($before, JobListing::where('status', 'published')->count());
        app(JobImportRunner::class)->registerFailure($source->fresh());
        $this->assertGreaterThan(0, $this->getJson('/api/v1/admin/content-readiness')->json('data.jobs.sources_failing'));
    }

    public function test_readiness_endpoint_is_permission_gated_and_counts_without_leaking_content(): void
    {
        $this->getJson('/api/v1/admin/content-readiness')->assertUnauthorized();
        $this->as('user');
        $this->getJson('/api/v1/admin/content-readiness')->assertForbidden();
        $this->as('content_manager');
        $r = $this->getJson('/api/v1/admin/content-readiness')->assertOk()->assertJsonStructure(['data' => ['generated_at', 'types' => [['type', 'published', 'draft', 'review', 'stale', 'unverified', 'ready']], 'jobs', 'totals']]);
        $this->assertCount(count(config('content.models')), $r->json('data.types'));
        $this->assertSame(0, $r->json('data.totals.published'));
        $this->artisan('expa:content-readiness --json')->assertSuccessful();
        $this->artisan('expa:content-verify-sources')->assertSuccessful();
    }
}
