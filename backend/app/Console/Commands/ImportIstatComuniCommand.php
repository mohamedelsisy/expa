<?php

namespace App\Console\Commands;

use App\Domains\GeoImport\Services\IstatComuniImporter;
use Illuminate\Console\Command;

class ImportIstatComuniCommand extends Command
{
    protected $signature = 'expa:import:istat-comuni
        {--file= : Local ISTAT "Elenco comuni" XLSX instead of downloading}
        {--all : Import every comune (~7,900) instead of province capitals only}
        {--limit= : Process at most N municipalities (testing)}
        {--dry-run : Parse and validate, write nothing}';

    protected $description = 'Import ISTAT municipalities (province capitals by default) into cities + regions.istat_code';

    public function handle(IstatComuniImporter $importer): int
    {
        try {
            $r = $importer->run($this->option('file') ?: null, (bool) $this->option('all'), (bool) $this->option('dry-run'), $this->option('limit') ? (int) $this->option('limit') : null);
        } catch (\Throwable $e) {
            $this->error('Import failed: '.$e->getMessage());

            return self::FAILURE;
        }

        $this->info(($this->option('dry-run') ? 'DRY RUN (nothing written) — ' : '').'ISTAT edition '.($r['edition'] ?? 'unknown').', scope '.($this->option('all') ? 'all comuni' : 'province capitals').' (counts include the 20 regions)');
        $this->table(['read', 'added', 'updated', 'unchanged', 'rejected'], [[$r['counts']['read'], $r['counts']['added'], $r['counts']['updated'], $r['counts']['unchanged'], $r['counts']['rejected']]]);
        foreach ($r['notes'] as $note) {
            $this->warn($note);
        }

        return self::SUCCESS;
    }
}
