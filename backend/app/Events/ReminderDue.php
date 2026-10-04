<?php

namespace App\Events;

use Illuminate\Foundation\Events\Dispatchable;

class ReminderDue
{
    use Dispatchable;

    public function __construct(public int $reminderId) {}
}
