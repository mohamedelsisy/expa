<?php

namespace App\Domains\Privacy\Providers;

use App\Domains\Privacy\Contracts\PersonalDataProvider;
use App\Domains\TwoFactor\Models\RecoveryCode;
use App\Domains\TwoFactor\Models\TwoFactorCredential;
use App\Models\User;

class TwoFactorData implements PersonalDataProvider
{
    public function key(): string
    {
        return 'two_factor';
    }

    /** Status only: never the secret or recovery codes. */
    public function export(User $user): array
    {
        $cred = TwoFactorCredential::where('user_id', $user->id)->first();

        return [
            'enabled' => $cred?->confirmed_at !== null && $cred !== null,
            'enabled_at' => $cred?->confirmed_at?->toIso8601String(),
            'recovery_codes_remaining' => RecoveryCode::where('user_id', $user->id)->whereNull('used_at')->count(),
        ];
    }

    public function erase(User $user): void
    {
        RecoveryCode::where('user_id', $user->id)->delete();
        TwoFactorCredential::where('user_id', $user->id)->delete();
    }
}
