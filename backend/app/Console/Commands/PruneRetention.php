<?php

namespace App\Console\Commands;

use App\Domains\Jobs\Models\JobImportRun;
use App\Domains\Notifications\Models\UserNotification;
use Illuminate\Console\Command;

class PruneRetention extends Command
{
    protected $signature = 'expa:prune-retention';

    protected $description = 'Delete data past its documented retention period (notifications, job import runs)';

    public function handle(): int
    {
        $n = UserNotification::where('created_at', '<', now()->subMonths(config('privacy.retention.notifications_months')))->delete();
        $r = JobImportRun::where('started_at', '<', now()->subDays(config('privacy.retention.job_import_runs_days')))->delete();
        $this->info("Pruned $n notification(s) and $r import run(s).");

        return self::SUCCESS;
    }
}
