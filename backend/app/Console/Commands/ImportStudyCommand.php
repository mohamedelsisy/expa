<?php

namespace App\Console\Commands;

use App\Domains\DataImport\Support\ImportRun;
use App\Domains\DataImport\Support\SourceFetcher;
use App\Domains\Study\Import\MurStudyImporter;
use Illuminate\Console\Command;

class ImportStudyCommand extends Command
{
    protected $signature = 'expa:import:study
        {--file= : Local "Offerta formativa" CSV instead of downloading it}
        {--atenei-file= : Local "Atenei" CSV instead of downloading it}
        {--year= : Offering year to import (default: the latest in the file)}
        {--limit= : Import at most N courses (disables stale-marking)}
        {--dry-run : Parse and validate, write nothing}';

    protected $description = 'Import universities and degree courses from the MUR open-data portal (dataset Metadati, IODL 2.0)';

    public function handle(SourceFetcher $fetcher): int
    {
        $dry = (bool) $this->option('dry-run');
        try {
            $offer = $this->option('file') ? $fetcher->fromFile($this->option('file'), 'study') : $fetcher->fetch(MurStudyImporter::OFFER_URL, 'study', 'csv');
            $atenei = $this->option('atenei-file') ? $fetcher->fromFile($this->option('atenei-file'), 'study') : $fetcher->fetch(MurStudyImporter::ATENEI_URL, 'study', 'csv');
        } catch (\Throwable $e) {
            $this->error('Fetch failed: '.$e->getMessage());

            return self::FAILURE;
        }

        $year = (int) ($this->option('year') ?: MurStudyImporter::latestYear($offer->path));
        if ($year < 2000) {
            $this->error('No valid year found in the offering file.');

            return self::FAILURE;
        }

        $run = ImportRun::start([
            'dataset' => $dry ? 'study:dry-run' : 'study',
            'source_name' => 'MUR - Ufficio di Statistica, dataset Metadati: Atenei + Offerta formativa',
            'source_url' => MurStudyImporter::DATASET_PAGE,
            'license' => MurStudyImporter::LICENSE,
            'license_url' => MurStudyImporter::LICENSE_URL,
            'attribution' => MurStudyImporter::ATTRIBUTION,
            'source_edition' => "offerta formativa anno $year",
        ]);
        $run->fetched($offer);

        try {
            $out = (new MurStudyImporter($run, $dry))->import($atenei->path, $offer->path, $year, $offer, $this->option('limit') ? (int) $this->option('limit') : null);
            $row = $run->finish();
        } catch (\Throwable $e) {
            $run->finish($e->getMessage());
            $this->error('Import failed: '.$e->getMessage());

            return self::FAILURE;
        }

        $this->table(['year', 'universities', 'courses', 'read', 'added', 'updated', 'unchanged', 'rejected', 'stale', 'status'],
            [[$year, $out['universities'], $out['programs'], $row->records_read, $row->added, $row->updated, $row->unchanged, $row->rejected, $row->stale_marked, $row->status.($dry ? ' (dry-run)' : '')]]);

        return self::SUCCESS;
    }
}
