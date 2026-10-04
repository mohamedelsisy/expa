<?php

namespace App\Domains\Notifications\Services;

use App\Domains\Notifications\Contracts\PushSender;
use Illuminate\Support\Facades\Log;

/** Default sender until FCM credentials are configured: records that a push would be sent, without its content. */
class LogPushSender implements PushSender
{
    public function send(array $tokens, string $title, string $body, array $data = []): array
    {
        Log::info('push.stub', ['recipients' => count($tokens)]);

        return [];
    }
}
