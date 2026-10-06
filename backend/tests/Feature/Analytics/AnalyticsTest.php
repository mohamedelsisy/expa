<?php

namespace Tests\Feature\Analytics;

use App\Domains\Access\Services\AccessSynchronizer;
use App\Domains\Guides\Models\Guide;
use App\Domains\Learning\Models\ItalianLesson;
use App\Domains\Profile\Services\ConsentService;
use App\Domains\Search\Models\SearchDocument;
use App\Models\User;
use Database\Seeders\DocumentTypeSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Tests\TestCase;

class AnalyticsTest extends TestCase
{
    use RefreshDatabase;

    private function counted(string $name, ?string $platform = null): int
    {
        return (int) DB::table('analytics_daily')->where('name', $name)->when($platform, fn ($q) => $q->where('platform', $platform))->sum('count');
    }

    /** Subjects must be real public slugs: register some in the search index. */
    private function indexed(string ...$slugs): void
    {
        foreach ($slugs as $slug) {
            SearchDocument::create(['type' => 'guide', 'item_id' => crc32($slug), 'slug' => $slug, 'locale' => 'ar', 'title' => $slug, 'search_title' => $slug, 'search_text' => $slug]);
        }
    }

    private function user(array $consents = []): User
    {
        $u = User::factory()->create();
        if ($consents) {
            app(ConsentService::class)->record($u, $consents);
        }
        $this->actingAs($u, 'sanctum');

        return $u;
    }

    // ---- privacy by construction --------------------------------------------------------------

    public function test_the_table_has_no_column_that_could_identify_a_person(): void
    {
        $cols = Schema::getColumnListing('analytics_daily');
        foreach (['user_id', 'ip', 'ip_hash', 'email', 'session_id', 'device_id', 'user_agent', 'properties', 'payload'] as $c) {
            $this->assertNotContains($c, $cols);
        }
        $this->assertEqualsCanonicalizing(['id', 'day', 'name', 'platform', 'locale', 'subject', 'count'], $cols);
    }

    public function test_nothing_personal_ends_up_in_the_table_after_real_activity(): void
    {
        $this->seed(DocumentTypeSeeder::class);
        $this->postJson('/api/v1/auth/register', ['name' => 'Sara Personal', 'email' => 'sara.personal@example.com', 'password' => 'Str0ngPassw0rd', 'password_confirmation' => 'Str0ngPassw0rd', 'accept_terms' => true, 'accept_privacy' => true])->assertCreated();
        $this->postJson('/api/v1/auth/login', ['email' => 'sara.personal@example.com', 'password' => 'Str0ngPassw0rd'], ['X-Client' => 'ios'])->assertOk();

        $dump = json_encode(DB::table('analytics_daily')->get());
        foreach (['Sara', 'personal', '@example.com', '127.0.0.1', 'Str0ng'] as $leak) {
            $this->assertStringNotContainsString($leak, $dump);
        }
        $this->assertSame(1, $this->counted('signup'));
    }

    // ---- client events & consent --------------------------------------------------------------

    public function test_client_events_need_consent_and_always_answer_204(): void
    {
        $this->indexed('codice-fiscale', 'x');
        $u = $this->user();
        $this->postJson('/api/v1/analytics/events', ['name' => 'guide_view', 'subject' => 'codice-fiscale'])->assertNoContent();
        $this->assertSame(0, $this->counted('guide_view')); // authenticated without analytics consent: dropped silently

        app(ConsentService::class)->record($u, ['analytics' => true]);
        $this->postJson('/api/v1/analytics/events', ['name' => 'guide_view', 'subject' => 'codice-fiscale'], ['X-Client' => 'web'])->assertNoContent();
        $this->assertSame(1, $this->counted('guide_view', 'web'));

        app(ConsentService::class)->record($u, ['analytics' => false]); // withdrawal stops it immediately
        $this->postJson('/api/v1/analytics/events', ['name' => 'guide_view', 'subject' => 'x'])->assertNoContent();
        $this->assertSame(1, $this->counted('guide_view'));
    }

    public function test_anonymous_events_require_the_consent_header(): void
    {
        $this->indexed('permesso');
        $this->postJson('/api/v1/analytics/events', ['name' => 'guide_view', 'subject' => 'permesso'])->assertNoContent();
        $this->assertSame(0, $this->counted('guide_view'));

        $this->postJson('/api/v1/analytics/events', ['name' => 'guide_view', 'subject' => 'permesso'], ['X-Analytics-Consent' => 'denied'])->assertNoContent();
        $this->assertSame(0, $this->counted('guide_view'));

        $this->postJson('/api/v1/analytics/events', ['name' => 'guide_view', 'subject' => 'permesso'], ['X-Analytics-Consent' => 'granted', 'X-Client' => 'android'])->assertNoContent();
        $this->assertSame(1, $this->counted('guide_view', 'android'));
    }

