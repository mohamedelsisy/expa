<?php

namespace App\Domains\Privacy\Providers;

use App\Domains\Dashboard\Models\UserTask;
use App\Domains\Privacy\Contracts\PersonalDataProvider;
use App\Models\User;

class SetupTaskData implements PersonalDataProvider
{
    public function key(): string
    {
        return 'setup_tasks';
    }

    public function export(User $user): array
    {
        return UserTask::where('user_id', $user->id)->orderBy('task_key')->get()->map(fn (UserTask $t) => [
            'task' => $t->task_key,
            'status' => $t->status,
            'completed_at' => $t->completed_at?->toIso8601String(),
        ])->all();
    }

    public function erase(User $user): void
    {
        UserTask::where('user_id', $user->id)->delete();
    }
}
