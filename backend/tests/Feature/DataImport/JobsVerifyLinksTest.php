<?php

namespace Tests\Feature\DataImport;

use App\Domains\Jobs\Models\JobListing;
use App\Domains\Jobs\Models\JobSource;
use App\Domains\Jobs\Services\JobLinkVerifier;
use App\Support\Http\PublicHostGuard;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Client\Factory as HttpFactory;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

/** URLs below are FIXTURES for the HTTP fake only (no real request is made). */
class JobsVerifyLinksTest extends TestCase
{
    use RefreshDatabase;

    private ?JobSource $source = null;

    /** @var array<string,list<string>> host => addresses; anything not listed resolves to a public address */
    private array $dns = [];

    protected function setUp(): void
    {
        parent::setUp();
        // No real DNS in tests: the guard resolves through this map (fixtures live on the reserved .test TLD).
        $this->app->instance(PublicHostGuard::class, new PublicHostGuard(fn (string $host) => $this->dns[$host] ?? ['93.184.216.34']));
    }

    private function job(string $slug, string $url, string $status = 'published'): JobListing
    {
        $this->source ??= JobSource::create(['key' => 'fixture', 'name' => 'Fixture', 'driver' => 'json_feed', 'legal_basis' => 'fixture', 'active' => false]);

        return JobListing::create([
            'job_source_id' => $this->source->id, 'external_id' => $slug, 'dedupe_hash' => sha1($slug), 'title' => "Title $slug", 'company' => 'Fixture Co',
            'description' => "Desc $slug", 'apply_url' => $url, 'published_at' => now(), 'expires_at' => now()->addDays(10), 'status' => $status, 'content_hash' => sha1("c$slug"),
        ]);
    }

    public function test_clear_404_410_and_generic_redirect_expire_while_transient_errors_do_not(): void
    {
        Storage::fake('local');
        $ok = $this->job('ok', 'https://careers.example.test/jobs/1');
        $gone = $this->job('gone', 'https://careers.example.test/jobs/2');
        $gone410 = $this->job('gone410', 'https://careers.example.test/jobs/3');
        $generic = $this->job('generic', 'https://careers.example.test/it/jobs/4/title');
        $specific = $this->job('moved', 'https://careers.example.test/jobs/5');
        $forbidden = $this->job('forbidden', 'https://careers.example.test/jobs/6');
        $server = $this->job('server', 'https://careers.example.test/jobs/7');
        $timeout = $this->job('timeout', 'https://careers.example.test/jobs/8');
        $http = $this->job('http', 'http://careers.example.test/jobs/9');
        $rate = $this->job('rate', 'https://careers.example.test/jobs/10');
        $untouched = $this->job('hidden', 'https://careers.example.test/jobs/11', 'hidden');

        Http::fake([
            'careers.example.test/jobs/1' => Http::response('', 200),
            'careers.example.test/jobs/2' => Http::response('', 404),
            'careers.example.test/jobs/3' => Http::response('', 410),
            'careers.example.test/it/jobs/4/title' => Http::response('', 302, ['Location' => 'https://careers.example.test/it/']),
            'careers.example.test/jobs/5' => Http::response('', 301, ['Location' => '/jobs/5-new-slug']),
            'careers.example.test/jobs/5-new-slug' => Http::response('', 200),
            'careers.example.test/jobs/6' => Http::response('', 403),
            'careers.example.test/jobs/7' => Http::response('', 503),
            'careers.example.test/jobs/8' => fn () => throw new ConnectionException('timeout'),
            'careers.example.test/jobs/10' => Http::response('', 429),
        ]);
        $before = JobListing::all()->keyBy('id')->map->only(['title', 'company', 'description', 'apply_url', 'expires_at', 'content_hash']);

        $this->artisan('expa:jobs-verify-links', ['--delay' => 0])->assertSuccessful();

        $status = fn (JobListing $j) => $j->fresh()->status;
        // First sighting only flags: nothing is expired on a single check.
        foreach ([$gone, $gone410, $generic] as $j) {
            $this->assertSame('published', $status($j), "{$j->external_id} flagged, not yet expired");
            $this->assertSame(1, $j->fresh()->link_failures);
        }
        Http::assertSentCount(9); // 9 https URLs checked once each (+1 hop for the benign redirect, -1 request that timed out before a response); the http URL and the hidden listing are never requested

        $this->travel(13)->hours();
        $this->artisan('expa:jobs-verify-links', ['--delay' => 0])->assertSuccessful();

        $this->assertSame('published', $status($ok));
        $this->assertSame('expired', $status($gone));
        $this->assertSame('expired', $status($gone410));
        $this->assertSame('expired', $status($generic));
        $this->assertSame('published', $status($specific));
        foreach ([$forbidden, $server, $timeout, $http, $rate] as $j) {
            $this->assertSame('published', $status($j), "{$j->external_id} is unverified, not expired");
        }
        $this->assertSame('hidden', $status($untouched));
        Http::assertNotSent(fn ($r) => str_starts_with($r->url(), 'http://'));

        // content is never edited
        JobListing::all()->each(fn ($j) => $this->assertEquals($before[$j->id], $j->only(['title', 'company', 'description', 'apply_url', 'expires_at', 'content_hash'])));
        $this->assertCount(2, Storage::disk('local')->allFiles('jobs-verify'), 'one report per run');
    }

