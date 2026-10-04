<?php

namespace Tests\Feature\Jobs;

use App\Domains\Access\Services\AccessSynchronizer;
use App\Domains\Jobs\Models\JobImportRun;
use App\Domains\Jobs\Models\JobListing;
use App\Domains\Jobs\Models\JobSource;
use App\Domains\Jobs\Services\JobImportRunner;
use App\Domains\Jobs\Services\SafeHttp;
use App\Domains\Notifications\Models\UserNotification;
use App\Jobs\RunJobImport;
use App\Models\User;
use Database\Seeders\GeographySeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Client\Factory;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Queue;
use RuntimeException;
use Tests\Support\JobFixtures;
use Tests\TestCase;

class JobPipelineTest extends TestCase
{
    use JobFixtures, RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(GeographySeeder::class);
    }

    private function import(JobSource $s, string $body, int $status = 200): JobImportRun
    {
        // Http::fake() stacks stubs (first match wins), so each call needs a fresh client.
        Http::swap(new Factory);
        Http::fake(['*' => Http::response($body, $status)]);

        return app(JobImportRunner::class)->run($s);
    }

    // ---- happy path & enrichment --------------------------------------------------------------

    public function test_json_feed_is_imported_normalized_extracted_and_classified(): void
    {
        $run = $this->import($s = $this->source(), $this->feed($this->item([
            'title' => 'Sviluppatore PHP', 'company' => ' Acme  Srl ', 'location' => 'Milano',
            'description' => '<p>Cerchiamo uno <b>sviluppatore</b> con 3 anni di esperienza in PHP, Laravel e MySQL.<br>Richiesto italiano B1 e inglese B2. Smart working 3 giorni, tempo pieno. RAL €32.000 - €38.000.</p><script>alert(1)</script>',
        ])));

        $this->assertSame(['success', 1, 1], [$run->status, $run->fetched, $run->created]);
        $j = JobListing::first();
        $this->assertSame('Acme Srl', $j->company);
        $this->assertStringNotContainsString('<', $j->description);
        $this->assertStringContainsString('alert(1)', $j->description); // text kept, markup gone
        $this->assertSame('tech', $j->category);
        $this->assertSame('remote', $j->remote_mode->value);
        $this->assertSame('full_time', $j->employment_type->value);
        $this->assertSame(['b1', 'b2', 3], [$j->italian_level->value, $j->english_level->value, $j->experience_years]);
        $this->assertEqualsCanonicalizing(['php', 'laravel', 'mysql'], $j->skills);
        $this->assertSame([32000, 38000, 'EUR', 'year'], [$j->salary_min, $j->salary_max, $j->salary_currency, $j->salary_period]);
        $this->assertSame('milano', $j->city->slug);
        $this->assertSame('published', $j->status);
        $this->assertSame($s->id, $j->job_source_id);
        $this->assertSame('success', $s->fresh()->last_status);
    }

    public function test_structured_fields_win_over_text_extraction_and_sponsorship_is_never_inferred(): void
    {
        $this->import($this->source(), $this->feed(
            $this->item(['id' => 'a', 'employment_type' => 'part_time', 'remote' => 'onsite', 'salary_min' => 18000, 'salary_max' => 22000, 'salary_currency' => 'eur', 'salary_period' => 'year',
                'description' => 'Full time remote position, we offer visa sponsorship for the right candidate. RAL €99.999.']),
            $this->item(['id' => 'b', 'title' => 'Other role', 'visa_sponsorship' => true]),
        ));

        $a = JobListing::where('external_id', 'a')->first();
        $this->assertSame(['part_time', 'onsite', 18000, 22000, 'EUR'], [$a->employment_type->value, $a->remote_mode->value, $a->salary_min, $a->salary_max, $a->salary_currency]);
        $this->assertFalse($a->visa_sponsorship_stated, 'text mentioning sponsorship must not set the flag');
        $this->assertTrue(JobListing::where('external_id', 'b')->first()->visa_sponsorship_stated);
    }

    public function test_custom_mapping_and_items_path_and_company_default(): void
    {
        $s = $this->source(['config' => ['url' => 'https://feeds.example.test/x.json', 'items_path' => 'data.vacancies',
            'map' => ['external_id' => 'ref', 'title' => 'role', 'description' => 'text', 'apply_url' => 'link', 'published_at' => 'date', 'location_text' => 'where'], 'company_default' => 'Comune di Test']]);
        $body = json_encode(['data' => ['vacancies' => [[
            'ref' => 'R1', 'role' => 'Operatore socio sanitario', 'text' => 'Si cerca OSS con esperienza di 2 anni in struttura per anziani, turni notturni inclusi.',
            'link' => 'https://careers.example.test/r1', 'date' => '2026-09-01', 'where' => 'Torino',
        ]]]]);

        $this->assertSame(1, $this->import($s, $body)->created);
        $j = JobListing::first();
        $this->assertSame(['Comune di Test', 'healthcare', 'torino'], [$j->company, $j->category, $j->city->slug]);
    }

    public function test_rss_feed_is_imported(): void
    {
        $rss = '<?xml version="1.0"?><rss version="2.0"><channel><title>x</title>'
            .'<item><title>Cameriere di sala</title><link>https://careers.example.test/c1</link><guid>g-1</guid><author>Trattoria Rossi</author>'
            .'<pubDate>'.now()->subDay()->toRfc2822String().'</pubDate><description><![CDATA[<p>Cerchiamo cameriere con esperienza di 1 anno, part time, Firenze.</p>]]></description></item></channel></rss>';

        $run = $this->import($this->source(['driver' => 'rss']), $rss);

        $this->assertSame(1, $run->created);
        $j = JobListing::first();
        $this->assertSame(['hospitality', 'part_time', 'Trattoria Rossi', 'g-1'], [$j->category, $j->employment_type->value, $j->company, $j->external_id]);
    }

    public function test_rss_xxe_and_external_entities_are_not_expanded(): void
    {
        $secret = tempnam(sys_get_temp_dir(), 'xxe');
        file_put_contents($secret, 'TOPSECRET-CONTENT');
        $rss = '<?xml version="1.0"?><!DOCTYPE r [<!ENTITY x SYSTEM "file://'.$secret.'">]><rss version="2.0"><channel><title>t</title>'
            .'<item><title>&x;</title><link>https://careers.example.test/x</link><guid>x</guid><author>A</author><pubDate>'.now()->subDay()->toRfc2822String().'</pubDate><description>Descrizione abbastanza lunga per superare la validazione minima.</description></item></channel></rss>';

        $this->import($this->source(['driver' => 'rss']), $rss);
        unlink($secret);

        $this->assertSame(0, JobListing::where('title', 'like', '%TOPSECRET%')->count());
        $this->assertStringNotContainsString('TOPSECRET', json_encode(JobListing::all()->toArray()));
    }

    // ---- validation & partial failure ---------------------------------------------------------

    public function test_invalid_items_are_rejected_with_reasons_and_never_abort_the_run(): void
    {
        $run = $this->import($this->source(), $this->feed(
            $this->item(['id' => 'ok']),
            $this->item(['id' => 'no-title', 'title' => '']),
            $this->item(['id' => 'http', 'url' => 'http://careers.example.test/insecure']),
            $this->item(['id' => 'creds', 'url' => 'https://user:pw@careers.example.test/x']),
            $this->item(['id' => 'js', 'url' => 'javascript:alert(1)']),
            $this->item(['id' => 'future', 'published_at' => now()->addDays(3)->toIso8601String()]),
            $this->item(['id' => 'expired', 'expires_at' => now()->subDay()->toIso8601String()]),
            $this->item(['id' => 'short', 'description' => 'Too short.']),
            $this->item(['id' => 'badrange', 'salary_min' => 40000, 'salary_max' => 20000]),
            ['id' => 'garbage'],
        ));

        $this->assertSame(['partial', 10, 1, 9], [$run->status, $run->fetched, $run->created, $run->invalid]);
        $this->assertSame(['ok'], JobListing::pluck('external_id')->all());
        $this->assertContains('missing_title', $run->error_samples);
        $this->assertContains('invalid_apply_url', $run->error_samples);
        $this->assertContains('published_in_future', $run->error_samples);
        $this->assertContains('description_too_short', $run->error_samples);
        $this->assertStringNotContainsString('javascript', json_encode($run->error_samples)); // reasons only, never raw content
    }

    public function test_a_feed_where_everything_is_invalid_is_a_failed_run(): void
    {
        $run = $this->import($this->source(), $this->feed(['id' => '1'], ['id' => '2']));
        $this->assertSame(['failed', 2, 0], [$run->status, $run->fetched, $run->created]);
    }

    public function test_an_empty_feed_is_a_successful_empty_run(): void
    {
        $this->assertSame('success', $this->import($this->source(), '[]')->status);
    }

    // ---- dedupe, updates, lifecycle -----------------------------------------------------------

    public function test_unchanged_changed_and_reappearing_jobs(): void
    {
        $s = $this->source();
        $item = $this->item(['id' => 'x1']);
        $this->import($s, $this->feed($item));

        $this->assertSame(1, $this->import($s, $this->feed($item))->unchanged);
        $this->assertSame(1, JobListing::count());

        $changed = $this->item(['id' => 'x1', 'title' => $item['title'], 'description' => $item['description'].' Aggiornamento: nuova sede e benefit.']);
        $this->assertSame(1, $this->import($s, $this->feed($changed))->updated);
        $this->assertStringContainsString('Aggiornamento', JobListing::first()->description);

        JobListing::first()->update(['status' => 'hidden']); // moderator decision survives updates
        $this->import($s, $this->feed($item));
        $this->assertSame('hidden', JobListing::first()->status);

        JobListing::first()->update(['status' => 'expired']);
        $this->assertSame(1, $this->import($s, $this->feed($changed))->updated);
        $this->assertSame('published', JobListing::first()->fresh()->status); // reappeared in the feed
    }

    public function test_the_same_vacancy_from_two_sources_or_with_a_new_id_is_a_duplicate(): void
    {
        $a = $this->source();
        $b = $this->source();
        $item = $this->item(['id' => 'a1', 'title' => 'Magazziniere', 'company' => 'LogiCo S.r.l.', 'location' => 'Padova']);
        $this->import($a, $this->feed($item));

        $r = $this->import($b, $this->feed(['id' => 'zzz', 'title' => ' MAGAZZINIERE ', 'company' => 'logico s.r.l.', 'location' => 'padova'] + $item));
        $this->assertSame([0, 1], [$r->created, $r->duplicates]);

        $r = $this->import($a, $this->feed($item, ['id' => 'a2-reposted'] + $item));
        $this->assertSame(1, $r->duplicates);
        $this->assertSame(1, JobListing::count());

        // an expired earlier posting does not block a fresh vacancy with the same title
        JobListing::first()->update(['status' => 'expired']);
        $this->assertSame(1, $this->import($b, $this->feed(['id' => 'new-1'] + $item))->created);
    }

    public function test_jobs_missing_from_a_later_feed_are_left_alone(): void
    {
        $s = $this->source();
        $this->import($s, $this->feed($this->item(['id' => 'keep'])));
        $this->import($s, $this->feed($this->item(['id' => 'other'])));
        $this->assertSame(2, JobListing::where('status', 'published')->count());
    }

    public function test_expire_command_handles_explicit_expiry_and_default_lifetime(): void
    {
        config(['jobs.expire_after_days' => 30]);
        $s = $this->source();
        $this->import($s, $this->feed(
            $this->item(['id' => 'a', 'expires_at' => now()->addDays(5)->toIso8601String()]),
            $this->item(['id' => 'b', 'title' => 'Aging one', 'published_at' => now()->subDays(20)->toIso8601String()]), // lives until day 30 without an expiry
            $this->item(['id' => 'c', 'title' => 'Fresh one']),
        ));
        $this->assertSame(3, JobListing::where('status', 'published')->count());

        $this->travel(11)->days(); // a: explicit expiry passed; b: now 31 days old; c: 13 days old
        $this->artisan('expa:jobs-expire')->expectsOutputToContain('Expired 2')->assertSuccessful();
        $this->assertSame('published', JobListing::where('external_id', 'c')->value('status'));
        $this->assertSame(['expired', 'expired'], JobListing::whereIn('external_id', ['a', 'b'])->orderBy('external_id')->pluck('status')->all());
    }

    // ---- failure isolation --------------------------------------------------------------------

    public function test_a_failed_fetch_leaves_existing_jobs_untouched_and_leaks_nothing(): void
    {
        $s = $this->source(['config' => ['url' => 'https://feeds.example.test/jobs.json?token=SECRET-TOKEN']]);
        $this->import($s, $this->feed($this->item(['id' => 'x'])));
        $snap = fn () => JobListing::first()->only(['title', 'status', 'content_hash']) + ['updated_at' => JobListing::first()->updated_at->toDateTimeString()];
        $before = $snap();

        foreach ([[$this->feed($this->item()), 500], ['not json at all', 200], ['{"a":1}', 200]] as [$body, $status]) {
            $run = $this->import($s, $body, $status);
            $this->assertSame('failed', $run->status);
            $this->assertSame(0, $run->created);
            $this->assertStringNotContainsString('SECRET-TOKEN', (string) $run->error_message);
        }
        $this->assertSame($before, $snap());
        $this->assertSame(1, JobListing::count());
        $this->assertSame('failed', $s->fresh()->last_status);
    }

    public function test_network_exceptions_are_recorded_safely(): void
    {
        Http::fake(fn () => throw new ConnectionException('cURL error: could not resolve host feeds.example.test?token=SECRET'));
        $run = app(JobImportRunner::class)->run($this->source());

        $this->assertSame('failed', $run->status);
        $this->assertStringNotContainsString('SECRET', (string) $run->error_message);
    }

    public function test_repeated_failures_deactivate_the_source_and_alert_admins(): void
    {
        app(AccessSynchronizer::class)->sync();
        $admin = User::factory()->create();
        $admin->syncRoleKeys(['admin']);
        $bystander = User::factory()->create();
        $bystander->syncRoleKeys(['user']);
        $s = $this->source(['name' => 'Fragile feed']);
        $runner = app(JobImportRunner::class);

        $runner->registerFailure($s);
        $runner->registerFailure($s);
        $this->assertTrue($s->fresh()->active);
        $this->assertSame(0, UserNotification::count());

        $runner->registerFailure($s);
        $this->assertFalse($s->fresh()->active);
        $n = UserNotification::first();
        $this->assertSame([$admin->id, 'job_source_failing'], [$n->user_id, $n->type]);
        $this->assertSame(1, UserNotification::count());

        $this->actingAs($admin, 'sanctum');
        $this->assertStringContainsString('Fragile feed', $this->getJson('/api/v1/notifications', ['Accept-Language' => 'en'])->json('data.0.body'));
    }

    public function test_a_successful_run_resets_nothing_it_should_not_and_failures_reset_on_success(): void
    {
        $s = $this->source();
        $s->forceFill(['consecutive_failures' => 2])->save();
        $this->import($s, $this->feed($this->item()));
        $this->assertSame(0, $s->fresh()->consecutive_failures);
    }

    // ---- scheduling & queue -------------------------------------------------------------------

    public function test_scheduler_queues_only_due_active_sources(): void
    {
        Queue::fake();
        $due = $this->source(['last_run_at' => now()->subHours(7)]);
        $this->source(['last_run_at' => now()->subHours(2)]);               // ran recently
        $this->source(['active' => false, 'last_run_at' => null]);           // inactive
        $never = $this->source();                                           // never ran
        $custom = $this->source(['schedule_hours' => 1, 'last_run_at' => now()->subHours(2)]);

        $this->artisan('expa:jobs-import')->expectsOutputToContain('Queued 3')->assertSuccessful();
        Queue::assertPushed(RunJobImport::class, 3);
        foreach ([$due, $never, $custom] as $s) {
            Queue::assertPushed(RunJobImport::class, fn ($j) => $j->sourceId === $s->id);
        }
    }

    public function test_source_option_forces_a_run_ignoring_the_schedule(): void
    {
        Queue::fake();
        $s = $this->source(['key' => 'force-me', 'last_run_at' => now()]);
        $this->artisan('expa:jobs-import', ['--source' => 'force-me'])->expectsOutputToContain('Queued 1')->assertSuccessful();
        Queue::assertPushed(RunJobImport::class, fn ($j) => $j->sourceId === $s->id);
    }

    public function test_queue_job_retries_on_fetch_failure_and_registers_failure_only_when_exhausted(): void
    {
        Http::fake(['*' => Http::response('boom', 500)]);
        $s = $this->source();
        $job = new RunJobImport($s->id);

        try {
            $job->handle(app(JobImportRunner::class));
            $this->fail('should throw so the queue retries');
        } catch (RuntimeException) {
        }
        $this->assertSame(0, $s->fresh()->consecutive_failures); // a single attempt does not count

        $job->failed(new RuntimeException('final'));
        $this->assertSame(1, $s->fresh()->consecutive_failures);
        $this->assertSame(3, $job->tries);
        $this->assertSame([60, 300, 900], $job->backoff());
    }

    public function test_queue_job_ignores_inactive_or_deleted_sources(): void
    {
        Http::fake();
        $s = $this->source(['active' => false]);
        (new RunJobImport($s->id))->handle(app(JobImportRunner::class));
        (new RunJobImport(999999))->handle(app(JobImportRunner::class));
        Http::assertNothingSent();
    }

    // ---- SSRF ---------------------------------------------------------------------------------

    public function test_safe_http_blocks_unsafe_urls(): void
    {
        config(['jobs.ssrf_dns_check' => true]);
        $http = app(SafeHttp::class);
        foreach ([
            'http://feeds.example.test/x', 'ftp://x.test/f', 'https://user:pw@feeds.example.test/x', 'https://localhost/x', 'https://printer.local/x',
            'https://127.0.0.1/x', 'https://10.0.0.5/x', 'https://192.168.1.10/x', 'https://169.254.169.254/latest/meta-data', 'https://[::1]/x', 'not a url',
        ] as $url) {
            try {
                $http->assertSafe($url);
                $this->fail("should block $url");
            } catch (RuntimeException $e) {
                $this->assertNotEmpty($e->getMessage());
            }
        }
    }

    public function test_safe_http_refuses_redirects_oversize_and_errors(): void
    {
        $http = app(SafeHttp::class);
        Http::fake(['*redirect*' => Http::response('', 302, ['Location' => 'https://evil.test/'])]);
        $this->expectException(RuntimeException::class);
        $http->get('https://feeds.example.test/redirect');
    }

    public function test_safe_http_enforces_size_limit(): void
    {
        config(['jobs.http.max_bytes' => 10]);
        Http::fake(['*' => Http::response(str_repeat('a', 100))]);
        $this->expectExceptionMessage('larger than');
        app(SafeHttp::class)->get('https://feeds.example.test/big');
    }

    public function test_source_config_is_encrypted_at_rest(): void
    {
        $s = $this->source(['config' => ['url' => 'https://feeds.example.test/x?token=TOP-SECRET-TOKEN', 'headers' => ['Authorization' => 'Bearer abc']]]);
        $raw = \DB::table('job_sources')->where('id', $s->id)->value('config');
        $this->assertStringNotContainsString('TOP-SECRET-TOKEN', $raw);
        $this->assertStringNotContainsString('Bearer', $raw);
        $this->assertSame('Bearer abc', $s->fresh()->config['headers']['Authorization']);
    }

    public function test_tables_do_not_collide_with_the_queue_tables(): void
    {
        $this->assertTrue(\Schema::hasTable('jobs'));          // Laravel's queue table
        $this->assertTrue(\Schema::hasTable('job_listings'));  // ours
        $this->assertTrue(\Schema::hasColumn('jobs', 'queue'));
    }
}
