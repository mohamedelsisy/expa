<?php

namespace App\Console\Commands;

use App\Domains\Billing\Models\Subscription;
use Illuminate\Console\Command;

class ExpireSubscriptions extends Command
{
    protected $signature = 'expa:billing-expire';

    protected $description = 'Expire subscriptions whose paid period ended (cancelled-at-period-end, or manual grants)';

    public function handle(): int
    {
        $n = Subscription::whereIn('status', ['active', 'trialing', 'past_due'])->whereNotNull('current_period_end')->where('current_period_end', '<=', now())
            ->where(fn ($q) => $q->where('cancel_at_period_end', true)->orWhere('provider', 'manual'))->update(['status' => 'expired']);
        $this->info("Expired $n subscription(s).");

        return self::SUCCESS;
    }
}
