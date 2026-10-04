<?php

namespace App\Domains\Jobs\Services;

use App\Domains\Jobs\Models\JobListing;
use App\Domains\Jobs\Models\JobSource;
use App\Domains\Search\Services\SearchIndexer;
use App\Support\Text\TextNormalizer;

class JobPublisher
{
    public function __construct(private TextNormalizer $n) {}

    public function hash(array $job): string
    {
        // Same company + title + place = the same vacancy, whatever the source or URL.
        return sha1(implode('|', [
            $this->n->normalize($job['company']), $this->n->normalize($job['title']),
            $this->n->normalize((string) ($job['location_text'] ?? '')),
        ]));
    }

    /** @return 'created'|'updated'|'unchanged'|'duplicate' */
    public function store(array $job, JobSource $source): string
    {
        $job['description'] = mb_substr($job['description'], 0, config('jobs.description_max_chars'));
        $dedupe = $this->hash($job);
        $content = sha1(json_encode([$job['title'], $job['company'], $job['description'], $job['apply_url'], $job['expires_at']?->toIso8601String(), $job['salary_min'], $job['salary_max']]));

        $existing = JobListing::where('job_source_id', $source->id)->where('external_id', $job['external_id'])->first();

        if (! $existing) {
            // Same vacancy already published by another source (or re-posted under a new id): keep the first, count the duplicate.
            if (JobListing::where('dedupe_hash', $dedupe)->where('status', '!=', 'expired')->exists()) {
                return 'duplicate';
            }
            $row = new JobListing($this->attributes($job));
            $row->job_source_id = $source->id;
            $row->external_id = $job['external_id'];
            $row->dedupe_hash = $dedupe;
            $row->content_hash = $content;
            $row->status = 'published';
            $row->save();
            app(SearchIndexer::class)->syncJob($row);

            return 'created';
        }

        if ($existing->content_hash === $content) {
            if ($existing->status === 'expired') { // reappeared in the feed
                $existing->update(['status' => 'published']);
                app(SearchIndexer::class)->syncJob($existing);

                return 'updated';
            }

            return 'unchanged';
        }

        $existing->fill($this->attributes($job));
        $existing->dedupe_hash = $dedupe;
        $existing->content_hash = $content;
        if ($existing->status === 'expired') {
            $existing->status = 'published';
        }
        $existing->save(); // 'hidden' (admin decision) is preserved
        app(SearchIndexer::class)->syncJob($existing);

        return 'updated';
    }

    private function attributes(array $j): array
    {
        return array_intersect_key($j, array_flip([
            'title', 'company', 'city_id', 'location_text', 'remote_mode', 'employment_type', 'category',
            'salary_min', 'salary_max', 'salary_currency', 'salary_period', 'italian_level', 'english_level',
            'experience_years', 'skills', 'description', 'apply_url', 'visa_sponsorship_stated', 'published_at', 'expires_at',
        ]));
    }
}
