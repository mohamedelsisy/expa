<?php

namespace App\Domains\Jobs\Services;

use App\Support\Http\PublicHostGuard;
use Illuminate\Support\Facades\Http;
use Throwable;

/**
 * Checks ONE original application URL with plain HTTP requests (status + Location only; the body is never read or
 * stored). Verdicts:
 *   ok         the URL answers 2xx (possibly after redirects to a specific page)
 *   gone       clear 404/410
 *   generic    redirected to a generic careers/home page (the vacancy page no longer exists)
 *   unverified timeouts, 403/429, 5xx, other statuses, non-https, unsafe hosts: NOTHING may be concluded
 * Only `gone` and `generic` are evidence that a listing is dead, and even they are only evidence: the caller must see
 * them repeatedly before expiring anything (a WAF 404 or a login wall must not take a live vacancy down).
 * Every hop (the original URL and each redirect target) must pass PublicHostGuard: https, port 443, public addresses.
 */
class JobLinkVerifier
{
    public const MAX_HOPS = 4;

    /** A redirect to one of these (as a path segment) is a sign-in wall, not a missing vacancy. */
    private const AUTH_SEGMENTS = ['login', 'log-in', 'signin', 'sign-in', 'signup', 'sign-up', 'register', 'registrati', 'accedi', 'accesso', 'auth', 'authwall', 'sso', 'oauth', 'account', 'cookie', 'consent'];

    /** Single path segments that are a careers index/home rather than one vacancy. */
    private const GENERIC_SEGMENTS = ['jobs', 'job', 'careers', 'career', 'carriere', 'lavoro', 'lavora-con-noi', 'offerte', 'offerte-di-lavoro', 'posizioni-aperte', 'opportunita', 'opportunities', 'vacancies', 'openings', 'positions', 'search', 'work-with-us', 'join-us', 'join'];

    public function __construct(private readonly PublicHostGuard $guard) {}

    /** @return array{verdict:string,status:?int,final_url:?string,reason:string} */
    public function check(string $url): array
    {
        $current = $url;
        $status = null;
        for ($hop = 0; $hop <= self::MAX_HOPS; $hop++) {
            $addresses = $this->guard->publicAddresses($current);
            if ($addresses === null) {
                return $this->result('unverified', $status, $current, $hop === 0 ? 'not a plain https URL on a public host' : 'redirect left https/public hosts');
            }
            $options = ['allow_redirects' => false, 'stream' => true];
            if (defined('CURLOPT_RESOLVE')) {
                // Connect to the address we just vetted; the client must not resolve the name again (DNS rebinding).
                $options['curl'] = [CURLOPT_RESOLVE => [parse_url($current, PHP_URL_HOST).':443:'.$addresses[0]]];
            }
            try {
                $res = Http::withUserAgent((string) config('jobs.link_check.user_agent', 'EXPA-LinkCheck/1.0 (+https://github.com/mohamedelsisy/expa; one request per listing)'))
                    ->timeout((int) config('jobs.link_check.timeout', 15))->withOptions($options)
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
                if ($this->isAuthPath($next)) {
                    return $this->result('unverified', $status, $next, 'redirected to a sign-in page: nothing can be concluded');
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

    /** The home page, or a single non-locale segment that is a known careers/jobs index (e.g. /en/, /it/lavoro, /jobs). */
    public function isGenericPath(string $url): bool
    {
        $segments = $this->segments($url);
        if (count($segments) > 1) {
            return false;
        }

        return $segments === [] || in_array(strtolower($segments[0]), self::GENERIC_SEGMENTS, true);
    }

    public function isAuthPath(string $url): bool
    {
        foreach ($this->segments($url) as $segment) {
            if (in_array(strtolower($segment), self::AUTH_SEGMENTS, true)) {
                return true;
            }
        }

        return false;
    }

    /** @return list<string> path segments without a leading locale such as en, it, en-gb */
    private function segments(string $url): array
    {
        $segments = array_values(array_filter(explode('/', (string) parse_url($url, PHP_URL_PATH)), fn ($s) => $s !== ''));
        if ($segments && preg_match('/^[a-z]{2}([-_][a-z]{2})?$/i', $segments[0])) {
            array_shift($segments);
        }

        return $segments;
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
