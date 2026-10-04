<?php

namespace App\Domains\Profile\Services;

use App\Domains\Profile\Models\UserProfile;

/**
 * Onboarding is derived from the data itself: a step is "answered" when any of its fields is set,
 * "skipped" when the user explicitly skipped it. Only `status` is required; the rest are optional.
 */
class OnboardingService
{
    public const STEPS = [
        'status' => ['fields' => ['segment'], 'required' => true],
        'nationality' => ['fields' => ['nationality'], 'required' => false],
        'residence' => ['fields' => ['residence_type'], 'required' => false],
        'language' => ['fields' => ['italian_level', 'english_level'], 'required' => false],
        'goals' => ['fields' => ['goals'], 'required' => false],
        'age' => ['fields' => ['age_range'], 'required' => false],
    ];

    public function state(UserProfile $profile): array
    {
        $skipped = $profile->onboarding_skipped ?? [];
        $steps = [];
        $answered = 0;

        foreach (self::STEPS as $key => $def) {
            $isAnswered = collect($def['fields'])->contains(fn ($f) => filled($profile->{$f}));
            $isSkipped = ! $isAnswered && in_array($key, $skipped, true);
            $answered += ($isAnswered || $isSkipped) ? 1 : 0;

            $steps[] = [
                'key' => $key,
                'required' => $def['required'],
                'status' => $isAnswered ? 'answered' : ($isSkipped ? 'skipped' : 'pending'),
            ];
        }

        $requiredDone = collect($steps)->where('required', true)->every(fn ($s) => $s['status'] === 'answered');

        return [
            'steps' => $steps,
            'required_complete' => $requiredDone,
            'completed' => $profile->onboarding_completed_at !== null,
            'progress_percent' => (int) round($answered / count(self::STEPS) * 100),
        ];
    }

    public function skip(UserProfile $profile, string $step): void
    {
        $profile->onboarding_skipped = array_values(array_unique([...($profile->onboarding_skipped ?? []), $step]));
        $profile->save();
    }

    /** @return bool false when required steps are missing */
    public function complete(UserProfile $profile): bool
    {
        if (! $this->state($profile)['required_complete']) {
            return false;
        }
        $profile->onboarding_completed_at ??= now();
        $profile->save();

        return true;
    }
}
