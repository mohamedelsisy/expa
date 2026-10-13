<?php

namespace App\Domains\DataImport\Support;

use Illuminate\Console\Events\CommandFinished;
use Illuminate\Support\Facades\Artisan;

/**
 * Importers write rows directly (no ContentChanged event), so after a successful real import the search and AI indexes
 * are rebuilt — but only where imported content is published immediately (local/testing). Elsewhere the content is in
 * review and is indexed by the normal publish workflow when someone approves it.
 */
class ReindexAfterImport
{
    public function handle(CommandFinished $event): void
    {
        if (! self::shouldReindex((string) $event->command, $event->input->hasParameterOption('--dry-run'), $event->exitCode)) {
            return;
        }
        Artisan::call('expa:search-reindex');
        Artisan::call('expa:ai-reindex');
    }

    public static function shouldReindex(string $command, bool $dryRun, int $exitCode): bool
    {
        return $exitCode === 0
            && ! $dryRun
            && str_starts_with($command, 'expa:import:')
            && Lifecycle::isLocalPublish();
    }
}
