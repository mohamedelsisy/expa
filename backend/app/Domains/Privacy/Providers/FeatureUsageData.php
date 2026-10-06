<?php

namespace App\Domains\Privacy\Providers;

use App\Domains\Privacy\Contracts\PersonalDataProvider;
use App\Models\User;
use Illuminate\Support\Facades\DB;

/** Daily counters of plan-limited features (housing checks, document explanations): counts only, no content. */
class FeatureUsageData implements PersonalDataProvider
{
    public function key(): string
    {
        return 'feature_usage';
    }

    public function export(User $user): array
    {
        return DB::table('feature_usage')->where('user_id', $user->id)->orderBy('day')->orderBy('feature')->get(['feature', 'day', 'count'])
            ->map(fn ($r) => ['feature' => $r->feature, 'day' => $r->day, 'count' => (int) $r->count])->all();
    }

    public function erase(User $user): void
    {
        DB::table('feature_usage')->where('user_id', $user->id)->delete();
    }
}
