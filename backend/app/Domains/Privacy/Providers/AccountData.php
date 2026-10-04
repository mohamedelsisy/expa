<?php

namespace App\Domains\Privacy\Providers;

use App\Domains\Privacy\Contracts\PersonalDataProvider;
use App\Models\User;

class AccountData implements PersonalDataProvider
{
    public function key(): string
    {
        return 'account';
    }

    public function export(User $user): array
    {
        return [
            'name' => $user->name,
            'email' => $user->email,
            'locale' => $user->locale,
            'email_verified_at' => $user->email_verified_at?->toIso8601String(),
            'created_at' => $user->created_at?->toIso8601String(),
            'last_login_at' => $user->last_login_at?->toIso8601String(),
            'roles' => $user->roles()->pluck('key')->all(),
            'devices' => $user->tokens()->get(['name', 'last_used_at', 'created_at'])->map(fn ($t) => [
                'name' => $t->name,
                'last_used_at' => $t->last_used_at?->toIso8601String(),
                'created_at' => $t->created_at?->toIso8601String(),
            ])->all(),
        ];
    }

    public function erase(User $user): void
    {
        $user->tokens()->delete();
        $user->roles()->detach();
        // The users row itself is anonymized by UserErasure (it must remain for referential integrity).
    }
}
