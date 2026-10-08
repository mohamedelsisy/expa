<?php

namespace Tests\Feature\Auth;

use App\Console\Commands\Preflight;
use App\Domains\Access\Services\AccessSynchronizer;
use App\Domains\Audit\Models\AuditLog;
use App\Domains\Privacy\Services\UserEraser;
use App\Domains\TwoFactor\Models\RecoveryCode;
use App\Domains\TwoFactor\Models\TwoFactorCredential;
use App\Domains\TwoFactor\Services\Totp;
use App\Domains\TwoFactor\Services\TwoFactorService;
use App\Enums\UserStatus;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Log;
use Tests\TestCase;

class TwoFactorTest extends TestCase
{
    use RefreshDatabase;

    private const PW = 'Str0ngPassw0rd';

    private Totp $totp;

    protected function setUp(): void
    {
        parent::setUp();
        $this->totp = new Totp;
        app(AccessSynchronizer::class)->sync();
    }

    /** Sanctum caches the resolved user per guard; tests switch bearer tokens between requests. */
    public function call($method, $uri, $parameters = [], $cookies = [], $files = [], $server = [], $content = null)
    {
        $this->app['auth']->forgetGuards();

        return parent::call($method, $uri, $parameters, $cookies, $files, $server, $content);
    }

    private function user(string $role = 'user'): User
    {
        $u = User::factory()->create(['password' => self::PW]);
        $u->syncRoleKeys([$role]);

        return $u;
    }

    private function code(string $secret, int $offset = 0): string
    {
        return $this->totp->codeAt($secret, $this->totp->step() + $offset);
    }

    /** Enables 2FA through the real API; returns [secret, recoveryCodes, bearerToken]. The confirm code uses step now-1. */
    private function enable(User $u): array
    {
        $token = $u->createToken('t')->plainTextToken;
        $h = ['Authorization' => "Bearer $token"];
        $secret = $this->postJson('/api/v1/auth/2fa/setup', [], $h)->assertOk()->json('data.secret');
        $codes = $this->postJson('/api/v1/auth/2fa/confirm', ['code' => $this->code($secret, -1)], $h)->assertOk()->json('data.recovery_codes');

        return [$secret, $codes, $token];
    }

    private function login(User $u)
    {
        return $this->postJson('/api/v1/auth/login', ['email' => $u->email, 'password' => self::PW, 'device_name' => 'phone']);
    }

    public function test_totp_matches_rfc6238_vectors(): void
    {
        $secret = Totp::base32Encode('12345678901234567890');
        // RFC 6238 appendix B (SHA1), 6-digit truncation of the 8-digit values.
        $this->assertSame('287082', $this->totp->codeAt($secret, intdiv(59, 30)));
        $this->assertSame('081804', $this->totp->codeAt($secret, intdiv(1111111109, 30)));
        $this->assertSame('050471', $this->totp->codeAt($secret, intdiv(1111111111, 30)));
        $this->assertSame('005924', $this->totp->codeAt($secret, intdiv(1234567890, 30)));
        $this->assertSame('12345678901234567890', Totp::base32Decode($secret));
    }

