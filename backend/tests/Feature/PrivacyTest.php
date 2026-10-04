<?php

namespace Tests\Feature;

use App\Domains\Access\Services\AccessSynchronizer;
use App\Domains\Audit\Models\AuditLog;
use App\Domains\Audit\Services\AuditLogger;
use App\Domains\Privacy\Services\UserEraser;
use App\Domains\Profile\Models\Consent;
use App\Domains\Profile\Models\UserProfile;
use App\Domains\Profile\Services\ConsentService;
use App\Enums\UserStatus;
use App\Jobs\EraseUserData;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Queue;
use Illuminate\Support\Facades\Schema;
use Tests\TestCase;

class PrivacyTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        app(AccessSynchronizer::class)->sync();
    }

    private function populatedUser(string $email = 'sara@example.com'): User
    {
        $u = User::factory()->create(['name' => 'Sara Ahmed', 'email' => $email, 'password' => 'Str0ngPassw0rd']);
        $u->syncRoleKeys(['user']);
        app(ConsentService::class)->record($u, ['profile_personalization' => true, 'marketing' => true], '203.0.113.7', 'web');
        $u->profile()->create(['nationality' => 'EG', 'segment' => 'student', 'goals' => ['study']]);
        $u->createToken('iPhone');
        app(AuditLogger::class)->log('auth.login', $u, actor: $u);

        return $u;
    }

    public function test_export_requires_authentication(): void
    {
        $this->getJson('/api/v1/profile/export')->assertUnauthorized();
    }

    public function test_export_contains_all_the_users_data_and_none_of_secrets_or_other_users(): void
    {
        $user = $this->populatedUser();
        $other = $this->populatedUser('other@example.com');
        $other->update(['name' => 'Someone Else']);

        $res = $this->actingAs($user, 'sanctum')->getJson('/api/v1/profile/export')->assertOk();
        $res->assertHeader('Content-Disposition', 'attachment; filename="expa-data-export.json"');

        $data = $res->json('data');
        $this->assertSame(['format_version', 'generated_at', 'account', 'profile', 'consents', 'activity_log', 'setup_tasks', 'documents', 'notifications'], array_keys($data));
        $this->assertSame('sara@example.com', $data['account']['email']);
        $this->assertSame(['user'], $data['account']['roles']);
        $this->assertSame('EG', $data['profile']['nationality']);
        $this->assertSame(['study'], $data['profile']['goals']);
        $this->assertContains('marketing', array_column($data['consents'], 'purpose'));
        $this->assertSame('iPhone', $data['account']['devices'][0]['name']);

        $json = $res->getContent();
        $this->assertStringNotContainsString('Someone Else', $json);
        $this->assertStringNotContainsString('other@example.com', $json);
        foreach (['password', 'remember_token', 'ip_hash', '203.0.113.7'] as $secret) {
            $this->assertStringNotContainsString($secret, $json);
        }
    }

    public function test_export_is_audited_and_rate_limited(): void
    {
        $user = $this->populatedUser();
        $this->actingAs($user, 'sanctum');

        for ($i = 0; $i < 5; $i++) {
            $this->getJson('/api/v1/profile/export')->assertOk();
        }
        $this->getJson('/api/v1/profile/export')->assertStatus(429);
        $this->assertSame(5, AuditLog::where('action', 'privacy.export_requested')->count());
    }

    public function test_erasure_requires_the_correct_password(): void
    {
        $user = $this->populatedUser();
        $this->actingAs($user, 'sanctum');

        $this->deleteJson('/api/v1/profile', [])->assertStatus(422);
        $this->deleteJson('/api/v1/profile', ['password' => 'wrong'])->assertStatus(422)
            ->assertJsonStructure(['error' => ['details' => ['password']]]);
        $this->assertSame(UserStatus::Active, $user->fresh()->status);
    }

    public function test_erasure_locks_account_immediately_then_job_erases(): void
    {
        Queue::fake();
        $user = $this->populatedUser();

        $this->actingAs($user, 'sanctum')->deleteJson('/api/v1/profile', ['password' => 'Str0ngPassw0rd'])->assertStatus(202);

        Queue::assertPushed(EraseUserData::class, fn ($j) => $j->userId === $user->id);
        // Locked synchronously, data still present until the job runs
        $this->assertSame(UserStatus::PendingErasure, $user->fresh()->status);
        $this->assertSame(0, $user->tokens()->count());
        $this->assertSame('sara@example.com', $user->fresh()->email);
        $this->postJson('/api/v1/auth/login', ['email' => 'sara@example.com', 'password' => 'Str0ngPassw0rd'])
            ->assertUnauthorized()->assertJsonPath('error.code', 'invalid_credentials');
    }

    public function test_erasure_job_removes_personal_data_and_anonymizes_stub(): void
    {
        $user = $this->populatedUser();
        $id = $user->id;

        $this->actingAs($user, 'sanctum')->deleteJson('/api/v1/profile', ['password' => 'Str0ngPassw0rd'])->assertStatus(202);
        // QUEUE_CONNECTION=sync in tests → job already ran

        $stub = User::withTrashed()->find($id);
        $this->assertTrue($stub->trashed());
        $this->assertSame('Deleted user', $stub->name);
        $this->assertSame("deleted-$id@erased.invalid", $stub->email);
        $this->assertNull($stub->last_login_at);
        $this->assertSame(0, UserProfile::where('user_id', $id)->count());
        $this->assertSame(0, $stub->tokens()->count());
        $this->assertSame(0, DB::table('role_user')->where('user_id', $id)->count());
        $this->assertStringNotContainsString('Sara', json_encode(DB::table('users')->where('id', $id)->first()));

        // Consent history retained for accountability but severed from the person
        $this->assertGreaterThan(0, Consent::where('user_id', $id)->count());
        $this->assertSame(0, Consent::where('user_id', $id)->whereNotNull('ip_hash')->count());

        // Audit trail retained but unattributed; erasure itself is recorded without an actor
        $this->assertSame(0, AuditLog::where('actor_id', $id)->count());
        $this->assertSame(0, AuditLog::whereNotNull('ip_hash')->where('subject_id', $id)->where('subject_type', 'user')->count());
        $erased = AuditLog::firstWhere('action', 'privacy.erased');
        $this->assertNotNull($erased);
        $this->assertNull($erased->actor_id);
    }

    public function test_erasure_does_not_touch_other_users(): void
    {
        $user = $this->populatedUser();
        $other = $this->populatedUser('other@example.com');

        $this->actingAs($user, 'sanctum')->deleteJson('/api/v1/profile', ['password' => 'Str0ngPassw0rd'])->assertStatus(202);

        $this->assertFalse($other->fresh()->trashed());
        $this->assertNotNull($other->profile()->first());
        $this->assertSame(1, $other->tokens()->count());
        $this->assertTrue($other->fresh()->hasRole('user'));
    }

    public function test_erasure_job_is_idempotent_and_ignores_missing_users(): void
    {
        $user = $this->populatedUser();
        (new EraseUserData($user->id))->handle(app(UserEraser::class));
        $count = AuditLog::where('action', 'privacy.erased')->count();

        (new EraseUserData($user->id))->handle(app(UserEraser::class));
        (new EraseUserData(999999))->handle(app(UserEraser::class));

        $this->assertSame($count, AuditLog::where('action', 'privacy.erased')->count());
    }

    public function test_erased_email_can_be_registered_again(): void
    {
        $user = $this->populatedUser();
        $this->actingAs($user, 'sanctum')->deleteJson('/api/v1/profile', ['password' => 'Str0ngPassw0rd'])->assertStatus(202);
        $this->app['auth']->forgetGuards();

        $this->postJson('/api/v1/auth/register', [
            'name' => 'Sara', 'email' => 'sara@example.com', 'password' => 'Str0ngPassw0rd', 'password_confirmation' => 'Str0ngPassw0rd',
            'accept_terms' => true, 'accept_privacy' => true,
        ])->assertCreated();
    }

    public function test_admin_cannot_set_pending_erasure_status(): void
    {
        $admin = User::factory()->create();
        $admin->syncRoleKeys(['admin']);
        $target = User::factory()->create();

        $this->actingAs($admin, 'sanctum')->patchJson("/api/v1/admin/users/{$target->id}", ['status' => 'pending_erasure'])->assertStatus(422);
    }

    /**
     * Guard against GDPR gaps: any table that references a user must be covered by a PersonalDataProvider.
     * When this fails, a new module added a user-linked table: implement a provider, tag it in
     * AppServiceProvider, then add the table here.
     */
    public function test_every_user_linked_table_is_covered_by_an_erasure_provider(): void
    {
        $covered = [
            'user_profiles' => 'ProfileData',
            'consents' => 'ConsentData',
            'user_tasks' => 'SetupTaskData',
            'user_documents' => 'DocumentData',
            'document_attachments' => 'DocumentData',
            'reminders' => 'DocumentData',
            'user_notifications' => 'NotificationData',
            'device_tokens' => 'NotificationData',
            'role_user' => 'AccountData',
            'sessions' => 'unused (stateless API); cleared with tokens',
        ];

        $found = [];
        foreach (Schema::getTableListing(schemaQualified: false) as $table) {
            if (Schema::hasColumn($table, 'user_id')) {
                $found[] = $table;
            }
        }

        $this->assertEqualsCanonicalizing(array_keys($covered), $found, 'User-linked tables changed; update privacy providers.');
    }

    public function test_all_registered_providers_have_unique_keys(): void
    {
        $keys = collect(app()->tagged('privacy.providers'))->map->key()->all();
        $this->assertSame($keys, array_unique($keys));
        $this->assertCount(7, $keys);
    }
}
