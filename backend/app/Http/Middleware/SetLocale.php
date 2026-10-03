<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SetLocale
{
    public function handle(Request $request, Closure $next): Response
    {
        $locale = $this->resolve($request);
        app()->setLocale($locale);

        $response = $next($request);
        $response->headers->set('Content-Language', $locale);
        $response->headers->set('Vary', 'Accept-Language');

        return $response;
    }

    private function resolve(Request $request): string
    {
        $supported = array_keys(config('expa.locales'));

        $explicit = $request->query('lang');
        if (is_string($explicit) && in_array($explicit, $supported, true)) {
            return $explicit;
        }

        // Honour Accept-Language by quality, first supported primary subtag wins.
        $header = (string) $request->header('Accept-Language', '');
        $candidates = [];
        foreach (explode(',', $header) as $i => $part) {
            [$tag, $q] = array_pad(explode(';q=', trim($part), 2), 2, '1');
            $primary = strtolower(substr(trim($tag), 0, 2));
            if (in_array($primary, $supported, true)) {
                $candidates[] = [(float) $q, -$i, $primary];
            }
        }
        if ($candidates !== []) {
            rsort($candidates);

            return $candidates[0][2];
        }

        return config('expa.default_locale');
    }
}
