<?php

namespace App\Domains\Privacy\Providers;

use App\Domains\Notifications\Models\DeviceToken;
use App\Domains\Notifications\Models\UserNotification;
use App\Domains\Privacy\Contracts\PersonalDataProvider;
use App\Models\User;

class NotificationData implements PersonalDataProvider
{
    public function key(): string
    {
        return 'notifications';
    }

    public function export(User $user): array
    {
        return [
            'inbox' => UserNotification::where('user_id', $user->id)->orderBy('created_at')->get()->map(fn ($n) => [
                'type' => $n->type, 'data' => $n->data, 'read_at' => $n->read_at?->toIso8601String(), 'created_at' => $n->created_at?->toIso8601String(),
            ])->all(),
            // Tokens are device identifiers: listed by platform/date only.
            'devices' => DeviceToken::where('user_id', $user->id)->get()->map(fn ($d) => [
                'platform' => $d->platform, 'registered_at' => $d->created_at?->toIso8601String(),
            ])->all(),
        ];
    }

    public function erase(User $user): void
    {
        UserNotification::where('user_id', $user->id)->delete();
        DeviceToken::where('user_id', $user->id)->delete();
    }
}
