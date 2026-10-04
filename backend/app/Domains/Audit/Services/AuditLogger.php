<?php

namespace App\Domains\Audit\Services;

use App\Domains\Audit\Models\AuditLog;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;

/**
 * Action names are `domain.event` (e.g. auth.login, admin.user.roles_changed).
 * Never put secrets or raw PII in `changes`: IP and email are stored only as HMACs.
 */
class AuditLogger
{
    /** @param  User|false|null  $actor  false = current authenticated user (default); null = no actor (system) */
    public function log(string $action, ?Model $subject = null, array $changes = [], User|false|null $actor = false): AuditLog
    {
        $actor = $actor === false ? auth()->user() : $actor;

        return AuditLog::create([
            'actor_id' => $actor?->id,
            'action' => $action,
            'subject_type' => $subject ? $subject->getMorphClass() : null,
            'subject_id' => $subject?->getKey(),
            'changes' => $changes ?: null,
            'ip_hash' => $this->hash(request()->ip()),
        ]);
    }

    public function hash(?string $value): ?string
    {
        return $value ? hash_hmac('sha256', mb_strtolower($value), config('app.key')) : null;
    }
}