    public function test_dry_run_changes_nothing_and_expired_jobs_leave_the_public_list(): void
    {
        Storage::fake('local');
        $gone = $this->job('gone', 'https://careers.example.test/jobs/2');
        $live = $this->job('live', 'https://careers.example.test/jobs/1');
        Http::fake(['careers.example.test/jobs/2' => Http::response('', 404), 'careers.example.test/jobs/1' => Http::response('', 200)]);

        $this->artisan('expa:jobs-verify-links', ['--delay' => 0, '--dry-run' => true])->assertSuccessful();
        $this->assertSame('published', $gone->fresh()->status);
        $this->assertSame(0, $gone->fresh()->link_failures, 'dry-run writes nothing');

        $this->artisan('expa:jobs-verify-links', ['--delay' => 0, '--id' => [$gone->id], '--expire-after' => 1])->assertSuccessful();
        $this->assertSame('expired', $gone->fresh()->status);
        $this->assertSame('published', $live->fresh()->status);
        $this->assertSame([$live->id], JobListing::listed()->pluck('id')->all());
    }

    public function test_verifier_only_follows_https_public_hosts_and_classifies_generic_paths(): void
    {
        $v = app(JobLinkVerifier::class);
        Http::fake();
        foreach (['http://careers.example.test/x', 'https://127.0.0.1/x', 'https://localhost/x', 'ftp://careers.example.test/x', 'https://user:pw@careers.example.test/x'] as $url) {
            $this->assertSame('unverified', $v->check($url)['verdict'], $url);
        }
        Http::assertNothingSent();
    }

    public function test_redirect_leaving_https_is_unverified_and_generic_paths_are_classified(): void
    {
        $v = app(JobLinkVerifier::class);
        Http::fake(['careers.example.test/a' => Http::response('', 302, ['Location' => 'http://careers.example.test/b'])]);
        $this->assertSame('unverified', $v->check('https://careers.example.test/a')['verdict']);

        foreach (['https://x.test/', 'https://x.test/en', 'https://x.test/en-gb/', 'https://x.test/it/lavoro', 'https://x.test/jobs'] as $generic) {
            $this->assertTrue($v->isGenericPath($generic), $generic);
        }
        foreach (['https://x.test/en/jobs/123', 'https://x.test/it/lavoro/roma/job/1', 'https://x.test/tsmg/6517b738'] as $specific) {
            $this->assertFalse($v->isGenericPath($specific), $specific);
        }
    }

    /** Http::fake() stubs are first-match-wins, so a changed answer needs a fresh client. */
    private function answer(int $status): void
    {
        $this->app->forgetInstance(HttpFactory::class);
        Http::clearResolvedInstances();
        Http::fake(['careers.example.test/jobs/1' => Http::response('', $status)]);
    }

