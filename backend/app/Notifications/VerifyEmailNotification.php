<?php

namespace App\Notifications;

use Illuminate\Auth\Notifications\VerifyEmail;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;

/**
 * Localized verification mail. The button links to the web app, which calls the
 * signed API URL carried in the `url` query parameter (see AuthController docs).
 */
class VerifyEmailNotification extends VerifyEmail implements ShouldQueue
{
    use Queueable;

    public function toMail($notifiable): MailMessage
    {
        $apiUrl = $this->verificationUrl($notifiable);
        $link = rtrim(config('expa.frontend_url'), '/')
            .'/'.$notifiable->preferredLocale().'/verify-email?'.http_build_query(['url' => $apiUrl]);

        return (new MailMessage)
            ->subject(__('mail.verify.subject'))
            ->greeting(__('mail.greeting', ['name' => $notifiable->name]))
            ->line(__('mail.verify.line'))
            ->action(__('mail.verify.action'), $link)
            ->line(__('mail.verify.ignore'));
    }
}