    public function test_counters_aggregate_per_day_platform_language_and_subject(): void
    {
        $this->indexed('a', 'b');
        $h = ['X-Analytics-Consent' => 'granted', 'X-Client' => 'web'];
        foreach (range(1, 3) as $_) {
            $this->postJson('/api/v1/analytics/events', ['name' => 'guide_view', 'subject' => 'a'], $h + ['Accept-Language' => 'ar']);
        }
        $this->postJson('/api/v1/analytics/events', ['name' => 'guide_view', 'subject' => 'a'], $h + ['Accept-Language' => 'it']);
        $this->postJson('/api/v1/analytics/events', ['name' => 'guide_view', 'subject' => 'b'], $h + ['Accept-Language' => 'ar']);

        $this->assertSame(3, DB::table('analytics_daily')->count()); // one row per distinct key, not per event
        $this->assertSame(3, (int) DB::table('analytics_daily')->where(['subject' => 'a', 'locale' => 'ar'])->value('count'));
        $this->travel(1)->day();
        $this->postJson('/api/v1/analytics/events', ['name' => 'guide_view', 'subject' => 'a'], $h + ['Accept-Language' => 'ar']);
        $this->assertSame(4, DB::table('analytics_daily')->count());
    }

    public function test_unknown_subjects_are_counted_without_a_subject_so_the_table_cannot_be_flooded(): void
    {
        $this->indexed('real-guide');
        $h = ['X-Analytics-Consent' => 'granted', 'X-Client' => 'web'];
        foreach (range(1, 50) as $i) {
            $this->postJson('/api/v1/analytics/events', ['name' => 'guide_view', 'subject' => "junk-$i"], $h)->assertNoContent();
        }
        $this->postJson('/api/v1/analytics/events', ['name' => 'guide_view', 'subject' => 'real-guide'], $h)->assertNoContent();

        $this->assertSame(2, DB::table('analytics_daily')->count());                      // '' bucket + the real slug, not 51 rows
        $this->assertSame(50, (int) DB::table('analytics_daily')->where('subject', '')->value('count'));
        $this->assertSame(1, (int) DB::table('analytics_daily')->where('subject', 'real-guide')->value('count'));
    }

    public function test_only_whitelisted_client_events_and_safe_subjects_are_accepted(): void
    {
        $h = ['X-Analytics-Consent' => 'granted'];
        foreach (['signup', 'login', 'ai_question', 'subscription_started', 'made_up', ''] as $name) {
            $this->postJson('/api/v1/analytics/events', ['name' => $name], $h)->assertStatus(422); // server-only or unknown events cannot be forged by clients
        }
        foreach (['has space', '<script>', 'a'.str_repeat('b', 130), "x\ny", '../../etc'] as $subject) {
            $this->postJson('/api/v1/analytics/events', ['name' => 'guide_view', 'subject' => $subject], $h)->assertStatus(422);
        }
        $this->postJson('/api/v1/analytics/events', [], $h)->assertStatus(422);
        $this->assertSame(0, DB::table('analytics_daily')->count());
    }

    public function test_events_that_do_not_allow_a_subject_never_store_one_and_platform_is_sanitized(): void
    {
        $this->postJson('/api/v1/analytics/events', ['name' => 'job_view', 'subject' => 'anything'], ['X-Analytics-Consent' => 'granted', 'X-Client' => "'; DROP TABLE users;--"])->assertNoContent();
        $row = DB::table('analytics_daily')->first();
        $this->assertSame(['job_view', '', 'api'], [$row->name, $row->subject, $row->platform]);
    }

    public function test_client_reporting_is_rate_limited(): void
    {
        $h = ['X-Analytics-Consent' => 'granted'];
        for ($i = 0; $i < 60; $i++) {
            $this->postJson('/api/v1/analytics/events', ['name' => 'job_view'], $h)->assertNoContent();
        }
        $this->postJson('/api/v1/analytics/events', ['name' => 'job_view'], $h)->assertStatus(429);
    }

    // ---- server-side system counters ----------------------------------------------------------

    public function test_system_counters_follow_real_actions(): void
    {
        $this->seed(DocumentTypeSeeder::class);
        $this->user(['document_storage' => true]);

        $this->postJson('/api/v1/my-documents', ['type' => 'passport', 'expiry_date' => now()->addDays(100)->toDateString()])->assertCreated();
        $this->assertSame(1, $this->counted('document_added'));
        $this->assertSame(1, $this->counted('reminder_created'));

        $this->postJson('/api/v1/ai/ask', ['message' => 'tell me about pizza'])->assertOk();
        $this->assertSame(1, $this->counted('ai_question'));

        ItalianLesson::factory()->published()->create(['slug' => 'l1']);
        $this->postJson('/api/v1/italian/lessons/l1/progress', ['status' => 'started'])->assertOk();
        $this->postJson('/api/v1/italian/lessons/l1/progress', ['status' => 'completed'])->assertOk();
        $this->postJson('/api/v1/italian/lessons/l1/progress', ['status' => 'completed'])->assertOk(); // re-completion is not counted again
        $this->assertSame([1, 1], [$this->counted('lesson_started'), $this->counted('lesson_completed')]);
        $this->assertSame('l1', DB::table('analytics_daily')->where('name', 'lesson_completed')->value('subject'));
    }

