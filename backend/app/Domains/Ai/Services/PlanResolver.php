<?php

namespace App\Domains\Ai\Services;

use App\Models\User;

/** Single seam where subscriptions will decide a user's plan (T-0xx billing). Until then everyone is on the default plan. */
class PlanResolver
{
    public function planFor(User $user): string
    {
        return config('ai.default_plan');
    }
}
