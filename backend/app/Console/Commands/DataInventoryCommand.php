<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class DataInventoryCommand extends Command
{
    protected $signature = 'expa:data-inventory {--markdown : Output a Markdown table} {--empty : Only empty tables}';

    protected $description = 'Row count of every table, split into infrastructure and application tables';

    private const INFRA = ['cache', 'cache_locks', 'failed_jobs', 'job_batches', 'jobs', 'migrations', 'password_reset_tokens', 'personal_access_tokens', 'sessions', 'sqlite_sequence'];

    public function handle(): int
    {
        $rows = collect(Schema::getTables())->pluck('name')->reject(fn ($t) => str_starts_with($t, 'sqlite_'))->sort()->values()
            ->map(fn ($t) => [$t, in_array($t, self::INFRA, true) ? 'infrastructure' : 'application', DB::table($t)->count()])
            ->when($this->option('empty'), fn ($c) => $c->where(2, 0))->values();

        if ($this->option('markdown')) {
            $this->line('| Table | Kind | Rows |');
            $this->line('|---|---|---:|');
            $rows->each(fn ($r) => $this->line("| `{$r[0]}` | {$r[1]} | {$r[2]} |"));
        } else {
            $this->table(['table', 'kind', 'rows'], $rows->all());
        }
        $this->info($rows->count().' tables, '.$rows->where(2, '>', 0)->count().' with rows');

        return self::SUCCESS;
    }
}
