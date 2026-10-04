<?php

namespace App\Domains\Privacy\Providers;

use App\Domains\Documents\Models\DocumentAttachment;
use App\Domains\Documents\Models\UserDocument;
use App\Domains\Documents\Services\AttachmentStore;
use App\Domains\Privacy\Contracts\PersonalDataProvider;
use App\Domains\Reminders\Models\Reminder;
use App\Models\User;

class DocumentData implements PersonalDataProvider
{
    public function __construct(private AttachmentStore $store) {}

    public function key(): string
    {
        return 'documents';
    }

    /** Metadata is in the bundle; the files themselves remain downloadable through the attachment endpoint. */
    public function export(User $user): array
    {
        return UserDocument::where('user_id', $user->id)->with(['type', 'attachments'])->orderBy('id')->get()->map(fn (UserDocument $d) => [
            'type' => $d->type->key,
            'label' => $d->label,
            'issue_date' => $d->issue_date?->toDateString(),
            'expiry_date' => $d->expiry_date?->toDateString(),
            'notes' => $d->notes,
            'reminders_enabled' => $d->reminders_enabled,
            'reminder_offsets' => $d->reminder_offsets,
            'attachments' => $d->attachments->map(fn ($a) => [
                'id' => $a->id, 'name' => $a->original_name, 'mime' => $a->mime, 'size' => $a->size, 'sha256' => $a->sha256,
            ])->all(),
        ])->all();
    }

    public function erase(User $user): void
    {
        // Files first: if row deletion were to fail we must not orphan personal files on disk.
        DocumentAttachment::where('user_id', $user->id)->get()->each(fn ($a) => $this->store->delete($a));
        Reminder::where('user_id', $user->id)->delete();
        UserDocument::where('user_id', $user->id)->delete();
    }
}
