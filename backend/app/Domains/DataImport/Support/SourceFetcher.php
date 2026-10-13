<?php

namespace App\Domains\DataImport\Support;

use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use InvalidArgumentException;
use RuntimeException;

/**
 * Downloads a dataset from an official publisher: https only, host on the configured allow-list (also after
 * redirects), bounded size and time. The raw file is kept on the private disk with its SHA-256 so the run is
 * reproducible. A local file can be used instead (`fromFile`), e.g. when a publisher blocks scripted downloads.
 */
class SourceFetcher
{
    public function fetch(string $url, string $dataset, string $extension = 'csv'): FetchedSource
    {
        $this->assertAllowed($url);
        $max = (int) config('dataimport.max_bytes');

        $tmp = $this->tempPath($dataset);
        try {
            $res = Http::withUserAgent((string) config('dataimport.user_agent'))
                ->timeout((int) config('dataimport.timeout_seconds'))
                ->sink($tmp)   // stream to disk: large official dumps (tens of MB) must not be held in memory
                ->withOptions([
                    'allow_redirects' => ['max' => 3, 'protocols' => ['https'], 'on_redirect' => fn ($req, $resp, $uri) => $this->assertAllowed((string) $uri)],
                    'progress' => function ($total, $downloaded) use ($max) {
                        if ($downloaded > $max) {
                            throw new RuntimeException('Download larger than the allowed maximum.');
                        }
                    },
                ])->get($url);

            if (! $res->successful()) {
                throw new RuntimeException("Source answered HTTP {$res->status()} for $url");
            }

            return $this->adopt($tmp, $url, $dataset, $extension);
        } finally {
            if (is_file($tmp)) {
                @unlink($tmp);
            }
        }
    }

    public function fromFile(string $path, string $dataset): FetchedSource
    {
        if (! is_file($path) || ! is_readable($path)) {
            throw new InvalidArgumentException("File not readable: $path");
        }

        return $this->adopt($path, 'file://'.basename($path), $dataset, pathinfo($path, PATHINFO_EXTENSION) ?: 'dat');
    }

    public function assertAllowed(string $url): void
    {
        $p = parse_url($url);
        if (($p['scheme'] ?? '') !== 'https' || empty($p['host']) || isset($p['user']) || isset($p['pass'])) {
            throw new InvalidArgumentException('Only plain https URLs are allowed for data imports.');
        }
        $host = strtolower($p['host']);
        foreach ((array) config('dataimport.allowed_hosts') as $allowed) {
            if ($host === $allowed || str_ends_with($host, '.'.$allowed)) {
                return;
            }
        }
        throw new InvalidArgumentException("Host not on the data-import allow-list: $host");
    }

    private function tempPath(string $dataset): string
    {
        $dir = Storage::disk('local')->path(trim((string) config('dataimport.storage_dir'), '/').'/'.$dataset);
        if (! is_dir($dir)) {
            mkdir($dir, 0775, true);
        }

        return $dir.'/.part-'.bin2hex(random_bytes(6));
    }

    /** Verifies size, hashes the file from disk and keeps a dated, checksummed copy (the raw download stays auditable). */
    private function adopt(string $source, string $url, string $dataset, string $ext): FetchedSource
    {
        $bytes = (int) filesize($source);
        if ($bytes > (int) config('dataimport.max_bytes')) {
            throw new RuntimeException('Dataset larger than the allowed maximum.');
        }
        $sha = (string) hash_file('sha256', $source);
        $rel = trim((string) config('dataimport.storage_dir'), '/')."/$dataset/".now()->format('Ymd-His').'-'.substr($sha, 0, 12).'.'.preg_replace('/[^a-z0-9]/i', '', $ext);
        $dest = Storage::disk('local')->path($rel);
        if (! is_dir(dirname($dest))) {
            mkdir(dirname($dest), 0775, true);
        }
        if (! copy($source, $dest)) {
            throw new RuntimeException('Could not store the downloaded dataset.');
        }

        return new FetchedSource($dest, $sha, $bytes, CarbonImmutable::now(), $url);
    }
}