    public function test_system_counters_can_be_switched_off(): void
    {
        config(['analytics.system_events' => false]);
        $this->postJson('/api/v1/auth/register', ['name' => 'Sara', 'email' => 's@example.com', 'password' => 'Str0ngPassw0rd', 'password_confirmation' => 'Str0ngPassw0rd', 'accept_terms' => true, 'accept_privacy' => true])->assertCreated();
        $this->assertSame(0, DB::table('analytics_daily')->count());
    }

    public function test_analytics_failures_never_break_the_request(): void
    {
        Schema::drop('analytics_daily');
        $this->postJson('/api/v1/auth/register', ['name' => 'Sara', 'email' => 's2@example.com', 'password' => 'Str0ngPassw0rd', 'password_confirmation' => 'Str0ngPassw0rd', 'accept_terms' => true, 'accept_privacy' => true])->assertCreated();
    }

    // ---- admin reporting ----------------------------------------------------------------------

    private function staff(string $role): User
    {
        app(AccessSynchronizer::class)->sync();
        $u = User::factory()->create();
        $u->syncRoleKeys([$role]);
        $this->actingAs($u, 'sanctum');

        return $u;
    }

    public function test_reports_require_the_reports_permission(): void
    {
        $this->getJson('/api/v1/admin/stats')->assertUnauthorized();
        $this->staff('editor');
        $this->getJson('/api/v1/admin/stats')->assertForbidden();
        $this->getJson('/api/v1/admin/analytics')->assertForbidden();
        $this->staff('content_manager');
        $this->getJson('/api/v1/admin/stats')->assertOk();
        $this->getJson('/api/v1/admin/analytics')->assertOk();
    }

    public function test_analytics_report_totals_series_and_top_content(): void
    {
        $this->indexed('a', 'b');
        $h = ['X-Analytics-Consent' => 'granted'];
        foreach (['a', 'a', 'a', 'b'] as $s) {
            $this->postJson('/api/v1/analytics/events', ['name' => 'guide_view', 'subject' => $s], $h);
        }
        $this->postJson('/api/v1/analytics/events', ['name' => 'job_view'], $h);
        $this->staff('admin');

        $r = $this->getJson('/api/v1/admin/analytics')->assertOk()->json('data');
        $this->assertSame([['name' => 'guide_view', 'total' => 4], ['name' => 'job_view', 'total' => 1]], $r['totals']);
        $this->assertSame([['name' => 'guide_view', 'subject' => 'a', 'total' => 3], ['name' => 'guide_view', 'subject' => 'b', 'total' => 1]], $r['top_content']);
        $this->assertSame(now()->toDateString(), $r['daily'][0]['day']);

        $this->getJson('/api/v1/admin/analytics?name=job_view')->assertJsonCount(1, 'data.totals');
        $this->getJson('/api/v1/admin/analytics?from=2020-01-01&to=2020-01-31')->assertJsonPath('data.totals', []);
        $this->getJson('/api/v1/admin/analytics?from=2026-02-01&to=2026-01-01')->assertStatus(422);
    }

    public function test_admin_overview_has_the_dashboard_numbers_and_no_personal_data(): void
    {
        User::factory()->count(3)->create();
        $this->staff('admin');

        $d = $this->getJson('/api/v1/admin/stats')->assertOk()->json('data');
        $this->assertSame(['users', 'ai', 'content', 'jobs', 'billing', 'system'], array_keys($d));
        $this->assertSame(4, $d['users']['total']);
        $this->assertSame(4, $d['users']['new_30d']);
        $this->assertSame(0, $d['billing']['active_subscriptions']);
        $this->assertArrayHasKey('failed_queue_jobs', $d['system']);
        $this->assertStringNotContainsString('@', json_encode($d)); // no emails anywhere
    }

    public function test_the_backend_counts_guide_and_job_views_itself_only_with_consent(): void
    {
        $g = Guide::factory()->published()->create(['slug' => 'g-views']);
        SearchDocument::create(['type' => 'guide', 'item_id' => $g->id, 'slug' => 'g-views', 'locale' => 'ar', 'title' => 't', 'search_title' => 't', 'search_text' => 't']);

        $this->getJson('/api/v1/guides/g-views')->assertOk();                                  // no consent: not counted
        $this->assertSame(0, (int) \DB::table('analytics_daily')->where('name', 'guide_view')->sum('count'));
        $this->getJson('/api/v1/guides/g-views', ['X-Analytics-Consent' => 'granted'])->assertOk();
        $row = \DB::table('analytics_daily')->where('name', 'guide_view')->first();
        $this->assertSame([1, 'g-views'], [(int) $row->count, $row->subject]);
    }
}
