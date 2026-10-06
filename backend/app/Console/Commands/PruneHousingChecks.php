<?php

namespace App\Console\Commands;

use App\Domains\Housing\Models\HousingCheck;
use Illuminate\Console\Command;

class PruneHousingChecks extends Command
{
    protected $signature = 'expa:prune-housing-checks';

    protected $description = 'Delete saved rental-checker results past their retention date';

    public function handle(): int
    {
        $n = HousingCheck::where('expires_at', '<', now())->delete();
        $this->info("Pruned $n saved housing check(s).");

        return self::SUCCESS;
    }
}
