<?php

namespace App\Domains\Reminders\Services;

use App\Domains\Documents\Models\UserDocument;

class UserDocumentObserver
{
    public function __construct(private ReminderScheduler $scheduler) {}

    public function saved(UserDocument $doc): void
    {
        if ($doc->wasRecentlyCreated || $doc->wasChanged(['expiry_date', 'reminder_offsets', 'reminders_enabled'])) {
            $this->scheduler->sync($doc, expiryChanged: ! $doc->wasRecentlyCreated && $doc->wasChanged('expiry_date'));
        }
    }
}
