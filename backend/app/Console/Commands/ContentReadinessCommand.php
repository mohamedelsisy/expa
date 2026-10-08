<?php

namespace App\Console\Commands;

use App\Domains\Content\Services\ContentReadiness;
use Illuminate\Console\Command;

class ContentReadinessCommand extends Command
{
    protected $signature = 'expa:content-readiness {--json : Machine-readable output} {--strict : Exit non-zero when any type with published content is stale/unverified}';

    protected $description = 'Per content type counts: published / draft / review / stale / unverified (ops launch gate)';

    public function handle(ContentReadiness $readiness): int
    {
        $r = $readiness->report();
        if ($this->option('json')) {
            $this->line(json_encode($r, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));
        } else {
            $this->table(['type', 'published', 'draft', 'review', 'approved', 'archived', 'stale', 'unverified', 'ready'],
                array_map(fn ($t) => [$t['type'], $t['published'], $t['draft'], $t['review'], $t['approved'], $t['archived'], $t['stale'], $t['unverified'], $t['ready'] ? 'yes' : 'no'], $r['types']));
            $this->info('Jobs: '.json_encode($r['jobs']));
        }

        $bad = $r['totals']['stale'] + $r['totals']['unverified'] + $r['jobs']['active_without_legal_basis'];

        return $this->option('strict') && $bad > 0 ? self::FAILURE : self::SUCCESS;
    }
}
