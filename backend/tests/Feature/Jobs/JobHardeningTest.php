<?php

namespace Tests\Feature\Jobs;

use App\Domains\Jobs\Models\JobListing;
use App\Domains\Jobs\Models\JobSource;
use App\Domains\Jobs\Services\JobImportRunner;
use App\Domains\Jobs\Services\SafeHttp;
use App\Jobs\RunJobImport;
use App\Models\User;
use Database\Seeders\GeographySeeder;
use Illuminate\Contracts\Queue\ShouldBeUnique;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Client\Factory;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use RuntimeException;
use Tests\Support\JobFixtures;
use Tests\TestCase;

class JobHardeningTest extends TestCase
{
    use JobFixtures, RefreshDatabase;

    private function import(JobSource $s, string $body, int $status = 200)
    {
        Http::swap(new Factory);
        Http::fake(['*' => Http::response($body, $status)]);

        return app(JobImportRunner::class)->run($s);
    }

    public function test_entity_encoded_markup_in_feeds_never_becomes_live_markup(): void
    {
        $this->seed(GeographySeeder::class);
        $this->import($this->source(), $this->feed($this->item([
            'title' => 'Dev &lt;img src=x onerror=alert(1)&gt; senior',
            'company' => '&lt;script&gt;alert(2)&lt;/script&gt;Acme',
            'description' => '&amp;lt;b&amp;gt;double&amp;lt;/b&amp;gt; encoded &lt;a href="javascript:alert(3)"&gt;click&lt;/a&gt; and a real sentence about the job responsibilities.',
        ])));

        $j = JobListing::first();
        foreach ([$j->title, $j->company, $j->description] as $field) {
            $this->assertDoesNotMatchRegularExpression('/<\s*\/?\s*[a-z!]/i', $field, $field);
            $this->assertStringNotContainsString('onerror', $field);
        }
        $this->assertStringContainsString('senior', $j->title);
        $this->assertStringContainsString('Acme', $j->company);
        $this->assertStringContainsString('click', $j->description); // the visible text is kept
    }

    public function test_plain_comparison_symbols_in_text_survive(): void
    {
        $this->import($this->source(), $this->feed($this->item(['description' => 'Requisiti: età > 18 e stipendio < 40k; oppure 5 < 6. Descrizione abbastanza lunga per passare la validazione.'])));
        $this->assertStringContainsString('età > 18', JobListing::first()->description);
    }

    public function test_items_past_their_lifetime_are_skipped_silently_and_do_not_flap(): void
    {
        $s = $this->source();
        $old = $this->item(['id' => 'old', 'title' => 'Vecchia offerta', 'published_at' => now()->subDays(config('jobs.expire_after_days') + 5)->toIso8601String()]);
        $fresh = $this->item(['id' => 'new', 'title' => 'Nuova offerta']);

        $run = $this->import($s, $this->feed($old, $fresh));
        $this->assertSame(['success', 1, 1, 0], [$run->status, $run->created, $run->unchanged, $run->invalid]); // not "partial"
        $this->assertSame(['new'], JobListing::pluck('external_id')->all());

        // a job that was imported earlier and has since expired is not revived by a feed that keeps listing it
        $j = JobListing::first();
        $j->forceFill(['published_at' => now()->subDays(90), 'status' => 'expired'])->save();
        $this->import($s, $this->feed($old, $this->item(['id' => 'new', 'title' => 'Nuova offerta', 'published_at' => now()->subDays(90)->toIso8601String()])));
        $this->assertSame('expired', $j->fresh()->status);
        $this->artisan('expa:jobs-expire')->assertSuccessful();
        $this->assertSame('expired', $j->fresh()->status);
    }

    public function test_items_with_an_explicit_future_expiry_are_kept_even_when_old(): void
    {
        $this->import($this->source(), $this->feed($this->item(['published_at' => now()->subDays(100)->toIso8601String(), 'expires_at' => now()->addDays(10)->toIso8601String()])));
        $this->assertSame(1, JobListing::count());
    }

