<?php

namespace App\Jobs;

use App\Domains\Notifications\Services\NotificationService;
use App\Enums\UserStatus;
use App\Models\User;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

/** In-app announcement to active users (optionally one role). In-app ONLY: no email or push without a dedicated consent. */
class BroadcastAnnouncement implements ShouldQueue
{
    use Queueable;

    public int $tries = 2;

    public int $timeout = 600;

    /** @param  array<string,string>  $title  locale => text  @param  array<string,string>  $body */
    public function __construct(public array $title, public array $body, public ?string $role = null) {}

    public function handle(NotificationService $notifications): void
    {
        User::query()->where('status', UserStatus::Active->value)
            ->when($this->role, fn ($q, $r) => $q->whereHas('roles', fn ($x) => $x->where('key', $r)))
            ->chunkById(500, function ($users) use ($notifications) {
                foreach ($users as $user) {
                    $notifications->notify($user, 'announcement', ['title' => $this->title, 'body' => $this->body], channels: ['in_app']);
                }
            });
    }
}
