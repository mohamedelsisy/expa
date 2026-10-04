<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Schedule::command('sanctum:prune-expired --hours=24')->daily();
Schedule::command('expa:prune-audit-logs')->monthly();
Schedule::command('expa:publish-scheduled')->everyFiveMinutes()->withoutOverlapping(10);
Schedule::command('expa:send-reminders')->dailyAt('08:00')->withoutOverlapping(60);
Schedule::command('expa:prune-ai-messages')->dailyAt('03:30');
Schedule::command('expa:jobs-import')->hourly()->withoutOverlapping(55); // each source runs when its own schedule_hours (default 6) elapsed
Schedule::command('expa:jobs-expire')->dailyAt('04:00');
Schedule::command('expa:billing-expire')->hourly();
Schedule::command('auth:clear-resets')->dailyAt('03:10');
Schedule::command('expa:prune-retention')->dailyAt('03:20');