    public function test_full_flow_setup_confirm_login_challenge(): void
    {
        $u = $this->user();
        $token = $u->createToken('t')->plainTextToken;
        $h = ['Authorization' => "Bearer $token"];

        $this->getJson('/api/v1/auth/2fa/status', $h)->assertOk()->assertJsonPath('data', [
            'enabled' => false, 'confirmed_at' => null, 'setup_pending' => false, 'recovery_codes_remaining' => 0, 'required' => false, 'setup_required' => false,
        ]);

        $setup = $this->postJson('/api/v1/auth/2fa/setup', [], $h)->assertOk()->assertJsonStructure(['data' => ['secret', 'otpauth_uri', 'issuer', 'account']]);
        $secret = $setup->json('data.secret');
        $this->assertStringStartsWith('otpauth://totp/EXPA%3A', $setup->json('data.otpauth_uri'));
        $this->assertStringContainsString("secret=$secret", $setup->json('data.otpauth_uri'));

        // Pending: not active, login still gives a token directly.
        $this->getJson('/api/v1/auth/2fa/status', $h)->assertJsonPath('data.setup_pending', true)->assertJsonPath('data.enabled', false);
        $this->login($u)->assertOk()->assertJsonStructure(['data' => ['token']]);

        $this->postJson('/api/v1/auth/2fa/confirm', ['code' => '000000'], $h)->assertStatus(422)->assertJsonPath('error.code', 'invalid_two_factor_code');
        $confirm = $this->postJson('/api/v1/auth/2fa/confirm', ['code' => $this->code($secret, -1)], $h)->assertOk()->assertJsonPath('data.enabled', true);
        $codes = $confirm->json('data.recovery_codes');
        $this->assertCount(10, $codes);
        $this->assertCount(10, array_unique($codes));
        $this->assertMatchesRegularExpression('/^[a-z0-9]{5}-[a-z0-9]{5}$/', $codes[0]);

        // Stored encrypted, recovery codes hashed.
        $raw = \DB::table('user_two_factor_credentials')->where('user_id', $u->id)->value('secret');
        $this->assertStringNotContainsString($secret, $raw);
        $this->assertSame($secret, TwoFactorCredential::where('user_id', $u->id)->first()->secret);
        $this->assertSame(0, RecoveryCode::whereIn('code_hash', $codes)->count());

        $status = $this->getJson('/api/v1/auth/2fa/status', $h)->assertOk();
        $status->assertJsonPath('data.enabled', true)->assertJsonPath('data.recovery_codes_remaining', 10);
        $this->assertStringNotContainsString($secret, $status->getContent());

        // setup again is refused while enabled
        $this->postJson('/api/v1/auth/2fa/setup', [], $h)->assertStatus(409)->assertJsonPath('error.code', 'two_factor_already_enabled');

        // Login now needs the challenge; no token and no Sanctum row yet.
        $u->tokens()->delete();
        $login = $this->login($u)->assertOk()->assertJsonPath('data.two_factor_required', true);
        $this->assertArrayNotHasKey('token', $login->json('data'));
        $this->assertArrayNotHasKey('user', $login->json('data'));
        $this->assertSame(0, $u->tokens()->count());
        $ct = $login->json('data.challenge_token');

        $ok = $this->postJson('/api/v1/auth/2fa/challenge', ['challenge_token' => $ct, 'code' => $this->code($secret, 0)])
            ->assertOk()->assertJsonStructure(['data' => ['user' => ['id', 'two_factor_enabled'], 'token', 'recovery_codes_remaining']]);
        $this->assertTrue($ok->json('data.user.two_factor_enabled'));
        $this->assertSame('phone', $u->tokens()->first()->name);
        $this->getJson('/api/v1/auth/me', ['Authorization' => 'Bearer '.$ok->json('data.token')])->assertOk();
    }

    public function test_replayed_code_is_rejected_even_inside_the_window(): void
    {
        $u = $this->user();
        [$secret] = $this->enable($u); // consumed step now-1
        $ct = $this->login($u)->json('data.challenge_token');
        $this->postJson('/api/v1/auth/2fa/challenge', ['challenge_token' => $ct, 'code' => $this->code($secret, -1)])
            ->assertStatus(422)->assertJsonPath('error.code', 'invalid_two_factor_code');
        // an older step than the last used is also refused, a newer one passes
        $this->postJson('/api/v1/auth/2fa/challenge', ['challenge_token' => $ct, 'code' => $this->code($secret, 1)])->assertOk();
        // and that code cannot be reused on a new challenge
        $ct2 = $this->login($u)->json('data.challenge_token');
        $this->postJson('/api/v1/auth/2fa/challenge', ['challenge_token' => $ct2, 'code' => $this->code($secret, 1)])->assertStatus(422);
    }

