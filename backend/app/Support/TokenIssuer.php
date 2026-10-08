<?php

namespace App\Support;

use App\Models\User;

class TokenIssuer
{
    /**
     * BE-16: staff accounts (any role other than the default `user`) get a short-lived token; every user is capped at
     * `expa.limits.tokens` live tokens (the oldest are revoked).
     */
    public function issue(User $user, ?string $device): string
    {
        $max = max(1, (int) config('expa.limits.tokens', 20));
        $stale = $user->tokens()->orderByDesc('id')->pluck('id')->slice($max - 1);
        if ($stale->isNotEmpty()) {
            $user->tokens()->whereIn('id', $stale)->delete();
        }
        $isStaff = $user->roles()->where('key', '!=', config('permissions.default_role'))->exists();
        $expires = $isStaff ? now()->addMinutes((int) config('expa.staff_token_minutes', 720)) : null; // null = sanctum.expiration

        return $user->createToken($device ?: 'api', ['*'], $expires)->plainTextToken;
    }
}
