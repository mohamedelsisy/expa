<?php

namespace App\Domains\Dashboard\Actions;

use App\Domains\Dashboard\Contracts\NextActionProvider;
use App\Domains\Profile\Enums\ConsentPurpose;
use App\Domains\Profile\Services\ConsentService;
use App\Models\User;

class ConsentActions implements NextActionProvider
{
    public function __construct(private ConsentService $consents) {}

    public function actionsFor(User $user): array
    {
        if ($this->consents->has($user, ConsentPurpose::ProfilePersonalization)) {
            return [];
        }

        return [[
            'key' => 'consent.personalization',
            'type' => 'privacy',
            'priority' => 95,
            'title' => __('dashboard.actions.enable_personalization.title'),
            'description' => __('dashboard.actions.enable_personalization.description'),
            'cta' => ['type' => 'route', 'target' => 'privacy-settings'],
        ]];
    }
}
