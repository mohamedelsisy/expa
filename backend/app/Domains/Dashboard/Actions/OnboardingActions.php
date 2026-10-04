<?php

namespace App\Domains\Dashboard\Actions;

use App\Domains\Dashboard\Contracts\NextActionProvider;
use App\Domains\Profile\Services\OnboardingService;
use App\Models\User;

class OnboardingActions implements NextActionProvider
{
    public function __construct(private OnboardingService $onboarding) {}

    public function actionsFor(User $user): array
    {
        $profile = $user->profile()->firstOrNew();
        $state = $this->onboarding->state($profile);

        if ($state['completed']) {
            return [];
        }

        return [[
            'key' => 'onboarding.complete',
            'type' => 'profile',
            // Below the urgent-deadline band (0–93, see DocumentActions) but above routine suggestions.
            'priority' => $state['required_complete'] ? 120 : 94,
            'title' => __('dashboard.actions.complete_onboarding.title'),
            'description' => __('dashboard.actions.complete_onboarding.description'),
            'cta' => ['type' => 'route', 'target' => 'onboarding'],
        ]];
    }
}
