<?php

namespace App\Console\Commands;

use App\Domains\DataImport\Support\ImportRun;
use App\Domains\DataImport\Support\SourceFetcher;
use App\Domains\Money\Support\TaxReferenceImporter;
use Illuminate\Console\Command;

class ImportTaxReferenceCommand extends Command
{
    protected $signature = 'expa:import:tax-reference
        {--file= : Alternative PHP definition file (default database/data/tax_reference.php)}
        {--dry-run : Validate and report, write nothing}
        {--verify-sources : Re-read the official HTML pages and check every quoted sentence is still there}';

    protected $description = 'Import IRPEF brackets, INPS employee contribution and the ordinary VAT rate from the reviewed, source-quoted definition file';

    public function handle(TaxReferenceImporter $importer, SourceFetcher $fetcher): int
    {
        $path = $this->option('file') ?: database_path('data/tax_reference.php');
        if (! is_file($path)) {
            $this->error("Definition file not found: $path");

            return self::FAILURE;
        }
        $def = require $path;

        $errors = $importer->validate($def);
        if ($this->option('verify-sources')) {
            $errors = [...$errors, ...$importer->verifySources($def, $fetcher)];
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
            'license' => $def['license'], 'attribution' => $def['attribution'], 'source_edition' => 'tax years '.collect($def['tables'])->pluck('tax_year')->sort()->implode(', '),
        ]);
        // last_verified_at: now when the quotes were just re-checked online, otherwise the date the reviewer read the pages.
        $importer->import($def, $run, (bool) $this->option('dry-run'), $this->option('verify-sources') ? now() : $importer->reviewedOn($def));
        $row = $run->finish();

        $this->table(['read', 'added', 'updated', 'unchanged', 'rejected', 'status'], [[$row->records_read, $row->added, $row->updated, $row->unchanged, $row->rejected, $row->status.($this->option('dry-run') ? ' (dry-run)' : '')]]);

        return $row->rejected > 0 ? self::FAILURE : self::SUCCESS;
    }
}
