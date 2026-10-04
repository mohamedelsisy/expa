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
            'action' => $this->action,
            'subject_type' => $this->subject_type,
            'subject_id' => $this->subject_id,
            'changes' => $this->changes,
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
