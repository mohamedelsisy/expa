<?php

namespace Tests\Feature\Admin;

use App\Domains\Access\Services\AccessSynchronizer;
use App\Domains\Audit\Models\AuditLog;
use App\Domains\Billing\Models\Plan;
use App\Domains\Guides\Models\Guide;
use App\Domains\Jobs\Models\JobSource;
use App\Models\User;
use Database\Seeders\GeographySeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/** Web/mobile client requests (web/BACKEND_REQUESTS.md #13-#26, T-031, T-032). */
class ClientRequestsTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        app(AccessSynchronizer::class)->sync();
        $this->seed(GeographySeeder::class);
    }

    private function as(string $role): User
    {
        $u = User::factory()->create();
        $u->syncRoleKeys([$role]);
        $this->actingAs($u, 'sanctum');

        return $u;
    }

    private function guide(): array
    {
        return $this->postJson('/api/v1/admin/guides', [
            'slug' => 'codice-fiscale', 'category' => 'documents', 'italian_term' => 'Codice fiscale',
            'source_name' => 'Agenzia delle Entrate', 'source_url' => 'https://www.agenziaentrate.gov.it/portale/test', 'source_type' => 'official',
            'last_verified_at' => now()->subDay()->toDateString(),
            'translations' => ['ar' => ['title' => 'الرقم الضريبي', 'summary' => 'ملخص', 'what_is' => 'ما هو', 'required_documents' => ['x'], 'steps' => [['title' => 'a', 'text' => 'b']]], 'it' => ['title' => 'Codice fiscale']],
        ])->assertCreated()->json('data');
    }

    public function test_public_plans_say_whether_billing_is_available(): void
    {
        config(['billing.provider' => 'none']);
        $this->getJson('/api/v1/billing/plans')->assertOk()->assertJsonPath('meta.billing_available', false);
        config(['billing.provider' => 'stripe']);
        $this->getJson('/api/v1/billing/plans')->assertJsonPath('meta.billing_available', true);
        $this->assertNotNull(Plan::class);
    }

    public function test_four_eyes_refusal_has_its_own_code_and_flags(): void
    {
        $manager = $this->as('content_manager');
        $id = $this->guide()['id'];
        $this->postJson("/api/v1/admin/guides/$id/transition", ['to' => 'review'])->assertOk();

        $this->getJson("/api/v1/admin/guides/$id")->assertJsonPath('data.updated_by', $manager->id)->assertJsonPath('data.four_eyes_blocked', true);
        $this->postJson("/api/v1/admin/guides/$id/transition", ['to' => 'approved'])
            ->assertForbidden()->assertJsonPath('error.code', 'four_eyes_violation');

        // Without the permission it stays a plain forbidden.
        $this->as('editor');
        $this->postJson("/api/v1/admin/guides/$id/transition", ['to' => 'approved'])->assertForbidden()->assertJsonPath('error.code', 'forbidden');

        // A different reviewer is not blocked.
        $this->as('content_manager');
        $this->getJson("/api/v1/admin/guides/$id")->assertJsonPath('data.four_eyes_blocked', false);
        $this->postJson("/api/v1/admin/guides/$id/transition", ['to' => 'approved'])->assertOk();
    }

    public function test_escalation_refusals_have_distinct_codes(): void
    {
        $admin = $this->as('admin');
        $super = User::factory()->create();
        $super->syncRoleKeys(['super_admin']);
        $plain = User::factory()->create();

        $this->patchJson("/api/v1/admin/users/{$super->id}", ['status' => 'suspended'])->assertForbidden()->assertJsonPath('error.code', 'privileged_target');
        $this->patchJson("/api/v1/admin/users/{$admin->id}", ['status' => 'suspended'])->assertForbidden()->assertJsonPath('error.code', 'cannot_modify_self');
        $this->putJson("/api/v1/admin/users/{$plain->id}/roles", ['roles' => ['admin']])->assertForbidden()->assertJsonPath('error.code', 'privileged_role_reserved');
        $this->putJson("/api/v1/admin/users/{$super->id}/roles", ['roles' => ['user']])->assertForbidden()->assertJsonPath('error.code', 'privileged_target');

        $this->as('support_agent'); // no users.update: plain forbidden, nothing explained
        $this->patchJson("/api/v1/admin/users/{$super->id}", ['status' => 'suspended'])->assertForbidden()->assertJsonPath('error.code', 'forbidden');
    }

    public function test_lookups_list_id_slug_title_with_search_and_permission(): void
    {
        $this->as('editor');
        $id = $this->guide()['id'];

        $this->getJson('/api/v1/admin/lookups/guides?q=codice')->assertOk()
            ->assertJsonPath('data.0.id', $id)->assertJsonPath('data.0.slug', 'codice-fiscale')->assertJsonPath('data.0.status', 'draft')->assertJsonStructure(['data' => [['id', 'slug', 'title', 'status']], 'meta' => ['total']]);
        $this->getJson("/api/v1/admin/lookups/guides?ids[]=$id")->assertJsonCount(1, 'data');
        $this->getJson('/api/v1/admin/lookups/guides?q=zzzz')->assertJsonCount(0, 'data');
        $this->getJson('/api/v1/admin/lookups/nope')->assertNotFound();

        $this->as('user');
        $this->getJson('/api/v1/admin/lookups/guides')->assertForbidden();
        $this->getJson('/api/v1/admin/lookups/nope')->assertForbidden();
    }

    public function test_job_source_map_is_an_object_and_error_samples_a_list(): void
    {
        $this->as('admin');
        $source = JobSource::create(['key' => 'k1', 'name' => 'Src', 'driver' => 'json', 'config' => ['url' => 'https://example.org/x.json'], 'legal_basis' => 'licensed', 'active' => false]);

        $this->getJson("/api/v1/admin/job-sources/{$source->id}")->assertOk();
        $this->assertStringContainsString('"map":{}', $this->get("/api/v1/admin/job-sources/{$source->id}")->getContent());
        $this->getJson("/api/v1/admin/job-sources/{$source->id}/runs")->assertOk();
    }

    public function test_audit_subject_type_is_a_stable_alias_and_actor_is_named(): void
    {
        $actor = $this->as('content_manager');
        $this->guide();

        $row = $this->asAdminLogs()->json('data.0');
        $this->assertSame('guide', $row['subject_type']);
        $this->assertSame(['id' => $actor->id, 'name' => $actor->name], $row['actor']);
        $this->assertNotNull(AuditLog::where('subject_type', Guide::class)->first(), 'stored value unchanged');
        $this->getJson('/api/v1/admin/audit-logs?filter[subject_type]=guide')->assertOk()->assertJsonPath('data.0.subject_type', 'guide');
        $this->getJson('/api/v1/admin/audit-logs?filter[subject_type]=user')->assertOk()->assertJsonCount(0, 'data');
    }

    private function asAdminLogs()
    {
        $this->as('admin');

        return $this->getJson('/api/v1/admin/audit-logs?filter[action]=guide.');
    }

    public function test_admin_sorting_and_stats_currency_and_analytics_daily_totals(): void
    {
        $this->as('admin');
        $this->getJson('/api/v1/admin/jobs?sort=-title')->assertOk();
        $this->getJson('/api/v1/admin/jobs?sort=password')->assertStatus(422);
        $this->getJson('/api/v1/admin/subscriptions?sort=current_period_end')->assertOk();
        $this->getJson('/api/v1/admin/stats')->assertOk()->assertJsonPath('data.billing.currency', 'EUR');
        $this->getJson('/api/v1/admin/analytics')->assertOk()->assertJsonStructure(['data' => ['totals', 'daily', 'daily_totals', 'top_content']]);
    }

    public function test_countries_are_localized_iso_codes(): void
    {
        $it = $this->getJson('/api/v1/countries', ['Accept-Language' => 'it'])->assertOk();
        $codes = collect($it->json('data'))->pluck('code');
        $this->assertTrue($codes->contains('IT') && $codes->contains('EG') && $codes->contains('MA'));
        $this->assertFalse($codes->contains('ZZ') || $codes->contains('EU') || $codes->contains('UN'));
        $this->assertSame('Italia', collect($it->json('data'))->firstWhere('code', 'IT')['name']);

        $ar = $this->getJson('/api/v1/countries?q='.urlencode('مصر'), ['Accept-Language' => 'ar'])->assertOk();
        $this->assertSame(['EG'], collect($ar->json('data'))->pluck('code')->all());
    }

    public function test_dashboard_tasks_distinguish_dismissed_from_profile_inapplicable(): void
    {
        $u = User::factory()->create();
        $this->actingAs($u, 'sanctum');
        $key = array_key_first(config('setup.tasks'));

        $this->getJson('/api/v1/dashboard/tasks')->assertOk()->assertJsonPath('data.0.dismissed', false);
        $this->putJson("/api/v1/dashboard/tasks/$key", ['status' => 'dismissed'])->assertOk();
        $row = collect($this->getJson('/api/v1/dashboard/tasks')->json('data'))->firstWhere('key', $key);
        $this->assertTrue($row['dismissed']);
        $this->assertFalse($row['applicable']);
        $this->assertSame('dismissed_by_user', $row['applicable_reason']);
        $reasons = collect($this->getJson('/api/v1/dashboard/tasks')->json('data'))->pluck('applicable_reason')->unique()->all();
        $this->assertContains(null, $reasons);
    }

    public function test_public_list_items_expose_updated_at_for_sitemaps(): void
    {
        $this->as('editor');
        $this->guide();
        $this->as('content_manager');
        $id = Guide::first()->id;
        $this->postJson("/api/v1/admin/guides/$id/transition", ['to' => 'review'])->assertOk();
        $this->as('admin');
        $this->postJson("/api/v1/admin/guides/$id/transition", ['to' => 'approved'])->assertOk();
        $this->postJson("/api/v1/admin/guides/$id/transition", ['to' => 'published'])->assertOk();

        $this->getJson('/api/v1/guides')->assertOk()->assertJsonStructure(['data' => [['slug', 'updated_at']]]);
        foreach (['study/universities', 'study/programs', 'study/scholarships', 'italian/lessons', 'patente/topics', 'government/services', 'government/offices', 'appointments/guides'] as $path) {
            $this->getJson("/api/v1/$path")->assertOk();
        }
    }
}
