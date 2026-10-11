<?php

namespace Tests\Feature\DataImport;

use App\Domains\Jobs\Models\JobListing;
use App\Domains\Jobs\Models\JobSource;
use App\Domains\Jobs\Services\JobLinkVerifier;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

/** URLs below are FIXTURES for the HTTP fake only (no real request is made). */
class JobsVerifyLinksTest extends TestCase
{
    use RefreshDatabase;

    private ?JobSource $source = null;

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
        Http::assertSentCount(9); // 9 https URLs checked once each (+1 hop for the benign redirect, -1 request that timed out before a response); the http URL and the hidden listing are never requested

        // content is never edited
        JobListing::all()->each(fn ($j) => $this->assertEquals($before[$j->id], $j->only(['title', 'company', 'description', 'apply_url', 'expires_at', 'content_hash'])));
        $this->assertCount(1, Storage::disk('local')->allFiles('jobs-verify'));
    }

    public function test_dry_run_changes_nothing_and_expired_jobs_leave_the_public_list(): void
    {
        Storage::fake('local');
        $gone = $this->job('gone', 'https://careers.example.test/jobs/2');
        $live = $this->job('live', 'https://careers.example.test/jobs/1');
        Http::fake(['careers.example.test/jobs/2' => Http::response('', 404), 'careers.example.test/jobs/1' => Http::response('', 200)]);

        $this->artisan('expa:jobs-verify-links', ['--delay' => 0, '--dry-run' => true])->assertSuccessful();
        $this->assertSame('published', $gone->fresh()->status);

        $this->artisan('expa:jobs-verify-links', ['--delay' => 0, '--id' => [$gone->id]])->assertSuccessful();
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
}
