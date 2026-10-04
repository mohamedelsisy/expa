<?php

namespace App\Notifications;

use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;

class ResetPasswordNotification extends ResetPassword implements ShouldQueue
{
    use Queueable;

    public function toMail($notifiable): MailMessage
    {
        $link = rtrim(config('expa.frontend_url'), '/').'/'.$notifiable->preferredLocale()
            .'/reset-password?'.http_build_query(['token' => $this->token, 'email' => $notifiable->getEmailForPasswordReset()]);

        return (new MailMessage)
            ->subject(__('mail.reset.subject'))
            ->greeting(__('mail.greeting', ['name' => $notifiable->name]))
            ->line(__('mail.reset.line'))
            ->action(__('mail.reset.action'), $link)
            ->line(__('mail.reset.expires', ['minutes' => config('auth.passwords.users.expire')]))
            ->line(__('mail.reset.ignore'));
    }
}
