<?php

namespace App\Domains\Platform\Services;

use App\Domains\Billing\Services\SubscriptionService;
use App\Exceptions\ApiException;
use App\Models\User;
use Illuminate\Support\Facades\DB;

/**
 * Daily per-user allowance for plan-limited features, resolved like the AI quota: the plan feature
 * `<feature>_daily_limit` is the source of truth, `config("quotas.<feature>.<plan>")` the fallback when plans were never edited.
 */
class FeatureQuota
{
    public function __construct(private SubscriptionService $subscriptions) {}

    public function limitFor(User $user, string $feature): int
    {
        $plan = $this->subscriptions->planKey($user);
        $fallback = config("quotas.$feature.$plan", config("quotas.$feature.free", 0));

        return (int) $this->subscriptions->feature($user, $feature.'_daily_limit', $fallback);
    }

    /** Atomically takes one unit or throws 429 `quota_reached`. @return int units left after this one */
    public function consume(User $user, string $feature): int
    {
        $limit = $this->limitFor($user, $feature);
        $day = now()->toDateString();

        DB::table('feature_usage')->insertOrIgnore(['user_id' => $user->id, 'feature' => $feature, 'day' => $day, 'count' => 0]);
        $taken = DB::table('feature_usage')->where(['user_id' => $user->id, 'feature' => $feature, 'day' => $day])->where('count', '<', $limit)->increment('count');

        if ($taken === 0) {
            throw new ApiException('quota_reached', __('errors.quota_reached', ['limit' => $limit]), 429, [
                'feature' => [$feature], 'limit' => [(string) $limit], 'resets_at' => [now()->addDay()->startOfDay()->toIso8601String()],
            ]);
        }

        return max(0, $limit - $this->used($user, $feature));
    }

    public function refund(User $user, string $feature): void
    {
        DB::table('feature_usage')->where(['user_id' => $user->id, 'feature' => $feature, 'day' => now()->toDateString()])->where('count', '>', 0)->decrement('count');
    }

    public function used(User $user, string $feature): int
    {
        return (int) DB::table('feature_usage')->where(['user_id' => $user->id, 'feature' => $feature, 'day' => now()->toDateString()])->value('count');
    }

    public function remaining(User $user, string $feature): int
    {
        return max(0, $this->limitFor($user, $feature) - $this->used($user, $feature));
    }
}
