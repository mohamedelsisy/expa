<?php

namespace App\Domains\Ai\Services;

use App\Domains\Billing\Services\SubscriptionService;
use App\Exceptions\ApiException;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class AiUsageService
{
    public function __construct(private PlanResolver $plans, private SubscriptionService $subscriptions) {}

    public function limitFor(User $user): int
    {
        // Plan feature is the source of truth; config is the fallback when plans were never seeded.
        return (int) $this->subscriptions->feature($user, 'ai_daily_limit', config('ai.daily_limits.'.$this->plans->planFor($user), config('ai.daily_limits.free')));
    }

    /** Atomically takes one question from today's allowance or throws 429 `ai_limit_reached`. */
    public function consume(User $user): int
    {
        $limit = $this->limitFor($user);
        $day = now()->toDateString();

        DB::table('ai_usage')->insertOrIgnore(['user_id' => $user->id, 'day' => $day, 'count' => 0]);
        $taken = DB::table('ai_usage')->where('user_id', $user->id)->where('day', $day)->where('count', '<', $limit)->increment('count');

        if ($taken === 0) {
            throw new ApiException('ai_limit_reached', __('errors.ai_limit_reached', ['limit' => $limit]), 429, ['limit' => [(string) $limit], 'resets_at' => [now()->addDay()->startOfDay()->toIso8601String()]]);
        }

        return $limit - $this->used($user);
    }

    public function refund(User $user): void
    {
        DB::table('ai_usage')->where('user_id', $user->id)->where('day', now()->toDateString())->where('count', '>', 0)->decrement('count');
    }

    public function used(User $user): int
    {
        return (int) DB::table('ai_usage')->where('user_id', $user->id)->where('day', now()->toDateString())->value('count');
    }

    public function remaining(User $user): int
    {
        return max(0, $this->limitFor($user) - $this->used($user));
    }
}
