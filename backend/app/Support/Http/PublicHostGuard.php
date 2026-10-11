<?php

namespace App\Support\Http;

use Closure;

/**
 * SSRF guard for requests to URLs we do not control (job application pages, and every redirect they send us to).
 * A URL is acceptable only if it is plain https on port 443 and EVERY address its host resolves to is public:
 * loopback, private, link-local and reserved ranges are refused, as are IP literals in any notation (127.1, 0x7f.1,
 * 2130706433) and internal-looking names. The vetted addresses are returned so the caller can pin the connection to
 * one of them (CURLOPT_RESOLVE) instead of letting the HTTP client resolve the name a second time (DNS rebinding).
 */
class PublicHostGuard
{
    private const INTERNAL_SUFFIXES = ['.localhost', '.local', '.internal', '.lan', '.home', '.corp', '.intranet', '.localdomain', '.home.arpa'];

    /** @param Closure(string):list<string>|null $resolver host => list of IPv4/IPv6 addresses; injectable for tests */
    public function __construct(private readonly ?Closure $resolver = null) {}

    /** @return list<string>|null the public addresses to connect to, or null when the URL must not be requested */
    public function publicAddresses(string $url): ?array
    {
        $p = parse_url($url);
        if (! is_array($p) || ($p['scheme'] ?? '') !== 'https' || empty($p['host']) || isset($p['user']) || isset($p['pass'])) {
            return null;
        }
        if (isset($p['port']) && (int) $p['port'] !== 443) {
            return null;
        }
        $host = strtolower(rtrim($p['host'], '.'));
        if (! $this->looksLikePublicName($host)) {
            return null;
        }

        $ips = array_values(array_unique(($this->resolver ?? $this->lookup(...))($host)));
        if ($ips === []) {
            return null; // cannot resolve: nothing may be concluded, nothing is requested
        }
        foreach ($ips as $ip) {
            if (filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE) === false) {
                return null;
            }
        }

        // IPv4 first: it is what curl pins most reliably.
        usort($ips, fn ($a, $b) => (int) str_contains($a, ':') <=> (int) str_contains($b, ':'));

        return $ips;
    }

    private function looksLikePublicName(string $host): bool
    {
        if ($host === 'localhost' || ! str_contains($host, '.') || str_contains($host, ':') || str_contains($host, '[')) {
            return false;
        }
        $labels = explode('.', $host);
        $tld = end($labels);
        // 127.1, 10.0.0.1, 2130706433.1, 0x7f.0.0.1: a purely numeric/hex final label is never a real TLD.
        if (preg_match('/^(\d+|0x[0-9a-f]*)$/i', $tld)) {
            return false;
        }
        foreach (self::INTERNAL_SUFFIXES as $suffix) {
            if (str_ends_with($host, $suffix)) {
                return false;
            }
        }

        return (bool) preg_match('/^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/', $host);
    }

    /** @return list<string> */
    private function lookup(string $host): array
    {
        $ips = [];
        foreach (@dns_get_record($host, DNS_A) ?: [] as $r) {
            isset($r['ip']) && $ips[] = $r['ip'];
        }
        foreach (@dns_get_record($host, DNS_AAAA) ?: [] as $r) {
            isset($r['ipv6']) && $ips[] = $r['ipv6'];
        }
        if ($ips === []) {
            $ips = @gethostbynamel($host) ?: [];
        }

        return $ips;
    }
}
