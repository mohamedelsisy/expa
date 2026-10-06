<?php

namespace App\Domains\Notifications\Services;

use App\Domains\Notifications\Contracts\PushSender;
use App\Domains\Notifications\Models\DeviceToken;
use App\Domains\Notifications\Models\UserNotification;
use App\Domains\Profile\Enums\ConsentPurpose;
use App\Domains\Profile\Services\ConsentService;
use App\Models\User;
use App\Notifications\UserNotificationMail;
use Throwable;

/**
 * Single entry point for notifying a user. In-app is always recorded; email and push are
 * additional channels, each requiring its own consent. One failing channel never blocks the others.
 */
class NotificationService
{
    public function __construct(
        private ConsentService $consents,
        private NotificationPresenter $presenter,
        private PushSender $push,
    ) {}

    /** @param  list<'in_app'|'email'|'push'>  $channels  in-app is always recorded; email/push only when listed AND consented */
    public function notify(User $user, string $type, array $data, array $channels = ['in_app', 'email', 'push']): UserNotification
    {
        $n = new UserNotification(['type' => $type, 'data' => $data]);
        $n->user_id = $user->id;
        $n->save();

        if (in_array('email', $channels, true)) {
            $this->email($user, $n);
        }
        if (in_array('push', $channels, true)) {
            $this->push($user, $n);
        }

        return $n;
    }

    private function email(User $user, UserNotification $n): void
    {
        if (! $user->hasVerifiedEmail() || ! $this->consents->has($user, ConsentPurpose::EmailReminders)) {
            return;
        }
        try {
            $user->notify(new UserNotificationMail($n));
        } catch (Throwable $e) {
            report($e);
        }
    }

    private function push(User $user, UserNotification $n): void
    {
        if (! $this->consents->has($user, ConsentPurpose::PushNotifications)) {
            return;
        }
        $tokens = DeviceToken::where('user_id', $user->id)->pluck('token')->all();
        if (! $tokens) {
            return;
        }

        $previous = app()->getLocale();
        try {
            app()->setLocale($user->preferredLocale());
            // Payload carries only routing ids; the OS lock screen must not reveal document names or dates.
            $invalid = $this->push->send(
                $tokens,
                __('notifications.push.title'),
                __("notifications.types.{$n->type}.push"),
                ['notification_id' => (string) $n->id, 'type' => $n->type],
            );
            if ($invalid) {
                DeviceToken::whereIn('token', $invalid)->delete();
            }
        } catch (Throwable $e) {
            report($e);
        } finally {
            app()->setLocale($previous);
        }
    }
}
