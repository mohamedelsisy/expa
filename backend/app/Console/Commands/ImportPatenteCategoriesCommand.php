<?php

namespace App\Console\Commands;

use App\Domains\DataImport\Support\ImportRun;
use App\Domains\DataImport\Support\SourceFetcher;
use App\Domains\Patente\Support\PatenteCategoriesImporter;
use Illuminate\Console\Command;

class ImportPatenteCategoriesCommand extends Command
{
    protected $signature = 'expa:import:patente-categories
        {--file= : Alternative PHP definition file (default database/data/patente_categories.php)}
        {--dry-run : Validate and report, write nothing}
        {--verify-source : Re-read the official Ministry page and check every quoted sentence is still there}';

    protected $description = 'Import the driving-licence categories (vehicles + minimum age) from the reviewed, source-quoted definition file (no exam questions)';

    public function handle(PatenteCategoriesImporter $importer, SourceFetcher $fetcher): int
    {
        $path = $this->option('file') ?: database_path('data/patente_categories.php');
        if (! is_file($path)) {
            $this->error("Definition file not found: $path");

            return self::FAILURE;
        }
        $def = require $path;

        $errors = $importer->validate($def);
        if ($this->option('verify-source')) {
            $errors = [...$errors, ...$importer->verifySource($def, $fetcher)];
        }
        if ($errors) {
            foreach ($errors as $e) {
                $this->error($e);
            }
            $this->error('Definition invalid: nothing was written.');

            return self::FAILURE;
        }

        $run = ImportRun::start([
            'dataset' => $def['dataset'], 'source_name' => $def['source_name'], 'source_url' => $def['source_url'],
            'license' => $def['license'], 'attribution' => $def['attribution'], 'source_edition' => $def['source_edition'],
        ]);
        try {
            $row = $run->guard(function (ImportRun $r) use ($importer, $def) {
                $importer->import($def, $r, (bool) $this->option('dry-run'), $this->option('verify-source') ? now() : $importer->reviewedOn($def));

                return $r->finish();
            });
        } catch (\Throwable $e) {
            $this->error('Import failed: '.$e->getMessage());

            return self::FAILURE;
        }

        $this->table(['read', 'added', 'updated', 'unchanged', 'rejected', 'status'], [[$row->records_read, $row->added, $row->updated, $row->unchanged, $row->rejected, $row->status.($this->option('dry-run') ? ' (dry-run)' : '')]]);

        return $row->rejected > 0 ? self::FAILURE : self::SUCCESS;
    }
}
