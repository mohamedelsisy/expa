<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Defensive headers for a JSON API. The API never serves HTML, so the CSP forbids everything; responses to
 * authenticated requests are never cacheable by shared caches or the browser unless a route explicitly opts in.
 */
class SecurityHeaders
{
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);
        $h = $response->headers;

        $h->set('X-Content-Type-Options', 'nosniff');
        $h->set('X-Frame-Options', 'DENY');
        $h->set('Referrer-Policy', 'no-referrer');
        $h->set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()');
        $h->set('Cross-Origin-Resource-Policy', 'same-site');
        if (! $h->has('Content-Security-Policy')) {
            $h->set('Content-Security-Policy', "default-src 'none'; frame-ancestors 'none'");
        }
        if ($request->isSecure() || app()->isProduction()) {
            $h->set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
        }

        // Personal data must not be stored by caches. Public endpoints that set their own `public` policy keep it.
        $cache = (string) $h->get('Cache-Control', '');
        $explicitlyPublic = str_contains($cache, 'public');
        if (! $explicitlyPublic && ($request->bearerToken() || $request->user('sanctum'))) {
            $h->set('Cache-Control', 'no-store, private');
        } elseif (! $explicitlyPublic && ! $h->has('Cache-Control')) {
            $h->set('Cache-Control', 'no-cache, private');
        }

        return $response;
    }
}
