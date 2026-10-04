<?php

namespace App\Domains\Jobs\Services;

use App\Domains\Jobs\Models\JobSource;
use App\Domains\Notifications\Services\NotificationService;
use App\Models\User;

/** Alerts people who manage job sources (in-app; email if they opted in) when a source is switched off. */
class JobAlertService
{
    public function __construct(private NotificationService $notifications) {}

    public function sourceDisabled(JobSource $source): void
    {
        User::whereHas('roles', fn ($r) => $r->whereIn('key', ['admin', 'super_admin']))->get()->each(
            fn (User $admin) => $this->notifications->notify($admin, 'job_source_failing', ['source' => $source->name, 'failures' => $source->consecutive_failures])
        );
    }
}
