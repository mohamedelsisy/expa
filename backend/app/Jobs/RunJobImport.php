<?php

namespace App\Jobs;

use App\Domains\Jobs\Models\JobSource;
use App\Domains\Jobs\Services\JobImportRunner;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use RuntimeException;
use Throwable;

class RunJobImport implements ShouldQueue
{
    use Queueable;

    public int $tries = 3;

    public function __construct(public int $sourceId) {}

    public function backoff(): array
    {
        return [60, 300, 900];
    }

    public function handle(JobImportRunner $runner): void
    {
        $source = JobSource::find($this->sourceId);
        if (! $source || ! $source->active) {
            return;
        }

        $run = $runner->run($source);

        // A failed fetch is retried by the queue with backoff; bookkeeping happens only when the retries are exhausted.
        if ($run->status === 'failed' && $run->fetched === 0) {
            throw new RuntimeException('Import failed: '.$run->error_message);
        }
    }

    public function failed(Throwable $e): void
    {
        if ($source = JobSource::find($this->sourceId)) {
            app(JobImportRunner::class)->registerFailure($source);
        }
    }
}
