<?php

namespace App\Console\Commands;

use App\Domains\Jobs\Models\JobListing;
use App\Domains\Jobs\Services\JobLinkVerifier;
use App\Domains\Search\Services\SearchIndexer;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class JobsVerifyLinksCommand extends Command
{
    protected $signature = 'expa:jobs-verify-links
        {--dry-run : Report only, change nothing}
        {--id=* : Only these listing ids}
        {--delay=1 : Seconds to wait between URLs}';

    protected $description = 'Check each published listing\'s original application URL (one polite request each); expire listings whose page is clearly gone';

    public function handle(JobLinkVerifier $verifier): int
    {
        $listings = JobListing::where('status', 'published')->when($this->option('id'), fn ($q, $ids) => $q->whereIn('id', $ids))->orderBy('id')->get();
        $delay = max(0, (int) $this->option('delay'));
        $rows = [];
        $expired = 0;

        foreach ($listings as $i => $job) {
            $i > 0 && $delay > 0 && sleep($delay);
            $r = $verifier->check((string) $job->apply_url);
            $action = '-';
            if (in_array($r['verdict'], ['gone', 'generic'], true)) {
                // Only the status changes (same mechanism as expa:jobs-expire); the listing content is never edited.
                $action = $this->option('dry-run') ? 'would expire' : 'expired';
                if (! $this->option('dry-run')) {
                    $job->forceFill(['status' => 'expired'])->save();
                    $expired++;
                }
            }
            $rows[] = ['id' => $job->id, 'company' => $job->company, 'title' => mb_strimwidth($job->title, 0, 38, '…'), 'verdict' => $r['verdict'], 'http' => $r['status'], 'reason' => $r['reason'], 'action' => $action, 'final_url' => $r['final_url'], 'apply_url' => $job->apply_url];
        }
        if ($expired) {
            app(SearchIndexer::class)->pruneJobs();
        }

        $this->table(['id', 'company', 'title', 'verdict', 'http', 'reason', 'action'], array_map(fn ($r) => array_slice($r, 0, 2) + [2 => $r['title'], 3 => $r['verdict'], 4 => $r['http'], 5 => $r['reason'], 6 => $r['action']], $rows));
        $counts = array_count_values(array_column($rows, 'verdict'));
        $this->info('Checked '.count($rows).' listing(s): '.collect($counts)->map(fn ($n, $v) => "$v=$n")->implode(', ').". Expired $expired.");

        $report = ['checked_at' => now()->toIso8601String(), 'dry_run' => (bool) $this->option('dry-run'), 'results' => $rows];
        $path = 'jobs-verify/'.now()->format('Ymd-His').'.json';
        Storage::disk('local')->put($path, json_encode($report, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE));
        Log::info('jobs link verification', ['checked' => count($rows), 'verdicts' => $counts, 'expired' => $expired, 'report' => $path]);
        $this->line('Report: storage/app/private/'.$path);

        return self::SUCCESS;
    }
}
