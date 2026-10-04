<?php

namespace App\Domains\Dashboard\Actions;

use App\Domains\Dashboard\Contracts\NextActionProvider;
use App\Domains\Dashboard\Services\SetupCatalog;
use App\Models\User;

class SetupTaskActions implements NextActionProvider
{
    private const MAX = 3;

    public function __construct(private SetupCatalog $catalog) {}

    public function actionsFor(User $user): array
    {
        $open = collect($this->catalog->forUser($user))
            ->filter(fn ($t) => $t['applicable'] && $t['status'] === 'todo')
            ->sortBy('priority')->take(self::MAX);

        $guides = $this->catalog->publishedGuideTitles($open->pluck('guide_slug')->all());

        return $open->map(function ($t) use ($guides) {
            $hasGuide = $t['guide_slug'] && isset($guides[$t['guide_slug']]);

            return [
                'key' => 'task.'.$t['key'],
                'type' => 'setup_task',
                'priority' => 100 + $t['priority'],
                'title' => __("setup.tasks.{$t['key']}.title"),
                'description' => __("setup.tasks.{$t['key']}.hint"),
                'cta' => $hasGuide
                    ? ['type' => 'guide', 'target' => $t['guide_slug']]
                    : ['type' => 'task', 'target' => $t['key']],
            ];
        })->values()->all();
    }
}