    public function test_challenge_token_is_single_use_expires_and_is_bound_to_its_user(): void
    {
        $a = $this->user();
        [$secretA] = $this->enable($a);
        $b = $this->user();
        [$secretB] = $this->enable($b);
        $a->tokens()->delete();

        $ct = $this->login($a)->json('data.challenge_token');
        // B's valid code cannot complete A's challenge
        $this->postJson('/api/v1/auth/2fa/challenge', ['challenge_token' => $ct, 'code' => $this->code($secretB, 0)])->assertStatus(422);
        $this->assertSame(0, $a->tokens()->count());
        $this->postJson('/api/v1/auth/2fa/challenge', ['challenge_token' => $ct, 'code' => $this->code($secretA, 0)])->assertOk();
        // used
        $this->postJson('/api/v1/auth/2fa/challenge', ['challenge_token' => $ct, 'code' => $this->code($secretA, 1)])->assertStatus(401)->assertJsonPath('error.code', 'invalid_challenge');

        // expired
        $ct = $this->login($a)->json('data.challenge_token');
        $this->travel(6)->minutes();
        $this->postJson('/api/v1/auth/2fa/challenge', ['challenge_token' => $ct, 'code' => $this->code($secretA, 1)])->assertStatus(401)->assertJsonPath('error.code', 'invalid_challenge');
        $this->travelBack();

        // garbage
        $this->postJson('/api/v1/auth/2fa/challenge', ['challenge_token' => 'tfc_nope', 'code' => '123456'])->assertStatus(401);
        $this->postJson('/api/v1/auth/2fa/challenge', ['challenge_token' => 'x'])->assertStatus(422);
    }

    public function test_wrong_codes_burn_the_challenge_and_hit_the_brute_force_throttle(): void
    {
        $u = $this->user();
        [$secret] = $this->enable($u);
        $u->tokens()->delete();
        $ct = $this->login($u)->json('data.challenge_token');
        for ($i = 0; $i < 5; $i++) {
            $this->postJson('/api/v1/auth/2fa/challenge', ['challenge_token' => $ct, 'code' => '000000'])->assertStatus(422);
        }
        // challenge is dead (and the user+IP failure budget is spent): even the right code gets nothing
        $this->postJson('/api/v1/auth/2fa/challenge', ['challenge_token' => $ct, 'code' => $this->code($secret, 1)])->assertStatus(401);
        $ct2 = $this->login($u)->json('data.challenge_token');
        $this->postJson('/api/v1/auth/2fa/challenge', ['challenge_token' => $ct2, 'code' => $this->code($secret, 1)])
            ->assertStatus(429)->assertHeader('Retry-After');
        $this->assertSame(0, $u->tokens()->count());
        $this->assertTrue(AuditLog::where('action', 'auth.2fa_failed')->exists());
    }

    public function test_recovery_code_logs_in_once_and_is_audited(): void
    {
        $u = $this->user();
        [, $codes] = $this->enable($u);
        $ct = $this->login($u)->json('data.challenge_token');
        $r = $this->postJson('/api/v1/auth/2fa/challenge', ['challenge_token' => $ct, 'recovery_code' => strtoupper($codes[0])])->assertOk();
        $r->assertJsonPath('data.recovery_codes_remaining', 9);
        $this->assertTrue(AuditLog::where('action', 'auth.2fa_recovery_used')->exists());

        $ct = $this->login($u)->json('data.challenge_token');
        $this->postJson('/api/v1/auth/2fa/challenge', ['challenge_token' => $ct, 'recovery_code' => $codes[0]])->assertStatus(422);
        $this->postJson('/api/v1/auth/2fa/challenge', ['challenge_token' => $ct, 'recovery_code' => $codes[1]])->assertOk();
    }

