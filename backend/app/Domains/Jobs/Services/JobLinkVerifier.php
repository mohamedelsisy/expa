<?php

namespace App\Domains\Jobs\Services;

use Illuminate\Support\Facades\Http;
use Throwable;

/**
 * Checks ONE original application URL with plain HTTP requests (status + Location only; the body is never read or
 * stored). Verdicts:
 *   ok         the URL answers 2xx (possibly after redirects to a specific page)
 *   gone       clear 404/410
 *   generic    redirected to a generic careers/home page (the vacancy page no longer exists)
 *   unverified timeouts, 403/429, 5xx, other statuses, non-https, unsafe hosts: NOTHING may be concluded
 * Only `gone` and `generic` justify expiring a listing.
 */
class JobLinkVerifier
{
    public const MAX_HOPS = 4;

    /** @return array{verdict:string,status:?int,final_url:?string,reason:string} */
    public function check(string $url): array
    {
        $current = $url;
        $status = null;
        for ($hop = 0; $hop <= self::MAX_HOPS; $hop++) {
            if (! $this->safe($current)) {
                return $this->result('unverified', $status, $current, $hop === 0 ? 'not a plain https URL on a public host' : 'redirect left https/public hosts');
            }
            try {
                $res = Http::withUserAgent((string) config('jobs.link_check.user_agent', 'EXPA-LinkCheck/1.0 (+https://github.com/mohamedelsisy/expa; one request per listing)'))
                    ->timeout((int) config('jobs.link_check.timeout', 15))->withOptions(['allow_redirects' => false, 'stream' => true])
                    ->withHeaders(['Accept' => 'text/html,application/xhtml+xml'])->get($current);
            } catch (Throwable $e) {
                return $this->result('unverified', $status, $current, 'network error: '.class_basename($e));
            }
            $status = $res->status();

            if (in_array($status, [301, 302, 303, 307, 308], true)) {
                $next = $this->resolve($current, (string) $res->header('Location'));
                if ($next === null) {
                    return $this->result('unverified', $status, $current, 'redirect without a usable Location');
                }
                if ($this->isGenericPath($next) && ! $this->isGenericPath($url)) {
                    return $this->result('generic', $status, $next, 'redirected to a generic careers/home page');
                }
                $current = $next;

                continue;
            }
            if ($status >= 200 && $status < 300) {
                return $this->result('ok', $status, $current, $current === $url ? 'resolves' : 'resolves after redirect');
            }
            if (in_array($status, [404, 410], true)) {
                return $this->result('gone', $status, $current, "HTTP $status");
            }

            return $this->result('unverified', $status, $current, "HTTP $status is not conclusive");
        }

        return $this->result('unverified', $status, $current, 'too many redirects');
    }

    /** Home page, or a single non-locale path segment (e.g. /en/, /it/lavoro, /jobs, a bare company board). */
    public function isGenericPath(string $url): bool
    {
        $segments = array_values(array_filter(explode('/', (string) parse_url($url, PHP_URL_PATH)), fn ($s) => $s !== ''));
        if ($segments && preg_match('/^[a-z]{2}([-_][a-z]{2})?$/i', $segments[0])) {
            array_shift($segments);
        }

        return count($segments) <= 1;
    }

    private function safe(string $url): bool
    {
        $p = parse_url($url);
        if (($p['scheme'] ?? '') !== 'https' || empty($p['host']) || isset($p['user']) || isset($p['pass'])) {
            return false;
        }
        $host = strtolower($p['host']);

        return ! filter_var($host, FILTER_VALIDATE_IP) && $host !== 'localhost' && str_contains($host, '.');
    }

    private function resolve(string $base, string $location): ?string
    {
        if ($location === '') {
            return null;
        }
        if (preg_match('#^https?://#i', $location)) {
            return $location;
        }
        $p = parse_url($base);
        $origin = "{$p['scheme']}://{$p['host']}";
        if (str_starts_with($location, '//')) {
            return "{$p['scheme']}:$location";
        }
        if (str_starts_with($location, '/')) {
            return $origin.$location;
        }

        return $origin.rtrim(dirname($p['path'] ?? '/'), '/').'/'.$location;
    }

    private function result(string $verdict, ?int $status, ?string $final, string $reason): array
    {
        return ['verdict' => $verdict, 'status' => $status, 'final_url' => $final, 'reason' => $reason];
    }
}
