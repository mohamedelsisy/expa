<?php

namespace App\Http\Resources;

use App\Domains\Audit\Models\AuditLog;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin AuditLog */
class AuditLogResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'actor_id' => $this->actor_id,
            'actor' => $this->relationLoaded('actor') && $this->actor ? ['id' => $this->actor->id, 'name' => $this->actor->name] : null,
            'action' => $this->action,
            'subject_type' => AuditLog::subjectAlias($this->subject_type), // stable alias, e.g. `guide`, never a PHP class name
            'subject_id' => $this->subject_id,
            'changes' => $this->changes,
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
