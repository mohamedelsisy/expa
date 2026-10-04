<?php

namespace App\Notifications;

use App\Domains\Notifications\Models\UserNotification;
use App\Domains\Notifications\Services\NotificationPresenter;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class UserNotificationMail extends Notification
{
    public function __construct(private UserNotification $notification) {}

    public function via($notifiable): array
    {
        return ['mail'];
    }

    public function toMail($notifiable): MailMessage
    {
        $presenter = app(NotificationPresenter::class);
        $cta = $presenter->cta($this->notification);

        $mail = (new MailMessage)
            ->subject($presenter->title($this->notification))
            ->greeting(__('mail.greeting', ['name' => $notifiable->name]))
            ->line($presenter->body($this->notification));

        if ($cta) {
            $mail->action(__('notifications.mail.open'), rtrim(config('expa.frontend_url'), '/').'/'.$notifiable->preferredLocale().'/'.$cta['target']);
        }

        return $mail->line(__('notifications.mail.footer'));
    }
}
