<?php

namespace App\Listeners;

use App\Domains\Notifications\Services\NotificationService;
use App\Domains\Profile\Enums\ConsentPurpose;
use App\Domains\Profile\Services\ConsentService;
use App\Domains\Reminders\Models\Reminder;
use App\Enums\UserStatus;
use App\Events\ReminderDue;
use Illuminate\Contracts\Queue\ShouldQueue;
use Throwable;

class NotifyUserOfReminder implements ShouldQueue
{
    public int $tries = 3;

    /** Seconds between attempts (BE-7): outlasts a short queue/mail/DB outage instead of three immediate retries. */
    public function backoff(): array
    {
        return [60, 300, 900];
    }

    /**
     * Outbox semantics: the dispatcher marks a reminder `dispatched`, this listener marks it `notified_at` only after the
     * user was actually notified. When every attempt fails, the reminder goes back to `pending` so the next
     * `expa:send-reminders` pass re-dispatches it (bounded by Reminder::MAX_ATTEMPTS, then `failed` for admins to see).
     */
    public function failed(ReminderDue $event, Throwable $e): void
    {
        $reminder = Reminder::find($event->reminderId);
        if ($reminder && $reminder->notified_at === null) {
            $reminder->releaseForRetry();
        }
        report($e);
    }

    public function __construct(private NotificationService $notifications, private ConsentService $consents) {}

    public function handle(ReminderDue $event): void
    {
        $reminder = Reminder::with('document.type.translations', 'document.user')->find($event->reminderId);
        $doc = $reminder?->document;
        $user = $doc?->user;

        // Document deleted, account being erased/suspended, reminders turned off, or storage consent withdrawn since scheduling.
        if (! $doc || ! $user || $user->status !== UserStatus::Active || ! $doc->reminders_enabled
            || ! $this->consents->has($user, ConsentPurpose::DocumentStorage)) {
            $reminder?->forceFill(['notified_at' => now()])->save(); // nothing to send: settled, not lost

            return;
        }

        $this->notifications->notify($user, $reminder->kind === 'expired' ? 'document_expired' : 'document_reminder', [
            'document_id' => $doc->id,
            'name' => $doc->displayName(),
            'days' => max(0, (int) $doc->daysRemaining()),
            'expiry_date' => $doc->expiry_date?->toDateString(),
        ]);
        $reminder->forceFill(['notified_at' => now()])->save();
    }
}
