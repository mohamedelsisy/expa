<?php

namespace App\Jobs;

use App\Domains\Privacy\Services\UserEraser;
use App\Models\User;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class EraseUserData implements ShouldQueue
{
    use Queueable;

    public int $tries = 5;

    public function __construct(public int $userId) {}

    public function backoff(): array
    {
        return [60, 300, 900, 3600];
    }

    public function handle(UserEraser $eraser): void
    {
        $user = User::withTrashed()->find($this->userId);

        // Already erased (job retried / duplicate dispatch) or never existed.
        if (! $user || $user->trashed()) {
            return;
        }

        $eraser->erase($user);
    }
}
