<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Throwable;

/**
 * Runs every real-data importer in dependency order (geography first: offices and universities attach to cities by
 * ISTAT code). One failing importer never stops the others; the exit code is non-zero if any failed. Each importer
 * records its own run in data_import_runs (`php artisan expa:import-runs`).
 */
class ImportAllCommand extends Command
{
    protected $signature = 'expa:import:all
        {--dry-run : Validate and report for every importer, write nothing}
        {--only= : Comma-separated subset: istat-comuni,study,ipa-offices,appointment-guides,tax-reference,patente-categories}
        {--with-jobs-check : Also verify the original URLs of curated job listings (one polite request each)}';

    protected $description = 'Run all official-source importers (ISTAT, MUR, IPA, tax, Patente categories, appointment guides)';

    /** @var array<string,string> */
    private const ORDER = [
        'istat-comuni' => 'expa:import:istat-comuni',
        'study' => 'expa:import:study',
        'ipa-offices' => 'expa:import:ipa-offices',
        'appointment-guides' => 'expa:import:appointment-guides',
        'tax-reference' => 'expa:import:tax-reference',
        'patente-categories' => 'expa:import:patente-categories',
    ];

    public function handle(): int
    {
        $only = array_filter(array_map('trim', explode(',', (string) $this->option('only'))));
        $unknown = array_diff($only, array_keys(self::ORDER));
        if ($unknown) {
            $this->error('Unknown importer(s): '.implode(', ', $unknown));

            return self::INVALID;
        }

        $results = [];
        foreach (self::ORDER as $key => $command) {
            if ($only && ! in_array($key, $only, true)) {
                continue;
            }
            $this->newLine();
            $this->info("== $key ($command)");
            $results[$key] = $this->runOne($command, $this->option('dry-run') ? ['--dry-run' => true] : []);
        }
        if ($this->option('with-jobs-check') && ! $only) {
            $this->newLine();
            $this->info('== jobs-verify-links');
            $results['jobs-verify-links'] = $this->runOne('expa:jobs-verify-links', $this->option('dry-run') ? ['--dry-run' => true] : []);
        }

        $this->newLine();
        $this->table(['importer', 'result'], collect($results)->map(fn ($ok, $k) => [$k, $ok ? 'ok' : 'FAILED'])->values()->all());

        return in_array(false, $results, true) ? self::FAILURE : self::SUCCESS;
    }

    private function runOne(string $command, array $args): bool
    {
        try {
            return $this->call($command, $args) === self::SUCCESS;
        } catch (Throwable $e) {
            $this->error($e->getMessage());
            report($e);

            return false;
        }
    }
}
