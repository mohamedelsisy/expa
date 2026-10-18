<?php

namespace App\Console\Commands;

use App\Domains\GovernmentImport\Services\IpaOfficesImporter;
use Illuminate\Console\Command;

class ImportIpaOfficesCommand extends Command
{
    protected $signature = 'expa:import:ipa-offices
        {--category=asl,questure,prefetture : Comma list of asl, questure, prefetture, comuni (comuni is opt-in: ~thousands of registry units)}
        {--file= : Local IPA "Unità Organizzative" CSV instead of downloading}
        {--enti-file= : Local IPA "Enti" CSV instead of downloading}
        {--istat-file= : Local ISTAT "Elenco comuni" CSV (semicolon, cp1252) instead of downloading}
        {--limit= : Process at most N records (testing; skips stale marking)}
        {--dry-run : Parse and validate, write nothing}';

    protected $description = 'Import public offices (Questure immigration offices, Prefetture, ASL; optionally municipal registry units) from IPA open data (AgID, CC BY 4.0)';

    public function handle(IpaOfficesImporter $importer): int
    {
        $categories = array_values(array_filter(array_map('trim', explode(',', (string) $this->option('category')))));
        try {
            $r = $importer->run($categories, (bool) $this->option('dry-run'), [
                'enti' => $this->option('enti-file') ?: null, 'uo' => $this->option('file') ?: null,
                'istat' => $this->option('istat-file') ?: null, 'limit' => $this->option('limit') ? (int) $this->option('limit') : null,
            ]);
        } catch (\Throwable $e) {
            $this->error('Import failed: '.$e->getMessage());

            return self::FAILURE;
        }

        $this->info(($this->option('dry-run') ? 'DRY RUN (nothing written) — ' : '').'IPA categories: '.implode(', ', $categories));
        $this->table(['category', 'candidates in source'], collect($r['per_category'])->map(fn ($n, $c) => [$c, $n])->values()->all());
        $c = $r['counts'];
        $this->table(['read', 'added', 'updated', 'unchanged', 'rejected', 'archived (gone from source)'], [[$c['read'], $c['added'], $c['updated'], $c['unchanged'], $c['rejected'], $c['stale']]]);
        foreach ($r['notes'] as $note) {
            $this->warn($note);
        }

        return self::SUCCESS;
    }
}
