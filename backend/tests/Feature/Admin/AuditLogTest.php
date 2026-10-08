<?php

namespace Tests\Feature\Admin;

use App\Domains\Access\Services\AccessSynchronizer;
use App\Domains\Audit\Models\AuditLog;
use App\Domains\Audit\Services\AuditLogger;
use App\Models\User;
use App\Support\Audit\Auditable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\Schema;
use LogicException;
use Tests\TestCase;

class AuditLogTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        app(AccessSynchronizer::class)->sync();
    }

    private function actions(): array
    {
        return AuditLog::orderBy('id')->pluck('action')->all();
    }

    private function staff(string $role): User
    {
        $u = User::factory()->create();
        $u->syncRoleKeys([$role]);

        return $u;
    }

    public function test_logs_are_immutable(): void
    {
        $log = app(AuditLogger::class)->log('test.event');

        $this->expectException(LogicException::class);
        $log->update(['action' => 'tampered']);
    }

    public function test_logs_cannot_be_deleted_via_model(): void
    {
        $log = app(AuditLogger::class)->log('test.event');
        try {
            $log->delete();
            $this->fail('delete should throw');
        } catch (LogicException) {
            $this->assertSame(1, AuditLog::count());
        }
    }

    public function test_auth_flow_is_audited_without_leaking_secrets(): void
    {
        $this->postJson('/api/v1/auth/register', [
            'name' => 'Sara', 'email' => 'sara@example.com', 'password' => 'Str0ngPassw0rd', 'password_confirmation' => 'Str0ngPassw0rd',
            'accept_terms' => true, 'accept_privacy' => true,
        ])->assertCreated();
        $this->postJson('/api/v1/auth/login', ['email' => 'sara@example.com', 'password' => 'bad'])->assertUnauthorized();
        $token = $this->postJson('/api/v1/auth/login', ['email' => 'sara@example.com', 'password' => 'Str0ngPassw0rd'])->json('data.token');
        $this->withToken($token)->postJson('/api/v1/auth/logout')->assertNoContent();

        $this->assertSame(['auth.registered', 'auth.login_failed', 'auth.login', 'auth.logout'], $this->actions());

        $dump = json_encode(AuditLog::all()->toArray());
        $this->assertStringNotContainsString('sara@example.com', $dump);
        $this->assertStringNotContainsString('Str0ngPassw0rd', $dump);
        $this->assertStringNotContainsString('127.0.0.1', $dump);
        $this->assertSame(User::first()->id, AuditLog::firstWhere('action', 'auth.login')->actor_id);
    }

    public function test_failed_login_for_unknown_email_is_logged_without_actor_or_raw_email(): void
    {
        $this->postJson('/api/v1/auth/login', ['email' => 'ghost@example.com', 'password' => 'x'])->assertUnauthorized();

        $log = AuditLog::first();
        $this->assertSame('auth.login_failed', $log->action);
        $this->assertNull($log->actor_id);
        $this->assertStringNotContainsString('ghost@example.com', json_encode($log->toArray()));
        $this->assertSame(64, strlen($log->changes['email_hash']));
    }

    public function test_password_reset_and_change_are_audited(): void
    {
        $user = User::factory()->create(['email' => 'a@example.com', 'password' => 'Str0ngPassw0rd']);
        $this->postJson('/api/v1/auth/reset-password', [
            'token' => Password::createToken($user), 'email' => 'a@example.com',
            'password' => 'N3wStr0ngPassword', 'password_confirmation' => 'N3wStr0ngPassword',
        ])->assertOk();

        $this->actingAs($user->fresh(), 'sanctum')->postJson('/api/v1/auth/change-password', [
            'current_password' => 'N3wStr0ngPassword', 'password' => 'An0therStrongPass', 'password_confirmation' => 'An0therStrongPass',
        ])->assertNoContent();

        $this->assertSame(['auth.password_reset', 'auth.password_changed'], $this->actions());
    }

    public function test_consent_changes_are_audited(): void
    {
        $user = User::factory()->create();
        $this->actingAs($user, 'sanctum')->putJson('/api/v1/profile/consents', ['consents' => ['marketing' => true]])->assertOk();

        $log = AuditLog::firstWhere('action', 'consent.changed');
        $this->assertSame($user->id, $log->actor_id);
        $this->assertSame(['marketing' => true], $log->changes);
    }

    public function test_admin_actions_record_actor_and_before_after(): void
    {
        $admin = $this->staff('admin');
        $target = $this->staff('user');

        $this->actingAs($admin, 'sanctum');
        $this->patchJson("/api/v1/admin/users/{$target->id}", ['status' => 'suspended'])->assertOk();
        $this->putJson("/api/v1/admin/users/{$target->id}/roles", ['roles' => ['user', 'editor']])->assertOk();

        $status = AuditLog::firstWhere('action', 'admin.user.status_changed');
        $this->assertSame($admin->id, $status->actor_id);
        $this->assertSame($target->id, $status->subject_id);
        $this->assertSameJson(['status' => ['old' => 'active', 'new' => 'suspended']], $status->changes);

        $roles = AuditLog::firstWhere('action', 'admin.user.roles_changed');
        $this->assertSameJson(['old' => ['user'], 'new' => ['editor', 'user']], $roles->changes['roles']);
    }

    public function test_denied_admin_actions_are_not_logged_as_changes(): void
    {
        $admin = $this->staff('admin');
        $this->actingAs($admin, 'sanctum')->putJson("/api/v1/admin/users/{$admin->id}/roles", ['roles' => ['user']])->assertForbidden();

        $this->assertNull(AuditLog::firstWhere('action', 'admin.user.roles_changed'));
    }

    public function test_audit_log_endpoint_is_permission_gated(): void
    {
        $this->getJson('/api/v1/admin/audit-logs')->assertUnauthorized();
        $this->actingAs($this->staff('editor'), 'sanctum')->getJson('/api/v1/admin/audit-logs')->assertForbidden();
        $this->actingAs($this->staff('support_agent'), 'sanctum')->getJson('/api/v1/admin/audit-logs')->assertForbidden();
        $this->actingAs($this->staff('admin'), 'sanctum')->getJson('/api/v1/admin/audit-logs')->assertOk();
    }

    public function test_audit_log_endpoint_filters_and_paginates_and_hides_ip_hash(): void
    {
        $admin = $this->staff('admin');
        $logger = app(AuditLogger::class);
        foreach (range(1, 30) as $i) {
            $logger->log($i % 2 ? 'auth.login' : 'admin.thing', null, [], $admin);
        }
        $this->actingAs($admin, 'sanctum');

        $this->getJson('/api/v1/admin/audit-logs?per_page=10')->assertOk()
            ->assertJsonPath('meta.per_page', 10)->assertJsonPath('meta.total', 30)->assertJsonCount(10, 'data');
        $this->getJson('/api/v1/admin/audit-logs?filter[action]=auth.')->assertJsonPath('meta.total', 15);
        $this->getJson('/api/v1/admin/audit-logs?filter[action]=admin.thing')->assertJsonPath('meta.total', 15);
        $this->getJson("/api/v1/admin/audit-logs?filter[actor_id]={$admin->id}")->assertJsonPath('meta.total', 30);
        $this->getJson('/api/v1/admin/audit-logs?filter[from]=not-a-date')->assertStatus(422);

        $this->assertStringNotContainsString('ip_hash', $this->getJson('/api/v1/admin/audit-logs')->getContent());
    }

    public function test_newest_first_ordering(): void
    {
        $admin = $this->staff('admin');
        $logger = app(AuditLogger::class);
        $logger->log('a.first', null, [], $admin);
        $logger->log('b.second', null, [], $admin);

        $this->actingAs($admin, 'sanctum')->getJson('/api/v1/admin/audit-logs')->assertJsonPath('data.0.action', 'b.second');
    }

    public function test_prune_deletes_only_expired_logs(): void
    {
        $logger = app(AuditLogger::class);
        $old = $logger->log('old.event');
        $logger->log('new.event');
        AuditLog::query()->toBase()->where('id', $old->id)->update(['created_at' => now()->subMonths(25)]);

        $this->artisan('expa:prune-audit-logs')->assertSuccessful();

        $this->assertSame(['new.event'], $this->actions());
    }

    public function test_auditable_trait_records_before_after_and_skips_hidden_and_excluded(): void
    {
        Schema::create('audit_widgets', function ($t) {
            $t->id();
            $t->string('title');
            $t->string('secret')->nullable();
            $t->string('noise')->nullable();
            $t->timestamps();
        });
        $actor = $this->staff('editor');
        $this->actingAs($actor);

        $w = AuditedWidget::create(['title' => 'One', 'secret' => 's3cr3t', 'noise' => 'n']);
        $w->update(['title' => 'Two', 'secret' => 'changed', 'noise' => 'm']);
        $w->delete();

        $logs = AuditLog::whereIn('action', ['auditedwidget.created', 'auditedwidget.updated', 'auditedwidget.deleted'])->orderBy('id')->get();
        $this->assertCount(3, $logs);
        $this->assertSame($actor->id, $logs[1]->actor_id);
        $this->assertSameJson(['title' => ['old' => 'One', 'new' => 'Two']], $logs[1]->changes);
        $this->assertStringNotContainsString('s3cr3t', json_encode($logs->toArray()));
        $this->assertStringNotContainsString('changed', json_encode($logs->toArray()));
    }

    public function test_noop_update_creates_no_audit_row(): void
    {
        Schema::create('audit_widgets', function ($t) {
            $t->id();
            $t->string('title');
            $t->string('secret')->nullable();
            $t->string('noise')->nullable();
            $t->timestamps();
        });
        $w = AuditedWidget::create(['title' => 'One']);
        $before = AuditLog::count();
        $w->update(['title' => 'One']);
        $w->update(['noise' => 'only-excluded-field-changed']);

        $this->assertSame($before, AuditLog::count());
    }
}

class AuditedWidget extends Model
{
    use Auditable;

    protected $table = 'audit_widgets';

    protected $guarded = [];

    protected $hidden = ['secret'];

    protected array $auditExcept = ['noise'];
}