    public function test_a_single_failure_never_expires_and_a_good_check_resets_the_streak(): void
    {
        Storage::fake('local');
        $job = $this->job('flaky', 'https://careers.example.test/jobs/1');

        $this->answer(404);
        $this->artisan('expa:jobs-verify-links', ['--delay' => 0])->assertSuccessful();
        $this->assertSame([1, 'published'], [$job->fresh()->link_failures, $job->fresh()->status]);

        // A second run inside the minimum gap does not count again.
        $this->artisan('expa:jobs-verify-links', ['--delay' => 0])->assertSuccessful();
        $this->assertSame([1, 'published'], [$job->fresh()->link_failures, $job->fresh()->status]);

        // The page comes back: the streak is cleared, so the next single failure starts from zero.
        $this->travel(13)->hours();
        $this->answer(200);
        $this->artisan('expa:jobs-verify-links', ['--delay' => 0])->assertSuccessful();
        $this->assertSame(0, $job->fresh()->link_failures);

        $this->travel(13)->hours();
        $this->answer(404);
        $this->artisan('expa:jobs-verify-links', ['--delay' => 0])->assertSuccessful();
        $this->assertSame([1, 'published'], [$job->fresh()->link_failures, $job->fresh()->status]);

        // Unverified results (403/503) neither count nor clear.
        $this->travel(13)->hours();
        $this->answer(503);
        $this->artisan('expa:jobs-verify-links', ['--delay' => 0])->assertSuccessful();
        $this->assertSame([1, 'published'], [$job->fresh()->link_failures, $job->fresh()->status]);
    }

    public function test_redirect_to_a_sign_in_page_or_a_slug_is_not_evidence_of_a_dead_listing(): void
    {
        $v = app(JobLinkVerifier::class);
        Http::fake([
            'careers.example.test/jobs/1' => Http::response('', 302, ['Location' => 'https://careers.example.test/login']),
            'careers.example.test/jobs/2' => Http::response('', 302, ['Location' => 'https://careers.example.test/it/accedi?next=/jobs/2']),
            'careers.example.test/jobs/3' => Http::response('', 301, ['Location' => 'https://careers.example.test/senior-barista-roma']),
            'careers.example.test/senior-barista-roma' => Http::response('', 200),
            'careers.example.test/jobs/4' => Http::response('', 302, ['Location' => 'https://careers.example.test/careers']),
        ]);

        $this->assertSame('unverified', $v->check('https://careers.example.test/jobs/1')['verdict']);
        $this->assertSame('unverified', $v->check('https://careers.example.test/jobs/2')['verdict']);
        $this->assertSame('ok', $v->check('https://careers.example.test/jobs/3')['verdict']);
        $this->assertSame('generic', $v->check('https://careers.example.test/jobs/4')['verdict']);
        $this->assertFalse($v->isGenericPath('https://x.test/senior-barista-roma'));
        $this->assertTrue($v->isGenericPath('https://x.test/it/careers'));
    }

    public function test_hosts_that_resolve_to_private_addresses_are_never_requested_even_through_redirects(): void
    {
        $this->dns = [
            'intranet.example.test' => ['10.0.0.5'],
            'rebind.example.test' => ['93.184.216.34', '127.0.0.1'],
            'v6.example.test' => ['::1'],
            'meta.example.test' => ['169.254.169.254'],
        ];
        $v = app(JobLinkVerifier::class);
        Http::fake(['careers.example.test/start' => Http::response('', 302, ['Location' => 'https://intranet.example.test/admin'])]);

        foreach (['https://127.1/x', 'https://0x7f.0.0.1/x', 'https://2130706433.com.1/x', 'https://svc.internal/x', 'https://printer.local/x', 'https://careers.example.test:8443/x',
            'https://intranet.example.test/x', 'https://rebind.example.test/x', 'https://v6.example.test/x', 'https://meta.example.test/x'] as $url) {
            $this->assertSame('unverified', $v->check($url)['verdict'], $url);
        }
        $redirected = $v->check('https://careers.example.test/start');
        $this->assertSame('unverified', $redirected['verdict']);
        $this->assertSame('redirect left https/public hosts', $redirected['reason']);

        Http::assertSentCount(1); // only the public start URL; the private redirect target and every direct private URL were never requested
    }

    public function test_an_unresolvable_host_is_unverified_not_expired(): void
    {
        $this->app->instance(PublicHostGuard::class, new PublicHostGuard(fn () => []));
        Http::fake();
        $this->assertSame('unverified', app(JobLinkVerifier::class)->check('https://nxdomain.example.test/x')['verdict']);
        Http::assertNothingSent();
    }
}
