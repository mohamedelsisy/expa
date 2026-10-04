<?php

namespace Tests\Feature\Admin;

use App\Domains\Access\Models\Permission;
use App\Domains\Access\Models\Role;
use App\Domains\Access\Services\AccessSynchronizer;
use App\Enums\UserStatus;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AccessControlTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        app(AccessSynchronizer::class)->sync();
    }

    private function userWith(string ...$roles): User
    {
        $u = User::factory()->create();
        $u->syncRoleKeys($roles);

        return $u;
    }

    public function test_sync_is_idempotent_and_matches_config(): void
    {
        $roles = Role::count();
        $perms = Permission::count();
        app(AccessSynchronizer::class)->sync();

        $this->assertSame($roles, Role::count());
        $this->assertSame($perms, Permission::count());
        $this->assertSame(array_keys(config('permissions.roles')), Role::orderBy('id')->pluck('key')->all());
        $this->assertSame(count(config('permissions.permissions')), $perms);
    }

    public function test_sync_removes_permissions_dropped_from_config(): void
    {
        Permission::create(['key' => 'legacy.thing']);
        app(AccessSynchronizer::class)->sync();
        $this->assertNull(Permission::firstWhere('key', 'legacy.thing'));
    }

    public function test_role_permission_matrix(): void
    {
        $this->assertTrue($this->userWith('editor')->hasPermission('guides.update'));
        $this->assertFalse($this->userWith('editor')->hasPermission('guides.publish'));
        $this->assertTrue($this->userWith('content_manager')->hasPermission('guides.publish'));
        $this->assertTrue($this->userWith('translator')->hasPermission('translations.update'));
        $this->assertFalse($this->userWith('translator')->hasPermission('guides.update'));
        $this->assertTrue($this->userWith('support_agent')->hasPermission('users.view'));
        $this->assertFalse($this->userWith('support_agent')->hasPermission('users.update'));
        $this->assertFalse($this->userWith('user')->hasPermission('users.view'));
        $this->assertFalse($this->userWith('provider')->hasPermission('guides.view'));
    }

    public function test_super_admin_passes_every_gate_and_regular_user_none(): void
    {
        $super = $this->userWith('super_admin');
        $this->assertTrue($super->can('settings.update'));
        $this->assertTrue($super->can('anything.at.all'));
        $this->assertFalse($this->userWith('user')->can('settings.update'));
    }

    public function test_new_registrations_get_the_user_role(): void
    {
        $this->postJson('/api/v1/auth/register', [
            'name' => 'Sara', 'email' => 's@example.com', 'password' => 'Str0ngPassw0rd', 'password_confirmation' => 'Str0ngPassw0rd',
            'accept_terms' => true, 'accept_privacy' => true,
        ])->assertCreated();

        $this->assertSame(['user'], User::first()->roles->pluck('key')->all());
    }

    public function test_registration_works_on_a_fresh_database_without_seeding(): void
    {
        Role::query()->delete();
        $this->postJson('/api/v1/auth/register', [
            'name' => 'Sara', 'email' => 's@example.com', 'password' => 'Str0ngPassw0rd', 'password_confirmation' => 'Str0ngPassw0rd',
            'accept_terms' => true, 'accept_privacy' => true,
        ])->assertCreated();
        $this->assertTrue(User::first()->hasRole('user'));
    }

    public function test_admin_routes_reject_guests_unverified_and_unprivileged(): void
    {
        $this->getJson('/api/v1/admin/users')->assertUnauthorized();

        $unverified = User::factory()->unverified()->create();
        $unverified->syncRoleKeys(['admin']);
        $this->actingAs($unverified, 'sanctum')->getJson('/api/v1/admin/users')
            ->assertForbidden()->assertJsonPath('error.code', 'email_not_verified');

        $this->actingAs($this->userWith('user'), 'sanctum')->getJson('/api/v1/admin/users')
            ->assertForbidden()->assertJsonPath('error.code', 'forbidden');
        $this->actingAs($this->userWith('editor'), 'sanctum')->getJson('/api/v1/admin/users')->assertForbidden();
    }

    public function test_support_agent_can_view_but_not_modify_users(): void
    {
        $agent = $this->userWith('support_agent');
        $target = $this->userWith('user');

        $this->actingAs($agent, 'sanctum')->getJson('/api/v1/admin/users')->assertOk();
        $this->actingAs($agent, 'sanctum')->getJson("/api/v1/admin/users/{$target->id}")->assertOk()->assertJsonPath('data.roles', ['user']);
        $this->actingAs($agent, 'sanctum')->patchJson("/api/v1/admin/users/{$target->id}", ['status' => 'suspended'])->assertForbidden();
        $this->actingAs($agent, 'sanctum')->putJson("/api/v1/admin/users/{$target->id}/roles", ['roles' => ['editor']])->assertForbidden();
    }

    public function test_user_list_pagination_filter_and_sort(): void
    {
        $admin = $this->userWith('admin');
        User::factory()->count(25)->create()->each->syncRoleKeys(['user']);
        User::factory()->create(['name' => 'Findable Person', 'email' => 'find.me@example.com'])->syncRoleKeys(['editor']);

        $this->actingAs($admin, 'sanctum');
        $page = $this->getJson('/api/v1/admin/users?per_page=10&page=2')->assertOk();
        $page->assertJsonPath('meta.page', 2)->assertJsonPath('meta.per_page', 10)->assertJsonPath('meta.total', 27);
        $this->assertCount(10, $page->json('data'));

        $this->getJson('/api/v1/admin/users?filter[q]=find.me')->assertJsonPath('meta.total', 1);
        $this->getJson('/api/v1/admin/users?filter[role]=editor')->assertJsonPath('meta.total', 1);
        $this->getJson('/api/v1/admin/users?sort=email')->assertOk();
        $this->getJson('/api/v1/admin/users?per_page=500')->assertStatus(422);
        $this->getJson('/api/v1/admin/users?sort=password')->assertOk(); // unknown sort column falls back safely
    }

    public function test_like_wildcards_in_search_are_escaped(): void
    {
        $admin = $this->userWith('admin');
        $this->actingAs($admin, 'sanctum')->getJson('/api/v1/admin/users?filter[q]=%25')->assertJsonPath('meta.total', 0);
    }

    public function test_admin_can_suspend_user_and_tokens_are_revoked(): void
    {
        $admin = $this->userWith('admin');
        $target = $this->userWith('user');
        $target->createToken('t');

        $this->actingAs($admin, 'sanctum')->patchJson("/api/v1/admin/users/{$target->id}", ['status' => 'suspended'])
            ->assertOk()->assertJsonPath('data.status', 'suspended');

        $this->assertSame(UserStatus::Suspended, $target->fresh()->status);
        $this->assertSame(0, $target->tokens()->count());
    }

    public function test_admin_cannot_modify_self_or_other_admins(): void
    {
        $admin = $this->userWith('admin');
        $other = $this->userWith('admin');
        $this->actingAs($admin, 'sanctum');

        $this->patchJson("/api/v1/admin/users/{$admin->id}", ['status' => 'suspended'])->assertForbidden();
        $this->patchJson("/api/v1/admin/users/{$other->id}", ['status' => 'suspended'])->assertForbidden();
    }

    public function test_super_admin_can_modify_admins(): void
    {
        $super = $this->userWith('super_admin');
        $admin = $this->userWith('admin');

        $this->actingAs($super, 'sanctum')->patchJson("/api/v1/admin/users/{$admin->id}", ['status' => 'suspended'])->assertOk();
    }

    public function test_admin_can_assign_non_privileged_roles(): void
    {
        $admin = $this->userWith('admin');
        $target = $this->userWith('user');

        $this->actingAs($admin, 'sanctum')->putJson("/api/v1/admin/users/{$target->id}/roles", ['roles' => ['user', 'editor']])
            ->assertOk()->assertJsonPath('data.roles', ['user', 'editor']);
        $this->assertTrue($target->fresh()->hasPermission('guides.update'));
    }

    public function test_privilege_escalation_is_blocked(): void
    {
        $admin = $this->userWith('admin');
        $target = $this->userWith('user');
        $this->actingAs($admin, 'sanctum');

        // Admin cannot mint admins / super admins
        $this->putJson("/api/v1/admin/users/{$target->id}/roles", ['roles' => ['admin']])->assertForbidden();
        $this->putJson("/api/v1/admin/users/{$target->id}/roles", ['roles' => ['super_admin']])->assertForbidden();
        // ...cannot change own roles
        $this->putJson("/api/v1/admin/users/{$admin->id}/roles", ['roles' => ['user']])->assertForbidden();
        // ...cannot demote another admin
        $other = $this->userWith('admin');
        $this->putJson("/api/v1/admin/users/{$other->id}/roles", ['roles' => ['user']])->assertForbidden();

        $this->assertSame(['user'], $target->fresh()->roles->pluck('key')->all());
        $this->assertTrue($other->fresh()->hasRole('admin'));
    }

    public function test_role_assignment_validates_role_keys(): void
    {
        $admin = $this->userWith('admin');
        $target = $this->userWith('user');
        $this->actingAs($admin, 'sanctum')->putJson("/api/v1/admin/users/{$target->id}/roles", ['roles' => ['wizard']])->assertStatus(422);
        $this->putJson("/api/v1/admin/users/{$target->id}/roles", ['roles' => []])->assertStatus(422);
    }

    public function test_roles_endpoint_lists_roles_with_permissions(): void
    {
        $res = $this->actingAs($this->userWith('admin'), 'sanctum')->getJson('/api/v1/admin/roles')->assertOk();
        $editor = collect($res->json('data'))->firstWhere('key', 'editor');
        $this->assertContains('guides.update', $editor['permissions']);
        $this->assertNotContains('guides.publish', $editor['permissions']);
        $this->assertTrue(collect($res->json('data'))->firstWhere('key', 'super_admin')['privileged']);
    }

    public function test_make_admin_command_grants_role(): void
    {
        $u = User::factory()->create(['email' => 'boss@example.com']);
        $u->syncRoleKeys(['user']);

        $this->artisan('expa:make-admin', ['email' => 'BOSS@example.com'])->assertSuccessful();
        $this->assertTrue($u->fresh()->isSuperAdmin());
        $this->assertTrue($u->fresh()->hasRole('user'));

        $this->artisan('expa:make-admin', ['email' => 'nobody@example.com'])->assertFailed();
        $this->artisan('expa:make-admin', ['email' => 'boss@example.com', '--role' => 'wizard'])->assertFailed();
    }

    public function test_every_role_permission_in_config_is_a_defined_permission(): void
    {
        foreach (config('permissions.roles') as $role => $def) {
            foreach ($def['permissions'] as $p) {
                $this->assertContains($p, config('permissions.permissions'), "$role references unknown $p");
            }
        }
    }
}
