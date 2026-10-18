<?php

namespace App\Console\Commands;

use App\Domains\GovernmentImport\Services\AppointmentGuidesImporter;
use Illuminate\Console\Command;

class ImportAppointmentGuidesCommand extends Command
{
    protected $signature = 'expa:import:appointment-guides {--dry-run : Validate and report, write nothing}';

    protected $description = 'Seed the authored appointment guides for official booking channels (idempotent by source_id; published locally, review elsewhere)';

    public function handle(AppointmentGuidesImporter $importer): int
    {
        $r = $importer->run((bool) $this->option('dry-run'));
        $c = $r['counts'];
        $this->table(['read', 'added', 'updated', 'unchanged', 'rejected'], [[$c['read'], $c['added'], $c['updated'], $c['unchanged'], $c['rejected']]]);
        foreach ($r['problems'] as $p) {
            $this->error($p);
        }

        return $c['rejected'] > 0 ? self::FAILURE : self::SUCCESS;
    }
}
