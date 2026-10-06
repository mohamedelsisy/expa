<?php

namespace Tests\Feature\Auth;

use App\Domains\Access\Services\AccessSynchronizer;
use App\Domains\Audit\Models\AuditLog;
use App\Domains\Jobs\Models\JobImportRun;
use App\Domains\Notifications\Models\UserNotification;
use App\Enums\UserStatus;
use App\Exceptions\ApiException;
use App\Jobs\EraseUserData;
use App\Models\User;
use App\Notifications\ResetPasswordNotification;
use App\Notifications\VerifyEmailNotification;
use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Contracts\Debug\ExceptionHandler;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Password;
use Laravel\Sanctum\Sanctum;
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

    private function loginFrom(string $ip, string $email, string $password): int
    {
        return $this->withServerVariables(['REMOTE_ADDR' => $ip])->postJson('/api/v1/auth/login', ['email' => $email, 'password' => $password])->status();
    }

    public function test_distributed_guessing_against_one_account_stays_bounded(): void
    {
        User::factory()->create(['email' => 'victim@example.com', 'password' => 'Str0ngPassw0rd']);
        $codes = [];
        for ($i = 1; $i <= 32; $i++) {
            $codes[] = $this->loginFrom("203.0.113.$i", 'victim@example.com', "guess$i");
        }
        // 20 failures are free, then 10 more verifications on unknown IPs (soft budget); everything after that is refused unchecked.
        $this->assertSame(30, count(array_filter($codes, fn ($c) => $c === 401)));
        $this->assertSame([429, 429], array_slice($codes, -2));
    }

    public function test_an_attacker_cannot_lock_the_owner_out_with_failed_attempts_from_other_ips(): void
    {
        User::factory()->create(['email' => 'victim@example.com', 'password' => 'Str0ngPassw0rd']);
        $this->assertSame(200, $this->loginFrom('198.51.100.7', 'victim@example.com', 'Str0ngPassw0rd')); // owner's usual network
        for ($i = 1; $i <= 21; $i++) {
            $this->loginFrom("203.0.113.$i", 'victim@example.com', "guess$i");
        }

        // The audit scenario: correct password from a NEW network right after 21 failures used to return 429.
        $this->assertSame(200, $this->loginFrom('198.51.100.9', 'victim@example.com', 'Str0ngPassw0rd'));
        // and a success resets the failure counter
        $this->assertSame(401, $this->loginFrom('203.0.113.99', 'victim@example.com', 'wrong'));
    }

    public function test_known_device_still_logs_in_after_the_soft_budget_is_exhausted(): void
    {
        User::factory()->create(['email' => 'victim@example.com', 'password' => 'Str0ngPassw0rd']);
        $this->loginFrom('198.51.100.7', 'victim@example.com', 'Str0ngPassw0rd');
        for ($i = 1; $i <= 31; $i++) {
            $this->loginFrom("203.0.113.$i", 'victim@example.com', "guess$i");
        }
        $this->assertSame(429, $this->loginFrom('198.51.100.50', 'victim@example.com', 'Str0ngPassw0rd')); // unknown network: refused unchecked
        $this->assertSame(200, $this->loginFrom('198.51.100.7', 'victim@example.com', 'Str0ngPassw0rd')); // known network: owner is never locked out
    }

    public function test_change_password_counts_only_failed_guesses_and_is_throttled(): void
    {
        $user = User::factory()->create(['password' => 'Str0ngPassw0rd']);
        Sanctum::actingAs($user);
        for ($i = 0; $i < 5; $i++) {
            $this->postJson('/api/v1/auth/change-password', ['current_password' => "bad$i", 'password' => 'N3wStrongPassw0rd', 'password_confirmation' => 'N3wStrongPassw0rd'])->assertStatus(422);
        }
        $this->postJson('/api/v1/auth/change-password', ['current_password' => 'Str0ngPassw0rd', 'password' => 'N3wStrongPassw0rd', 'password_confirmation' => 'N3wStrongPassw0rd'])->assertStatus(429);
    }

    public function test_a_suspended_account_is_refused_even_with_a_surviving_token(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('t')->plainTextToken;
        $this->withToken($token)->getJson('/api/v1/auth/me')->assertOk();
        $user->forceFill(['status' => UserStatus::Suspended])->save(); // status changed WITHOUT revoking tokens
        $this->app['auth']->forgetGuards();
        $this->withToken($token)->getJson('/api/v1/auth/me')->assertUnauthorized();
    }

    public function test_generic_http_errors_use_the_standard_envelope_without_route_details(): void
    {
        $r = $this->postJson('/api/v1/guides', []);
        $r->assertStatus(405)->assertJsonPath('error.code', 'method_not_allowed')->assertJsonMissingPath('message');
        $this->assertStringNotContainsString('guides', (string) $r->getContent());
    }

    public function test_expected_business_errors_are_not_reported_to_the_log(): void
    {
        $this->assertFalse($this->app->make(ExceptionHandler::class)->shouldReport(new ApiException('x', 'y')));
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
