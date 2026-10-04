<?php

namespace App\Domains\Privacy\Providers;

use App\Domains\Privacy\Contracts\PersonalDataProvider;
use App\Models\User;

class ProfileData implements PersonalDataProvider
{
    public function key(): string
    {
        return 'profile';
    }

    public function export(User $user): array
    {
        $p = $user->profile;

        return $p ? [
            'city' => $p->city?->slug,
            'segment' => $p->segment?->value,
            'nationality' => $p->nationality,
            'residence_type' => $p->residence_type,
            'age_range' => $p->age_range?->value,
            'italian_level' => $p->italian_level?->value,
            'english_level' => $p->english_level?->value,
            'goals' => $p->goals ?? [],
            'onboarding_completed_at' => $p->onboarding_completed_at?->toIso8601String(),
        ] : [];
    }

    public function erase(User $user): void
    {
        $user->profile()->delete();
    }
}
