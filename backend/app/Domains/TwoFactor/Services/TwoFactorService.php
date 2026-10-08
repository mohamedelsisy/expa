<?php

namespace App\Domains\TwoFactor\Services;

use App\Domains\TwoFactor\Models\RecoveryCode;
use App\Domains\TwoFactor\Models\TwoFactorCredential;
use App\Models\User;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;

class TwoFactorService
{
    public const RECOVERY_COUNT = 10;

    private const MAX_FAILURES = 5;

    private const FAILURE_DECAY = 900;

    private const CHALLENGE_MAX_ATTEMPTS = 5;

    public function __construct(private Totp $totp) {}

    public function credential(User $user): ?TwoFactorCredential
    {
        return TwoFactorCredential::where('user_id', $user->id)->first();
    }

    public function isEnabled(User $user): bool
    {
        return TwoFactorCredential::where('user_id', $user->id)->whereNotNull('confirmed_at')->exists();
    }

    public function isRequiredFor(User $user): bool
    {
        return (bool) config('auth.staff_2fa_required') && $user->isStaff();
    }

    /** Staff must set up 2FA before the admin area opens (STAFF_2FA_REQUIRED=true). */
    public function setupRequired(User $user): bool
    {
        return $this->isRequiredFor($user) && ! $this->isEnabled($user);
    }

    /** Starts (or restarts) enrolment: a fresh secret that is NOT active until confirmed. */
    public function beginSetup(User $user): array
    {
        $secret = $this->totp->generateSecret();
        TwoFactorCredential::updateOrCreate(['user_id' => $user->id], ['secret' => $secret, 'confirmed_at' => null, 'last_used_step' => null]);
        $issuer = (string) config('auth.two_factor.issuer');

        return [
            'secret' => $secret,
            'otpauth_uri' => $this->totp->otpauthUri($secret, $user->email, $issuer),
            'issuer' => $issuer,
            'account' => $user->email,
        ];
    }

    /** Confirms a pending enrolment with a first valid code; returns the plain recovery codes (shown once). */
    public function confirm(User $user, string $code): ?array
    {
        $cred = $this->credential($user);
        if (! $cred || $cred->confirmed_at) {
            return null;
        }
        if (! $this->acceptStep($cred, $code)) {
            return null;
        }
        $cred->forceFill(['confirmed_at' => now()])->save();

        return $this->generateRecoveryCodes($user);
    }

    /** Verifies a TOTP code or a recovery code for an ACTIVE credential. Returns 'totp' | 'recovery' | null. */
    public function verify(User $user, ?string $code, ?string $recoveryCode): ?string
    {
        $cred = $this->credential($user);
        if (! $cred || ! $cred->confirmed_at) {
            return null;
        }
        if ($code !== null && $code !== '') {
            return $this->acceptStep($cred, $code) ? 'totp' : null;
        }
        if ($recoveryCode !== null && $recoveryCode !== '') {
            return $this->consumeRecovery($user, $recoveryCode) ? 'recovery' : null;
        }

        return null;
    }

    public function disable(User $user): void
    {
        DB::transaction(function () use ($user) {
            RecoveryCode::where('user_id', $user->id)->delete();
            TwoFactorCredential::where('user_id', $user->id)->delete();
        });
    }

    /** @return list<string> plain codes, shown once */
    public function generateRecoveryCodes(User $user): array
    {
        $plain = [];
        DB::transaction(function () use ($user, &$plain) {
            RecoveryCode::where('user_id', $user->id)->delete();
            for ($i = 0; $i < self::RECOVERY_COUNT; $i++) {
                $code = strtolower(Str::random(5).'-'.Str::random(5));
                $code = str_replace(['0', 'o', '1', 'l', 'i'], ['7', 'x', '8', 'y', 'z'], $code); // unambiguous characters
                $plain[] = $code;
                RecoveryCode::create(['user_id' => $user->id, 'code_hash' => $this->hashRecovery($code)]);
            }
        });

        return $plain;
    }

    public function recoveryRemaining(User $user): int
    {
        return RecoveryCode::where('user_id', $user->id)->whereNull('used_at')->count();
    }

    public static function normaliseCode(mixed $v): ?string
    {
        return is_string($v) ? preg_replace('/\s+/', '', $v) : null;
    }

    public static function normaliseRecovery(mixed $v): ?string
    {
        return is_string($v) ? strtolower(preg_replace('/\s+/', '', $v)) : null;
    }

    // ---- brute-force limiter: per user + IP, failures only ----

    private function failKey(User $user, string $ip): string
    {
        return '2fa-fail:'.$user->id.'|'.$ip;
    }

    public function tooManyFailures(User $user, string $ip): bool
    {
        return RateLimiter::tooManyAttempts($this->failKey($user, $ip), self::MAX_FAILURES);
    }

    public function retryAfter(User $user, string $ip): int
    {
        return max(1, RateLimiter::availableIn($this->failKey($user, $ip)));
    }

    public function hitFailure(User $user, string $ip): void
    {
        RateLimiter::hit($this->failKey($user, $ip), self::FAILURE_DECAY);
    }

    public function clearFailures(User $user, string $ip): void
    {
        RateLimiter::clear($this->failKey($user, $ip));
    }

    // ---- login challenge tokens: opaque, short-lived, single-use, bound to the user ----

    public function issueChallenge(User $user, ?string $device): string
    {
        $token = 'tfc_'.Str::random(48);
        Cache::put($this->challengeKey($token), ['user_id' => $user->id, 'device' => $device, 'attempts' => 0], now()->addSeconds((int) config('auth.two_factor.challenge_ttl', 300)));

        return $token;
    }

    /** @return array{user_id:int,device:?string,attempts:int}|null */
    public function peekChallenge(string $token): ?array
    {
        return Cache::get($this->challengeKey($token));
    }

    /** Counts a wrong code against the challenge; the challenge dies after too many. */
    public function failChallenge(string $token): void
    {
        $data = $this->peekChallenge($token);
        if (! $data) {
            return;
        }
        $data['attempts']++;
        if ($data['attempts'] >= self::CHALLENGE_MAX_ATTEMPTS) {
            Cache::forget($this->challengeKey($token));

            return;
        }
        Cache::put($this->challengeKey($token), $data, now()->addSeconds((int) config('auth.two_factor.challenge_ttl', 300)));
    }

    /** Atomically consumes the challenge: only the first caller gets true. */
    public function consumeChallenge(string $token): bool
    {
        return Cache::pull($this->challengeKey($token)) !== null;
    }

    private function challengeKey(string $token): string
    {
        return 'twofa-challenge:'.hash('sha256', $token);
    }

    // ---- internals ----

    /** Verifies the code and atomically records its time step so the same code cannot be used twice. */
    private function acceptStep(TwoFactorCredential $cred, string $code): bool
    {
        $step = $this->totp->verify($cred->secret, $code, $cred->last_used_step);
        if ($step === null) {
            return false;
        }

        return TwoFactorCredential::whereKey($cred->id)
            ->where(fn ($q) => $q->whereNull('last_used_step')->orWhere('last_used_step', '<', $step))
            ->update(['last_used_step' => $step, 'updated_at' => now()]) === 1;
    }

    private function consumeRecovery(User $user, string $code): bool
    {
        $row = RecoveryCode::where('user_id', $user->id)->where('code_hash', $this->hashRecovery($code))->whereNull('used_at')->first();

        return $row !== null
            && RecoveryCode::whereKey($row->id)->whereNull('used_at')->update(['used_at' => now()]) === 1;
    }

    private function hashRecovery(string $code): string
    {
        return hash_hmac('sha256', $code, (string) config('app.key'));
    }
}
