<?php

namespace App\Domains\Dashboard\Services;

use App\Domains\Dashboard\Contracts\NextActionProvider;
use App\Models\User;
use Throwable;

class NextActionAggregator
{
    /** @param  iterable<NextActionProvider>  $providers */
    public function __construct(private iterable $providers) {}

    public function actionsFor(User $user, ?int $limit = null): array
    {
        $all = [];
        foreach ($this->providers as $provider) {
            try {
                array_push($all, ...$provider->actionsFor($user));
            } catch (Throwable $e) {
                // One failing module must never break the dashboard.
                report($e);
            }
        }

        usort($all, fn ($a, $b) => [$a['priority'], $a['key']] <=> [$b['priority'], $b['key']]);

        return array_slice($all, 0, $limit ?? config('setup.next_actions_limit'));
    }
}
