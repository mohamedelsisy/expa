<?php

namespace App\Support;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\RateLimiter;

/**
 * Per-account brute-force policy that cannot be used to lock the owner out (BE-2).
 *
 * Layers (the first two live in the `login` rate limiter, per request): 5/min per (email, IP) and 30/min per IP.
 * This class adds the per-account layer, counting only FAILED attempts across all IPs:
 *
 *  - below FAILURE_LIMIT failures/hour the account behaves normally;
 *  - above it the account is in "challenge" mode: a password check is still performed (so the owner with the correct
 *    password is never refused outright) but only from an IP the owner already logged in from (known device), or
 *    within a small shared budget of verifications per hour for unknown IPs. An attacker who exhausts the budget
 *    can therefore only delay a login from a NEW network; password reset and known devices keep working.
 *
 * Distributed guessing stays bounded to FAILURE_LIMIT + SOFT_BUDGET guesses per hour per account.
 */
class LoginGuard
{
    public const FAILURE_LIMIT = 20;

    public const SOFT_BUDGET = 10;

    private const WINDOW = 3600;

    private const KNOWN_IP_TTL_DAYS = 30;

    public static function normalise(mixed $email): string
    {
        return is_string($email) ? mb_strtolower(trim($email)) : 'invalid';
    }

    private function failKey(string $email): string
    {
        return 'login-fail:'.sha1($email);
    }

    private function knownKey(string $email, string $ip): string
    {
        return 'login-known:'.sha1($email.'|'.$ip);
    }

    /** Whether a password verification may be attempted now. Counts against the soft budget when in challenge mode. */
    public function mayVerify(string $email, string $ip): bool
    {
        if (! RateLimiter::tooManyAttempts($this->failKey($email), self::FAILURE_LIMIT)) {
            return true;
        }
        if (Cache::has($this->knownKey($email, $ip))) {
            return true;
        }
        $soft = 'login-soft:'.sha1($email);
        if (RateLimiter::tooManyAttempts($soft, self::SOFT_BUDGET)) {
            return false;
        }
        RateLimiter::hit($soft, self::WINDOW);

        return true;
    }

    public function retryAfter(string $email): int
    {
        return max(1, RateLimiter::availableIn('login-soft:'.sha1($email)));
    }

    public function failed(string $email): void
    {
        RateLimiter::hit($this->failKey($email), self::WINDOW);
    }

    public function succeeded(string $email, string $ip): void
    {
        RateLimiter::clear($this->failKey($email));
        RateLimiter::clear('login-soft:'.sha1($email));
        Cache::put($this->knownKey($email, $ip), true, now()->addDays(self::KNOWN_IP_TTL_DAYS));
    }
}
