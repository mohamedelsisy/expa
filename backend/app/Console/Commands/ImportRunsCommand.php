<?php

namespace App\Console\Commands;

use App\Domains\DataImport\Models\DataImportRun;
use Illuminate\Console\Command;

class ImportRunsCommand extends Command
{
    protected $signature = 'expa:import-runs {--dataset= : Only this dataset} {--limit=15}';

    protected $description = 'List recent real-data import runs (source, licence, counts, status)';

    public function handle(): int
    {
        $runs = DataImportRun::query()->when($this->option('dataset'), fn ($q, $d) => $q->where('dataset', $d))
            ->latest('id')->limit((int) $this->option('limit'))->get();
        $this->table(['id', 'dataset', 'status', 'read', 'added', 'updated', 'unch.', 'rej.', 'licence', 'fetched', 'edition'],
            $runs->map(fn ($r) => [$r->id, $r->dataset, $r->status, $r->records_read, $r->added, $r->updated, $r->unchanged, $r->rejected,
                $r->license, optional($r->fetched_at)->toDateString(), $r->source_edition])->all());

        return self::SUCCESS;
    }
}
