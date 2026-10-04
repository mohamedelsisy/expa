<?php

namespace App\Domains\Jobs\Services;

use Illuminate\Support\Facades\Http;
use RuntimeException;

/**
 * Fetches admin-configured feed URLs defensively: https only, no credentials in the URL, no private/loopback
 * addresses (SSRF), bounded time and size, no redirects to other hosts.
 */
class SafeHttp
{
    public function get(string $url, array $headers = []): string
    {
        $this->assertSafe($url);

        $res = Http::withHeaders($headers + ['User-Agent' => config('jobs.http.user_agent')])
            ->timeout(config('jobs.http.timeout'))->withOptions(['allow_redirects' => false, 'stream' => false])->get($url);

        if ($res->status() >= 300 && $res->status() < 400) {
            throw new RuntimeException('Feed redirected; configure the final URL.');
        }
        if (! $res->successful()) {
            throw new RuntimeException('Feed returned HTTP '.$res->status());
        }
        $body = $res->body();
        if (strlen($body) > config('jobs.http.max_bytes')) {
            throw new RuntimeException('Feed larger than the allowed maximum.');
        }

        return $body;
    }

    public function assertSafe(string $url): void
    {
        $p = parse_url($url);
        if (! $p || ($p['scheme'] ?? '') !== 'https' || empty($p['host']) || isset($p['user']) || isset($p['pass'])) {
            throw new RuntimeException('Feed URL must be https without credentials.');
        }
        $host = strtolower($p['host']);
        if ($host === 'localhost' || str_ends_with($host, '.local') || str_ends_with($host, '.internal')) {
            throw new RuntimeException('Feed host is not allowed.');
        }

        $ips = filter_var($host, FILTER_VALIDATE_IP) ? [$host] : (config('jobs.ssrf_dns_check') ? (gethostbynamel($host) ?: []) : []);
        if (config('jobs.ssrf_dns_check') && ! $ips) {
            throw new RuntimeException('Feed host does not resolve.');
        }
        foreach ($ips as $ip) {
            if (! filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE)) {
                throw new RuntimeException('Feed host resolves to a private address.');
            }
        }
    }
}
