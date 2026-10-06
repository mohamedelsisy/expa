<?php

namespace App\Support;

use Illuminate\Http\Middleware\TrustProxies;

/**
 * Applies TRUSTED_PROXIES from CONFIG (BE-1). It must never be read with env() from bootstrap/app.php: once the config is
 * cached the .env file is not loaded and env() returns null, which silently trusted nobody behind a load balancer.
 */
class TrustedProxies
{
    /** @return list<string>|string|null */
    public static function parse(mixed $value): array|string|null
    {
        if (! is_string($value) || trim($value) === '') {
            return null;
        }
        if (trim($value) === '*') {
            return '*';
        }

        return array_values(array_filter(array_map('trim', explode(',', $value))));
    }

    public static function apply(mixed $value): void
    {
        $proxies = self::parse($value);
        if ($proxies !== null) {
            TrustProxies::at($proxies);
        }
    }
}
