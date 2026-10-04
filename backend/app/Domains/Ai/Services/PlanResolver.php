<?php

namespace App\Domains\Ai\Services;

use App\Domains\Billing\Services\SubscriptionService;
use App\Models\User;

/** The user's plan comes from their active subscription (free when none). */
class PlanResolver
{
    public function __construct(private SubscriptionService $subscriptions) {}

    public function planFor(User $user): string
    {
        return $this->subscriptions->planKey($user);
    }
}
