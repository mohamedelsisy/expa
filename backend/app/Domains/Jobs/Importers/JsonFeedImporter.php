<?php

namespace App\Domains\Jobs\Importers;

use App\Domains\Jobs\Models\JobSource;
use App\Domains\Jobs\Services\SafeHttp;
use Illuminate\Support\Arr;
use RuntimeException;

class JsonFeedImporter implements JobImporter
{
    public function __construct(private SafeHttp $http) {}

    public function fetch(JobSource $source): array
    {
        $cfg = $source->config ?? [];
        $json = json_decode($this->http->get($cfg['url'] ?? '', $cfg['headers'] ?? []), true);
        if (! is_array($json)) {
            throw new RuntimeException('Feed is not valid JSON.');
        }

        $items = ($path = $cfg['items_path'] ?? null) ? Arr::get($json, $path) : $json;
        if (! is_array($items) || ! array_is_list($items)) {
            throw new RuntimeException('Feed items not found at the configured path.');
        }

        return array_slice(array_values(array_filter($items, 'is_array')), 0, config('jobs.max_items_per_run'));
    }

    public function defaultMap(): array
    {
        return [
            'external_id' => 'id', 'title' => 'title', 'company' => 'company', 'location_text' => 'location',
            'description' => 'description', 'apply_url' => 'url', 'published_at' => 'published_at', 'expires_at' => 'expires_at',
            'employment_type' => 'employment_type', 'remote_mode' => 'remote',
            'salary_min' => 'salary_min', 'salary_max' => 'salary_max', 'salary_currency' => 'salary_currency', 'salary_period' => 'salary_period',
            'visa_sponsorship' => 'visa_sponsorship',
        ];
    }
}
