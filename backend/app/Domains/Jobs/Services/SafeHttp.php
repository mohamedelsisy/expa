<?php

namespace App\Domains\Jobs\Services;

use Illuminate\Support\Facades\Http;
use RuntimeException;

/**
 * Fetches admin-configured feed URLs defensively: https only, no credentials in the URL, no private/loopback/
 * link-local/CGNAT addresses (IPv4 and IPv6), the vetted IP is pinned for the connection (no DNS rebinding between
 * check and use), no redirects, bounded time and size.
 */
class SafeHttp
{
    public function get(string $url, array $headers = []): string
    {
        $ips = $this->assertSafe($url);
        $max = (int) config('jobs.http.max_bytes');

        $options = [
            'allow_redirects' => false,
            // Reject oversized bodies as soon as the headers arrive, before downloading them.
            // ...and abort a chunked body that has no Content-Length once it passes the cap, instead of buffering it all.
            'progress' => function ($downloadTotal, $downloaded) use ($max) {
                if ($downloaded > $max) {
                    throw new RuntimeException('Feed larger than the allowed maximum.');
                }
            },
            'on_headers' => function ($response) use ($max) {
                if ((int) $response->getHeaderLine('Content-Length') > $max) {
                    throw new RuntimeException('Feed larger than the allowed maximum.');
                }
            },
        ];
        if ($ips) { // pin the address we validated: the client must not resolve the name again
            $p = parse_url($url);
            $options['curl'] = [CURLOPT_RESOLVE => [($p['host']).':'.($p['port'] ?? 443).':'.implode(',', array_map(fn ($i) => str_contains($i, ':') ? "[$i]" : $i, $ips))]];
        }

        $res = Http::withHeaders($headers + ['User-Agent' => config('jobs.http.user_agent')])
            ->timeout(config('jobs.http.timeout'))->withOptions($options)->get($url);

        if ($res->status() >= 300 && $res->status() < 400) {
            throw new RuntimeException('Feed redirected; configure the final URL.');
        }
        if (! $res->successful()) {
            throw new RuntimeException('Feed returned HTTP '.$res->status());
        }
        $body = $res->body();
        if (strlen($body) > $max) {
            throw new RuntimeException('Feed larger than the allowed maximum.');
        }

        return $body;
    }

    /** @return list<string> the vetted IP addresses (empty when the DNS check is disabled) */
    public function assertSafe(string $url): array
    {
        $p = parse_url($url);
        if (! $p || ($p['scheme'] ?? '') !== 'https' || empty($p['host']) || isset($p['user']) || isset($p['pass'])) {
            throw new RuntimeException('Feed URL must be https without credentials.');
        }
        $host = strtolower(trim($p['host'], '[]'));
        if ($host === 'localhost' || str_ends_with($host, '.local') || str_ends_with($host, '.internal') || str_ends_with($host, '.localhost')) {
            throw new RuntimeException('Feed host is not allowed.');
        }

        $isIp = (bool) filter_var($host, FILTER_VALIDATE_IP);
        $ips = $isIp ? [$host] : (config('jobs.ssrf_dns_check') ? $this->resolve($host) : []);
        if (config('jobs.ssrf_dns_check') && ! $ips) {
            throw new RuntimeException('Feed host does not resolve.');
        }
        foreach ($ips as $ip) {
            if (! $this->isPublic($ip)) {
                throw new RuntimeException('Feed host resolves to a non-public address.');
            }
        }

        return $ips;
    }

    /** @return list<string> A and AAAA records */
    private function resolve(string $host): array
    {
        $ips = [];
        foreach (@dns_get_record($host, DNS_A | DNS_AAAA) ?: [] as $r) {
            $ips[] = $r['ip'] ?? $r['ipv6'] ?? null;
        }

        return array_values(array_filter($ips));
    }

    private function isPublic(string $ip): bool
    {
        if (! filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE)) {
            return false;
        }
        if (filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_IPV4)) {
            $n = ip2long($ip);

            // 100.64.0.0/10 carrier-grade NAT (includes cloud metadata addresses such as 100.100.100.200)
            return ! (($n & 0xFFC00000) === ip2long('100.64.0.0'));
        }
        // IPv4-mapped IPv6 (::ffff:a.b.c.d) must be judged by the embedded IPv4 address
        if (preg_match('/^::ffff:(\d+\.\d+\.\d+\.\d+)$/i', $ip, $m)) {
            return $this->isPublic($m[1]);
        }

        // NAT64 (64:ff9b::/96), 6to4 (2002::/16) and Teredo (2001::/32) embed IPv4 addresses: never accepted as public (BE-25)
        $bin = inet_pton($ip);
        if ($bin !== false && (str_starts_with($bin, hex2bin('0064ff9b').str_repeat("\0", 8)) || str_starts_with($bin, hex2bin('2002')) || str_starts_with($bin, hex2bin('20010000')))) {
            return false;
        }

        return true;
    }
}