    public function test_disable_and_regenerate_need_password_and_code_and_revoke_other_tokens(): void
    {
        $u = $this->user();
        [$secret, $codes, $token] = $this->enable($u);
        $other = $u->createToken('other')->plainTextToken;
        $h = ['Authorization' => "Bearer $token"];

        $this->postJson('/api/v1/auth/2fa/recovery-codes', ['password' => 'wrong-pass', 'code' => $this->code($secret, 1)], $h)->assertStatus(422);
        $this->postJson('/api/v1/auth/2fa/recovery-codes', ['password' => self::PW, 'code' => '111111'], $h)->assertStatus(422)->assertJsonPath('error.code', 'invalid_two_factor_code');
        $this->postJson('/api/v1/auth/2fa/recovery-codes', ['password' => self::PW], $h)->assertStatus(422);

        $new = $this->postJson('/api/v1/auth/2fa/recovery-codes', ['password' => self::PW, 'code' => $this->code($secret, 1)], $h)->assertOk()->json('data.recovery_codes');
        $this->assertCount(10, $new);
        $this->assertNotContains($codes[0], $new);
        $this->assertSame(10, RecoveryCode::where('user_id', $u->id)->count());
        // old codes no longer work
        $ct = $this->login($u)->json('data.challenge_token');
        $this->postJson('/api/v1/auth/2fa/challenge', ['challenge_token' => $ct, 'recovery_code' => $codes[0]])->assertStatus(422);

        // disable with a recovery code works too
        $this->postJson('/api/v1/auth/2fa/disable', ['password' => self::PW, 'recovery_code' => $new[0]], $h)->assertNoContent();
        $this->assertFalse(app(TwoFactorService::class)->isEnabled($u));
        $this->assertSame(0, RecoveryCode::where('user_id', $u->id)->count());
        $this->assertSame(0, TwoFactorCredential::count());
        $this->assertSame(1, $u->tokens()->where('name', 't')->count());
        $this->assertSame(0, $u->tokens()->where('name', 'other')->count());
        $this->getJson('/api/v1/auth/me', ['Authorization' => "Bearer $other"])->assertUnauthorized();
        $this->postJson('/api/v1/auth/2fa/disable', ['password' => self::PW, 'code' => '123456'], $h)->assertStatus(409);
        $this->login($u)->assertOk()->assertJsonStructure(['data' => ['token']]);
        $this->assertTrue(AuditLog::where('action', 'auth.2fa_disabled')->exists());
    }

    public function test_confirm_revokes_other_tokens(): void
    {
        $u = $this->user();
        $other = $u->createToken('other');
        [, , $token] = $this->enable($u);
        $this->assertSame(0, $u->tokens()->where('name', 'other')->count());
        $this->assertSame(1, $u->tokens()->where('name', 't')->count());
        $this->assertNotNull($token);
    }

    public function test_password_change_revokes_other_tokens_for_2fa_users(): void
    {
        $u = $this->user();
        [, , $token] = $this->enable($u);
        $u->createToken('other');
        $this->postJson('/api/v1/auth/change-password', ['current_password' => self::PW, 'password' => 'An0therStr0ngPass', 'password_confirmation' => 'An0therStr0ngPass'], ['Authorization' => "Bearer $token"])->assertNoContent();
        $this->assertSame(1, $u->tokens()->count());
    }

    public function test_suspended_users_get_no_token_from_a_challenge(): void
    {
        $u = $this->user();
        [$secret] = $this->enable($u);
        $u->tokens()->delete();
        $ct = $this->login($u)->json('data.challenge_token');
        $u->forceFill(['status' => UserStatus::Suspended])->save();
        $this->postJson('/api/v1/auth/2fa/challenge', ['challenge_token' => $ct, 'code' => $this->code($secret, 1)])->assertStatus(403)->assertJsonPath('error.code', 'account_suspended');
        $this->login($u)->assertStatus(403);
        $this->assertSame(0, $u->tokens()->count());
    }

    public function test_challenge_is_refused_if_2fa_was_removed_in_between(): void
    {
        $u = $this->user();
        [$secret] = $this->enable($u);
        $ct = $this->login($u)->json('data.challenge_token');
        app(TwoFactorService::class)->disable($u);
        $this->postJson('/api/v1/auth/2fa/challenge', ['challenge_token' => $ct, 'code' => $this->code($secret, 1)])->assertStatus(401);
    }

