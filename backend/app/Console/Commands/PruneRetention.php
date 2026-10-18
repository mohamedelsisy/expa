<?php

namespace App\Console\Commands;

use App\Domains\DataImport\Support\RawDownloadPruner;
use App\Domains\Jobs\Models\JobImportRun;
use App\Domains\Notifications\Models\UserNotification;
use Illuminate\Console\Command;

class PruneRetention extends Command
{
    protected $signature = 'expa:prune-retention';

    protected $description = 'Delete data past its documented retention period (notifications, job import runs, old raw dataset downloads)';

    public function handle(): int
    {
        $n = UserNotification::where('created_at', '<', now()->subMonths(config('privacy.retention.notifications_months')))->delete();
        $r = JobImportRun::where('started_at', '<', now()->subDays(config('privacy.retention.job_import_runs_days')))->delete();
        $this->info("Pruned $n notification(s) and $r import run(s).");
        $f = app(RawDownloadPruner::class)->prune((int) config('dataimport.raw_retention_days'));
        $this->info("Pruned $f raw dataset download(s).");

        return self::SUCCESS;
    }
}