    public function test_one_import_per_source_at_a_time(): void
    {
        $job = new RunJobImport(42);
        $this->assertInstanceOf(ShouldBeUnique::class, $job);
        $this->assertSame('job-import-42', $job->uniqueId());
        $this->assertNotSame((new RunJobImport(43))->uniqueId(), $job->uniqueId());
        $this->assertGreaterThan(0, $job->uniqueFor);
    }

    public function test_saved_jobs_hide_moderated_and_expired_listings(): void
    {
        $s = $this->source();
        $mk = function (string $id, string $status) use ($s) {
            $j = new JobListing(['title' => "T $id", 'company' => 'C', 'description' => 'Descrizione abbastanza lunga.', 'apply_url' => 'https://c.example.test/'.$id, 'remote_mode' => 'onsite',
                'employment_type' => 'full_time', 'category' => 'tech', 'published_at' => now()->subDay(), 'status' => $status]);
            $j->job_source_id = $s->id;
            $j->external_id = $id;
            $j->dedupe_hash = sha1($id);
            $j->content_hash = sha1($id.'c');
            $j->save();

            return $j;
        };
        $ok = $mk('ok', 'published');
        $scam = $mk('scam', 'published');
        $u = User::factory()->create();
        $this->actingAs($u, 'sanctum');
        foreach ([$ok, $scam] as $j) {
            $this->postJson("/api/v1/jobs/{$j->id}/save")->assertNoContent();
        }

        $scam->update(['status' => 'hidden']);
        $this->assertSame([$ok->id], array_column($this->getJson('/api/v1/jobs/saved')->json('data'), 'id'));
        $this->assertSame(2, DB::table('job_saves')->count()); // the save rows remain; they are just not shown
    }

    public function test_fetch_failures_do_not_write_feed_urls_or_tokens_to_the_log(): void
    {
        Log::spy();
        Http::fake(fn () => throw new ConnectionException('cURL error 6: Could not resolve host: feeds.example.test?token=SECRET-TOKEN-123'));
        app(JobImportRunner::class)->run($this->source(['config' => ['url' => 'https://feeds.example.test/jobs.json?token=SECRET-TOKEN-123']]));

        Log::shouldHaveReceived('warning')->withArgs(fn ($msg, $ctx) => $msg === 'job_import.fetch_failed' && ! str_contains(json_encode($ctx), 'SECRET-TOKEN') && $ctx['host'] === 'feeds.example.test');
    }

    // ---- SSRF ---------------------------------------------------------------------------------

    public function test_cgnat_ipv6_and_mapped_addresses_are_blocked(): void
    {
        $http = app(SafeHttp::class);
        foreach (['https://100.100.100.200/x', 'https://100.64.0.1/x', 'https://[::1]/x', 'https://[fe80::1]/x', 'https://[fd00::1]/x', 'https://[::ffff:10.0.0.1]/x',
            'https://[::ffff:127.0.0.1]/x', 'https://0.0.0.0/x', 'https://169.254.169.254/x', 'https://x.localhost/x'] as $url) {
            try {
                $http->assertSafe($url);
                $this->fail("should block $url");
            } catch (RuntimeException) {
                $this->addToAssertionCount(1);
            }
        }
        $this->assertSame(['93.184.216.34'], $http->assertSafe('https://93.184.216.34/feed')); // a public literal passes and is returned for pinning
    }

    public function test_dns_results_with_any_private_address_are_rejected_and_names_must_resolve(): void
    {
        config(['jobs.ssrf_dns_check' => true]);
        $this->expectException(RuntimeException::class);
        $this->expectExceptionMessageMatches('/does not resolve|non-public/');
        app(SafeHttp::class)->assertSafe('https://this-host-should-never-exist.invalid/feed');
    }

    public function test_oversized_content_length_is_refused_before_the_body_is_read(): void
    {
        config(['jobs.http.max_bytes' => 100]);
        Http::fake(['*' => Http::response(str_repeat('a', 500), 200, ['Content-Length' => '500'])]);
        $this->expectExceptionMessage('larger than');
        app(SafeHttp::class)->get('https://93.184.216.34/big');
    }
}
