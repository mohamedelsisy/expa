<?php

namespace App\Console\Commands;

use App\Domains\Marketplace\Models\ProviderLead;
use Illuminate\Console\Command;

class PruneMarketplaceLeads extends Command
{
    protected $signature = 'expa:prune-marketplace-leads';

    protected $description = 'Delete provider contact requests (leads) past the retention period (marketplace.leads.retention_days)';

    public function handle(): int
    {
        $n = ProviderLead::where('created_at', '<', now()->subDays((int) config('marketplace.leads.retention_days')))->delete();
        $this->info("Pruned $n contact request(s).");

        return self::SUCCESS;
    }
}
