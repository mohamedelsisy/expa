<?php

namespace App\Jobs;

use App\Domains\Audit\Models\AuditLog;
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

    /** All retries exhausted: the account is locked but only partly erased. Make that loud (log + audit trail). */
    public function failed(\Throwable $e): void
    {
        report($e);
        AuditLog::create(['actor_id' => null, 'action' => 'privacy.erasure_failed', 'subject_type' => 'user', 'subject_id' => $this->userId, 'changes' => ['error' => $e::class]]);
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
