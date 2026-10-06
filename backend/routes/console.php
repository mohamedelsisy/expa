<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Schedule::call(fn () => Cache::put('scheduler:heartbeat', now()->toIso8601String(), 600))->name('scheduler-heartbeat')->everyMinute();
Schedule::command('sanctum:prune-expired --hours=24')->daily();
Schedule::command('expa:prune-audit-logs')->onOneServer()->monthly();
Schedule::command('expa:publish-scheduled')->onOneServer()->everyFiveMinutes()->withoutOverlapping(10);
Schedule::command('expa:send-reminders')->onOneServer()->dailyAt('08:00')->withoutOverlapping(60);
Schedule::command('expa:prune-ai-messages')->onOneServer()->dailyAt('03:30');
Schedule::command('expa:jobs-import')->onOneServer()->hourly()->withoutOverlapping(55); // each source runs when its own schedule_hours (default 6) elapsed
Schedule::command('expa:jobs-expire')->onOneServer()->dailyAt('04:00');
Schedule::command('expa:billing-expire')->onOneServer()->hourly();
Schedule::command('auth:clear-resets')->dailyAt('03:10');
Schedule::command('expa:prune-retention')->onOneServer()->dailyAt('03:20');
