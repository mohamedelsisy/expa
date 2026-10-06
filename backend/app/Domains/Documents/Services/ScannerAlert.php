<?php

namespace App\Domains\Documents\Services;

use App\Domains\Notifications\Services\NotificationService;
use App\Models\User;
use Illuminate\Support\Facades\Cache;

/** Tells administrators the antivirus is unreachable (at most once per hour, so an outage cannot flood anyone). */
class ScannerAlert
{
    public function __construct(private NotificationService $notifications) {}

    public function unavailable(): void
    {
        if (! Cache::add('alert:scanner_unavailable', 1, 3600)) {
            return;
        }
        logger()->error('documents.scanner_unavailable');
        User::whereHas('roles', fn ($r) => $r->whereIn('key', ['admin', 'super_admin']))->get()
            ->each(fn (User $admin) => $this->notifications->notify($admin, 'scanner_unavailable', []));
    }
}
