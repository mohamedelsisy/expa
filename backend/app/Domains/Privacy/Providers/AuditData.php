<?php

namespace App\Domains\Privacy\Providers;

use App\Domains\Audit\Models\AuditLog;
use App\Domains\Privacy\Contracts\PersonalDataProvider;
use App\Models\User;

class AuditData implements PersonalDataProvider
{
    public function key(): string
    {
        return 'activity_log';
    }

    public function export(User $user): array
    {
        return AuditLog::where('actor_id', $user->id)
            ->orWhere(fn ($q) => $q->where('subject_type', $user->getMorphClass())->where('subject_id', $user->id))
            ->orderBy('id')->limit(5000)->get()->map(fn (AuditLog $l) => [
                'action' => $l->action,
                'at' => $l->created_at?->toIso8601String(),
            ])->all();
    }

    /** Security logs are retained (legitimate interest) but no longer attributable to the person. */
    public function erase(User $user): void
    {
        AuditLog::where('actor_id', $user->id)->toBase()->update(['actor_id' => null, 'ip_hash' => null]);
        AuditLog::where('subject_type', $user->getMorphClass())->where('subject_id', $user->id)
            ->toBase()->update(['ip_hash' => null, 'changes' => null]);
    }
}
