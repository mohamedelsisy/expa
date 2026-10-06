<?php

namespace App\Domains\Billing\Services;

use App\Domains\Audit\Services\AuditLogger;
use App\Domains\Billing\Models\Subscription;
use App\Domains\Notifications\Services\NotificationService;

/**
 * Failed-payment handling ("dunning"). The provider owns the retry schedule (smart retries); EXPA owns the customer
 * communication and the access policy:
 *   - failure       -> `past_due`, access kept for `billing.dunning.grace_days`, notification `payment_failed` (immediately)
 *   - reminders     -> `payment_failed_reminder` on each day in `billing.dunning.reminder_days` after the failure
 *   - grace over    -> `expired` + notification `subscription_ended`
 *   - payment OK    -> back to `active`, counters cleared (WebhookHandler)
 * Run by `expa:billing-expire` (hourly) so a stopped provider webhook can never leave an unpaid account premium forever.
 */
class DunningService
{
    public function __construct(private NotificationService $notifications, private AuditLogger $audit) {}

    public function enterGrace(Subscription $sub): void
    {
        if (! SubscriptionState::can($sub->status, SubscriptionState::PAST_DUE) || $sub->status === SubscriptionState::PAST_DUE) {
            return;
        }
        $days = max(0, (int) config('billing.dunning.grace_days', 7));
        $sub->forceFill(['status' => SubscriptionState::PAST_DUE, 'past_due_since' => now(), 'grace_ends_at' => now()->addDays($days), 'dunning_step' => 0])->save();
        $this->notify($sub, 'payment_failed', ['days' => $days]);
    }

    public function recover(Subscription $sub): void
    {
        $sub->forceFill(['past_due_since' => null, 'grace_ends_at' => null, 'dunning_step' => 0])->save();
    }

    /** @return array{reminded:int,expired:int} */
    public function run(): array
    {
        $reminded = $expired = 0;
        $offsets = array_values(array_map('intval', (array) config('billing.dunning.reminder_days', [3, 6])));

        Subscription::where('status', SubscriptionState::PAST_DUE)->with('user')->chunkById(200, function ($subs) use (&$reminded, &$expired, $offsets) {
            foreach ($subs as $sub) {
                if ($sub->grace_ends_at && $sub->grace_ends_at->isPast()) {
                    $sub->forceFill(['status' => SubscriptionState::EXPIRED])->save();
                    $this->audit->log('billing.subscription_expired_unpaid', $sub);
                    $this->notify($sub, 'subscription_ended', []);
                    $expired++;

                    continue;
                }
                $step = (int) $sub->dunning_step;
                if (isset($offsets[$step]) && $sub->past_due_since && $sub->past_due_since->copy()->addDays($offsets[$step])->isPast()) {
                    $sub->forceFill(['dunning_step' => $step + 1])->save();
                    $this->notify($sub, 'payment_failed_reminder', ['days' => max(0, (int) now()->diffInDays($sub->grace_ends_at, false))]);
                    $reminded++;
                }
            }
        });

        return ['reminded' => $reminded, 'expired' => $expired];
    }

    private function notify(Subscription $sub, string $type, array $data): void
    {
        $user = $sub->user ?? $sub->user()->first();
        if ($user) {
            $this->notifications->notify($user, $type, $data);
        }
    }
}
