<?php

namespace App\Http\Resources;

use App\Domains\Documents\Models\UserDocument;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin UserDocument */
class UserDocumentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $status = $this->status();

        return [
            'id' => $this->id,
            'type' => ['key' => $this->type->key, 'name' => $this->type->localized('name')],
            'label' => $this->label,
            'display_name' => $this->displayName(),
            'issue_date' => $this->issue_date?->toDateString(),
            'expiry_date' => $this->expiry_date?->toDateString(),
            'days_remaining' => $this->daysRemaining(),
            'status' => $status,
            'status_label' => __("documents.status.$status"),
            'notes' => $this->notes,
            'reminders_enabled' => $this->reminders_enabled,
            'reminder_offsets' => $this->effectiveOffsets(),
            'upcoming_reminders' => $this->reminders->where('status', 'pending')->sortBy('remind_on')->map(fn ($r) => [
                'on' => $r->remind_on->toDateString(),
                'kind' => $r->kind,
                'offset_days' => $r->offset_days,
                'after_expiry' => $r->kind === 'expired', // offset_days is -1 for these; prefer this flag
            ])->values(),
            'attachments' => $this->attachments->map(fn ($a) => [
                'id' => $a->id,
                'name' => $a->original_name,
                'mime' => $a->mime,
                'size' => $a->size,
                'created_at' => $a->created_at?->toIso8601String(),
            ])->values(),
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
