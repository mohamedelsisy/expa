<?php

namespace Tests\Feature\Admin;

use App\Domains\Access\Services\AccessSynchronizer;
use App\Models\User;
use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminInvariantsTest extends TestCase
{
    use RefreshDatabase;

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

    public function test_a_super_admin_cannot_suspend_or_demote_themselves(): void
    {
        $me = $this->as('super_admin');
        $this->patchJson("/api/v1/admin/users/{$me->id}", ['status' => 'suspended'])->assertForbidden()->assertJsonPath('error.code', 'cannot_modify_self');
        $this->putJson("/api/v1/admin/users/{$me->id}/roles", ['roles' => ['user']])->assertForbidden();
        $this->assertTrue($me->fresh()->isSuperAdmin());
    }

    public function test_revenue_is_hidden_from_content_managers_but_visible_to_admins(): void
    {
        $this->as('content_manager');
        $this->getJson('/api/v1/admin/stats')->assertOk()->assertJsonPath('data.billing', null);
        $this->as('admin');
        $this->getJson('/api/v1/admin/stats')->assertOk()->assertJsonStructure(['data' => ['billing' => ['revenue_30d_minor']]]);
    }

    public function test_the_scheduler_has_a_heartbeat_and_runs_mutating_jobs_on_one_server(): void
    {
        $events = collect(app(Schedule::class)->events());
        $this->assertTrue($events->contains(fn ($e) => $e->description === 'scheduler-heartbeat'));
        foreach (['expa:send-reminders', 'expa:jobs-import', 'expa:billing-expire'] as $cmd) {
            $this->assertTrue($events->first(fn ($e) => str_contains((string) $e->command, $cmd))->onOneServer, "$cmd must be onOneServer");
        }
    }
}