    public function test_enforcement_matrix_for_admin_routes(): void
    {
        $roles = ['super_admin' => true, 'admin' => true, 'content_manager' => true, 'editor' => true, 'translator' => true,
            'support_agent' => true, 'moderator' => true, 'provider' => false, 'user' => false];

        foreach ([false, true] as $required) {
            config(['auth.staff_2fa_required' => $required]);
            foreach ($roles as $role => $staff) {
                $u = $this->user($role);
                $u->forceFill(['email_verified_at' => now()])->save();
                $h = ['Authorization' => 'Bearer '.$u->createToken('t')->plainTextToken];

                $blocked = $required && $staff;
                $res = $this->getJson('/api/v1/admin/roles', $h);
                if ($blocked) {
                    $this->assertSame('two_factor_setup_required', $res->json('error.code'), "$role");
                } else {
                    $this->assertNotSame('two_factor_setup_required', $res->json('error.code'), "$role required=$required");
                }
                // non-admin routes and 2FA endpoints stay usable
                $this->getJson('/api/v1/auth/me', $h)->assertOk()->assertJsonPath('data.two_factor_setup_required', $blocked);
                $this->getJson('/api/v1/auth/2fa/status', $h)->assertOk()->assertJsonPath('data.setup_required', $blocked)->assertJsonPath('data.required', $required && $staff);
                $this->getJson('/api/v1/dashboard', $h)->assertOk();
                $this->postJson('/api/v1/auth/2fa/setup', [], $h)->assertOk();
            }
        }
    }

    public function test_staff_can_use_admin_once_2fa_is_enabled_when_required(): void
    {
        config(['auth.staff_2fa_required' => true]);
        $u = $this->user('admin');
        $u->forceFill(['email_verified_at' => now()])->save();
        $this->getJson('/api/v1/admin/roles', ['Authorization' => 'Bearer '.$u->createToken('t')->plainTextToken])->assertForbidden();
        [, , $token] = $this->enable($u);
        $this->getJson('/api/v1/admin/roles', ['Authorization' => "Bearer $token"])->assertOk();
    }

    public function test_secret_and_codes_never_reach_logs_audit_or_export(): void
    {
        Log::spy();
        $u = $this->user();
        [$secret, $codes, $token] = $this->enable($u);
        $this->login($u);
        $h = ['Authorization' => "Bearer $token"];

        $export = $this->getJson('/api/v1/profile/export', $h)->assertOk();
        $export->assertJsonPath('data.two_factor.enabled', true)->assertJsonPath('data.two_factor.recovery_codes_remaining', 10);
        $dump = $export->getContent().json_encode(AuditLog::all()->toArray()).json_encode($this->getJson('/api/v1/auth/me', $h)->json());
        $this->assertStringNotContainsString($secret, $dump);
        foreach ($codes as $c) {
            $this->assertStringNotContainsString($c, $dump);
        }
        $this->assertStringNotContainsString('secret', json_encode($export->json('data.two_factor')));
        $this->assertArrayNotHasKey('secret', TwoFactorCredential::first()->toArray());
        Log::shouldNotHaveReceived('info');
    }

    public function test_erasure_removes_two_factor_data(): void
    {
        $u = $this->user();
        $this->enable($u);
        app(UserEraser::class)->erase($u);
        $this->assertSame(0, TwoFactorCredential::count());
        $this->assertSame(0, RecoveryCode::count());
    }

    public function test_endpoints_require_auth_and_validate_input(): void
    {
        foreach (['status' => 'get', 'setup' => 'post', 'confirm' => 'post', 'disable' => 'post', 'recovery-codes' => 'post'] as $p => $m) {
            $this->json($m, "/api/v1/auth/2fa/$p")->assertUnauthorized();
        }
        $u = $this->user();
        $h = ['Authorization' => 'Bearer '.$u->createToken('t')->plainTextToken];
        $this->postJson('/api/v1/auth/2fa/confirm', [], $h)->assertStatus(422);
        $this->postJson('/api/v1/auth/2fa/confirm', ['code' => '123456'], $h)->assertStatus(422); // no pending setup
        $this->postJson('/api/v1/auth/2fa/disable', ['password' => self::PW, 'code' => '123456'], $h)->assertStatus(409);
    }

    public function test_preflight_flags_staff_2fa_off_in_production(): void
    {
        config(['auth.staff_2fa_required' => false]);
        $codes = array_column(app(Preflight::class)->findings(true), 'level', 'code');
        $this->assertSame('error', $codes['staff_2fa_off']);
        config(['auth.staff_2fa_required' => true]);
        $this->assertArrayNotHasKey('staff_2fa_off', array_column(app(Preflight::class)->findings(true), 'level', 'code'));
    }
}
