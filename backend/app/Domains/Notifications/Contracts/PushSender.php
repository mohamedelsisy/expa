<?php

namespace App\Domains\Notifications\Contracts;

/** Transport for mobile/web push (FCM/APNs). Bind a real implementation when credentials exist (T-019b). */
interface PushSender
{
    /**
     * @param  list<string>  $tokens
     * @param  array<string,string>  $data  small, non-sensitive routing data only (never document names or dates)
     * @return list<string> tokens the provider reported as invalid (to be pruned)
     */
    public function send(array $tokens, string $title, string $body, array $data = []): array;
}
