<?php

namespace Tests\Feature\Auth;

use App\Domains\Access\Services\AccessSynchronizer;
use App\Domains\Audit\Models\AuditLog;
use App\Domains\Jobs\Models\JobImportRun;
use App\Domains\Notifications\Models\UserNotification;
use App\Enums\UserStatus;
use App\Jobs\EraseUserData;
use App\Models\User;
use App\Notifications\ResetPasswordNotification;
use App\Notifications\VerifyEmailNotification;
use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Password;
use Tests\Support\JobFixtures;
use Tests\TestCase;

class AuthHardeningTest extends TestCase
{
    use JobFixtures, RefreshDatabase;

    // ---- login throttling ---------------------------------------------------------------------

    public function test_whitespace_and_case_variants_share_one_login_bucket(): void
    {
        foreach (['a@example.com', ' A@Example.com', "a@example.com\t", 'A@EXAMPLE.COM ', 'a@example.com'] as $email) {
            $this->postJson('/api/v1/auth/login', ['email' => $email, 'password' => 'x'])->assertUnauthorized();
        }
        $this->postJson('/api/v1/auth/login', ['email' => ' a@example.com', 'password' => 'x'])->assertStatus(429);
    }

    public function test_an_account_is_protected_even_when_the_attacker_rotates_ips(): void
    {
        User::factory()->create(['email' => 'victim@example.com', 'password' => 'Str0ngPassw0rd']);
        $codes = [];
        for ($i = 1; $i <= 22; $i++) {
            $codes[] = $this->withServerVariables(['REMOTE_ADDR' => "203.0.113.$i"])->postJson('/api/v1/auth/login', ['email' => 'victim@example.com', 'password' => "guess$i"])->status();
        }
        $this->assertSame(20, count(array_filter($codes, fn ($c) => $c === 401)));
        $this->assertSame([429, 429], array_slice($codes, -2)); // the 21st+ guess is refused whatever the source address

        // even the correct password is refused while the account bucket is exhausted
        $this->withServerVariables(['REMOTE_ADDR' => '198.51.100.9'])->postJson('/api/v1/auth/login', ['email' => 'victim@example.com', 'password' => 'Str0ngPassw0rd'])->assertStatus(429);
    }

    public function test_malformed_login_input_is_a_validation_error_not_a_server_error(): void
    {
        $this->postJson('/api/v1/auth/login', ['email' => ['a@b.c'], 'password' => 'x'])->assertStatus(422);
        $this->postJson('/api/v1/auth/login', ['email' => ['x' => ['y']], 'password' => ['z']])->assertStatus(422);
        $this->postJson('/api/v1/auth/login', ['password' => 'x'])->assertStatus(422);
    }

    // ---- account enumeration timing -----------------------------------------------------------

    public function test_auth_emails_are_queued_so_existing_and_unknown_accounts_cost_the_same(): void
    {
        $this->assertInstanceOf(ShouldQueue::class, new VerifyEmailNotification);
        $this->assertInstanceOf(ShouldQueue::class, new ResetPasswordNotification('t'));
    }

    // ---- erasure & retention ------------------------------------------------------------------

    public function test_a_pending_reset_token_is_deleted_with_the_account(): void
    {
        app(AccessSynchronizer::class)->sync();
        $u = User::factory()->create(['email' => 'erase.me@example.com']);
        Password::createToken($u);
        $this->assertSame(1, DB::table('password_reset_tokens')->where('email', 'erase.me@example.com')->count());

        $this->actingAs($u, 'sanctum')->deleteJson('/api/v1/profile', ['password' => 'password'])->assertStatus(202);

        $this->assertSame(0, DB::table('password_reset_tokens')->count());
    }

    public function test_expired_reset_tokens_are_pruned_by_the_scheduler(): void
    {
        $events = collect(app(Schedule::class)->events())->map(fn ($e) => (string) $e->command);
        $this->assertTrue($events->contains(fn ($c) => str_contains($c, 'auth:clear-resets')));
        $this->assertTrue($events->contains(fn ($c) => str_contains($c, 'expa:prune-retention')));
    }

    public function test_retention_command_prunes_notifications_and_import_runs_only_past_their_period(): void
    {
        $u = User::factory()->create();
        $mk = fn (string $when) => tap(new UserNotification(['type' => 'document_reminder', 'data' => []]), function ($n) use ($u, $when) {
            $n->user_id = $u->id;
            $n->save();
            DB::table('user_notifications')->where('id', $n->id)->update(['created_at' => $when]);
        });
        $mk(now()->subMonths(7)->toDateTimeString());
        $mk(now()->subMonths(5)->toDateTimeString());

        $s = $this->source();
        foreach ([100, 10] as $days) {
            $r = new JobImportRun(['status' => 'success', 'started_at' => now()->subDays($days)]);
            $r->job_source_id = $s->id;
            $r->save();
        }

        $this->artisan('expa:prune-retention')->expectsOutputToContain('Pruned 1 notification(s) and 1 import run(s)')->assertSuccessful();
        $this->assertSame(1, UserNotification::count());
        $this->assertSame(1, JobImportRun::count());
    }

    public function test_admins_cannot_reopen_an_account_that_is_being_erased(): void
    {
        app(AccessSynchronizer::class)->sync();
        $admin = User::factory()->create();
        $admin->syncRoleKeys(['admin']);
        $target = User::factory()->create();
        $target->forceFill(['status' => UserStatus::PendingErasure])->save();

        $this->actingAs($admin, 'sanctum')->patchJson("/api/v1/admin/users/{$target->id}", ['status' => 'active'])
            ->assertStatus(422)->assertJsonPath('error.code', 'account_pending_erasure');
        $this->assertSame(UserStatus::PendingErasure, $target->fresh()->status);
    }

    public function test_a_stuck_erasure_leaves_an_audit_trail(): void
    {
        $u = User::factory()->create();
        (new EraseUserData($u->id))->failed(new \RuntimeException('disk full'));

        $log = AuditLog::firstWhere('action', 'privacy.erasure_failed');
        $this->assertSame([$u->id, ['error' => \RuntimeException::class]], [$log->subject_id, $log->changes]);
    }
}
