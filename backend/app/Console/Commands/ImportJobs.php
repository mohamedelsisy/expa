<?php

namespace App\Console\Commands;

use App\Domains\Jobs\Models\JobSource;
use App\Jobs\RunJobImport;
use Illuminate\Console\Command;

class ImportJobs extends Command
{
    protected $signature = 'expa:jobs-import {--source= : Source key to run now, ignoring its schedule}';

    protected $description = 'Queue imports for active job sources that are due';

    public function handle(): int
    {
        $sources = JobSource::where('active', true)->when($this->option('source'), fn ($q, $k) => $q->where('key', $k))->get();
        $n = 0;
        foreach ($sources as $s) {
            if ($this->option('source') || $s->isDue()) {
                RunJobImport::dispatch($s->id);
                $n++;
            }
        }
        $this->info("Queued $n import(s).");

        return self::SUCCESS;
    }
}
