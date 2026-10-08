<?php

namespace App\Console\Commands;

use App\Domains\Content\Services\ContentReadiness;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class VerifyContentSources extends Command
{
    protected $signature = 'expa:content-verify-sources';

    protected $description = 'Scheduled report: log published content whose source verification is stale or missing (no content is changed)';

    public function handle(ContentReadiness $readiness): int
    {
        $r = $readiness->report();
        $offenders = collect($r['types'])->filter(fn ($t) => $t['stale'] > 0 || $t['unverified'] > 0)
            ->mapWithKeys(fn ($t) => [$t['type'] => ['stale' => $t['stale'], 'unverified' => $t['unverified']]])->all();

        if ($offenders || $r['jobs']['active_without_legal_basis'] > 0) {
            Log::channel(config('logging.default'))->warning('content.sources_need_verification', ['types' => $offenders, 'jobs_active_without_legal_basis' => $r['jobs']['active_without_legal_basis']]);
            $this->warn('Sources needing re-verification: '.json_encode($offenders));
        } else {
            $this->info('All published sources are verified and fresh.');
        }

        return self::SUCCESS;
    }
}
