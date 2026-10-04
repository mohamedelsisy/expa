<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Schedule::command('sanctum:prune-expired --hours=24')->daily();
Schedule::command('expa:prune-audit-logs')->monthly();
Schedule::command('expa:publish-scheduled')->everyFiveMinutes()->withoutOverlapping();
Schedule::command('expa:send-reminders')->dailyAt('08:00')->withoutOverlapping();
Schedule::command('expa:prune-ai-messages')->dailyAt('03:30');
Schedule::command('expa:jobs-import')->hourly()->withoutOverlapping(); // each source runs when its own schedule_hours (default 6) elapsed
Schedule::command('expa:jobs-expire')->dailyAt('04:00');
Schedule::command('expa:billing-expire')->hourly();
