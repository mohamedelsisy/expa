<?php

namespace App\Console\Commands;

use App\Domains\Jobs\Services\JobImportRunner;
use Illuminate\Console\Command;

class ExpireJobs extends Command
{
    protected $signature = 'expa:jobs-expire';

    protected $description = 'Mark jobs that passed their expiry (or default lifetime) as expired';

    public function handle(JobImportRunner $runner): int
    {
        $this->info('Expired '.$runner->expire().' job(s).');

        return self::SUCCESS;
    }
}
