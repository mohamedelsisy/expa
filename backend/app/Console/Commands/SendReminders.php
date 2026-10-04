<?php

namespace App\Console\Commands;

use App\Domains\Reminders\Services\ReminderDispatcher;
use Illuminate\Console\Command;

class SendReminders extends Command
{
    protected $signature = 'expa:send-reminders';

    protected $description = 'Dispatch document-expiry reminders that are due today';

    public function handle(ReminderDispatcher $dispatcher): int
    {
        $this->info('Dispatched '.$dispatcher->dispatchDue().' reminder(s).');

        return self::SUCCESS;
    }
}
