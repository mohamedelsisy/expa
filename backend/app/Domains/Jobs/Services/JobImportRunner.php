<?php

namespace App\Domains\Jobs\Services;

use App\Domains\Jobs\Importers\JobImporter;
use App\Domains\Jobs\Importers\JsonFeedImporter;
use App\Domains\Jobs\Importers\RssImporter;
use App\Domains\Jobs\Models\JobImportRun;
use App\Domains\Jobs\Models\JobListing;
use App\Domains\Jobs\Models\JobSource;
use App\Domains\Search\Services\SearchIndexer;
use RuntimeException;
use Throwable;

/**
 * source → fetch → normalize → extract → classify → validate → dedupe → publish.
 * Guarantees: a failure while fetching/parsing changes NOTHING (items are only written after a successful fetch,
 * one transaction per job); one bad item never aborts the run; errors are recorded without raw content.
 */
class JobImportRunner
{
    public function __construct(
        private JobNormalizer $normalizer,
        private JobExtractor $extractor,
        private JobClassifier $classifier,
        private JobValidator $validator,
        private JobPublisher $publisher,
    ) {}

    public function importer(JobSource $source): JobImporter
    {
        return match ($source->driver) {
            'json_feed' => app(JsonFeedImporter::class),
            'rss' => app(RssImporter::class),
            default => throw new RuntimeException("Unknown job source driver [{$source->driver}]."),
        };
    }

    public function run(JobSource $source): JobImportRun
    {
        $run = new JobImportRun(['status' => 'running', 'started_at' => now()]);
        $run->job_source_id = $source->id;
        $run->save();

        try {
            $importer = $this->importer($source);
            $raw = $importer->fetch($source); // nothing below runs if this throws
        } catch (Throwable $e) {
            return $this->fail($source, $run, $e);
        }

        $counts = ['created' => 0, 'updated' => 0, 'unchanged' => 0, 'duplicate' => 0, 'invalid' => 0];
        $samples = [];
        $seen = [];

        foreach ($raw as $item) {
            try {
                $job = $this->normalizer->normalize($item, $source, $importer->defaultMap());
                $job = $this->extractor->extract($job);
                $job['category'] = $this->classifier->category($job);
                $job['city_id'] = $this->classifier->cityId($job['location_text'] ?? null);

                if ($reason = $this->validator->reject($job)) {
                    $counts['invalid']++;
                    if (count($samples) < 10) {
                        $samples[] = $reason;
                    }

                    continue;
                }
                $seen[] = $job['external_id'];
                $counts[$this->publisher->store($job, $source)]++;
            } catch (Throwable $e) {
                report($e);
                $counts['invalid']++;
                if (count($samples) < 10) {
                    $samples[] = 'processing_error';
                }
            }
        }

        $ok = $counts['created'] + $counts['updated'] + $counts['unchanged'] + $counts['duplicate'];
        $status = $counts['invalid'] === 0 ? 'success' : ($ok > 0 ? 'partial' : (count($raw) === 0 ? 'success' : 'failed'));

        $run->fill([
            'status' => $status, 'fetched' => count($raw), 'created' => $counts['created'], 'updated' => $counts['updated'],
            'unchanged' => $counts['unchanged'], 'duplicates' => $counts['duplicate'], 'invalid' => $counts['invalid'],
            'error_samples' => $samples ?: null, 'finished_at' => now(),
        ])->save();

        $source->forceFill(['last_run_at' => now(), 'last_status' => $status, 'consecutive_failures' => $status === 'failed' ? $source->consecutive_failures : 0])->save();

        return $run;
    }

    /** Fetch/parse failure: record it, touch nothing else. */
    private function fail(JobSource $source, JobImportRun $run, Throwable $e): JobImportRun
    {
        $run->fill([
            'status' => 'failed', 'finished_at' => now(),
            // Class + message of OUR exceptions only; never URLs/headers from config.
            'error_message' => mb_substr($e instanceof RuntimeException ? $e->getMessage() : 'Unexpected error: '.$e::class, 0, 500),
        ])->save();
        $source->forceFill(['last_run_at' => now(), 'last_status' => 'failed'])->save();
        report($e);

        return $run->refresh(); // pick up column defaults (counters = 0) so the object matches what is stored
    }

    /** Called when the queue gives up (final attempt): counts toward deactivation and alerts admins. */
    public function registerFailure(JobSource $source): void
    {
        $source->increment('consecutive_failures');
        $source->refresh();

        if ($source->consecutive_failures >= config('jobs.max_consecutive_failures')) {
            $source->forceFill(['active' => false])->save();
            app(JobAlertService::class)->sourceDisabled($source);
        }
    }

    /** Jobs past their explicit expiry, or older than the default lifetime without one, stop being listed. */
    public function expire(): int
    {
        $byDate = JobListing::where('status', 'published')->whereNotNull('expires_at')->where('expires_at', '<=', now())->update(['status' => 'expired']);
        $byAge = JobListing::where('status', 'published')->whereNull('expires_at')
            ->where('published_at', '<', now()->subDays(config('jobs.expire_after_days')))->update(['status' => 'expired']);

        app(SearchIndexer::class)->pruneJobs();

        return $byDate + $byAge;
    }
}
