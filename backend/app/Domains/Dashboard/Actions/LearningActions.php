<?php

namespace App\Domains\Dashboard\Actions;

use App\Domains\Dashboard\Contracts\NextActionProvider;
use App\Domains\Learning\Models\ItalianLesson;
use App\Domains\Learning\Services\ProgressService;
use App\Models\User;

/** One gentle daily nudge, only when there is something to learn and nothing was done today. */
class LearningActions implements NextActionProvider
{
    public function __construct(private ProgressService $progress) {}

    public function actionsFor(User $user): array
    {
        if ($this->progress->completedToday($user) || ! ItalianLesson::published()->exists()) {
            return [];
        }

        $streak = $this->progress->streak($user);

        return [[
            'key' => 'learning.daily',
            'type' => 'learning',
            'priority' => 110,
            'title' => __('italian.action.title'),
            'description' => $streak > 0 ? __('italian.action.streak', ['days' => $streak]) : __('italian.action.description'),
            'cta' => ['type' => 'route', 'target' => 'learn-italian/daily'],
        ]];
    }
}
