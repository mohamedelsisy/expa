<?php

namespace App\Listeners;

use App\Domains\Notifications\Services\NotificationService;
use App\Domains\Profile\Enums\ConsentPurpose;
use App\Domains\Profile\Services\ConsentService;
use App\Domains\Reminders\Models\Reminder;
use App\Enums\UserStatus;
use App\Events\ReminderDue;
use Illuminate\Contracts\Queue\ShouldQueue;

class NotifyUserOfReminder implements ShouldQueue
{
    public int $tries = 3;

    public function __construct(private NotificationService $notifications, private ConsentService $consents) {}

    public function handle(ReminderDue $event): void
    {
        $reminder = Reminder::with('document.type.translations', 'document.user')->find($event->reminderId);
        $doc = $reminder?->document;
        $user = $doc?->user;

        // Document deleted, account being erased/suspended, reminders turned off, or storage consent withdrawn since scheduling.
        if (! $doc || ! $user || $user->status !== UserStatus::Active || ! $doc->reminders_enabled
            || ! $this->consents->has($user, ConsentPurpose::DocumentStorage)) {
            return;
        }

        $this->notifications->notify($user, $reminder->kind === 'expired' ? 'document_expired' : 'document_reminder', [
            'document_id' => $doc->id,
            'name' => $doc->displayName(),
            'days' => max(0, (int) $doc->daysRemaining()),
            'expiry_date' => $doc->expiry_date?->toDateString(),
        ]);
    }
}
