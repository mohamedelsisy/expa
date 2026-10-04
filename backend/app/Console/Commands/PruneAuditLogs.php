<?php

namespace App\Console\Commands;

use App\Domains\Audit\Models\AuditLog;
use Illuminate\Console\Command;

class PruneAuditLogs extends Command
{
    protected $signature = 'expa:prune-audit-logs';

    protected $description = 'Delete audit logs older than the retention period (config privacy.retention.audit_logs_months)';

    public function handle(): int
    {
        $months = (int) config('privacy.retention.audit_logs_months');
        $deleted = AuditLog::query()->where('created_at', '<', now()->subMonths($months))->toBase()->delete();
        $this->info("Pruned $deleted audit log(s) older than $months months.");

        return self::SUCCESS;
    }
}
