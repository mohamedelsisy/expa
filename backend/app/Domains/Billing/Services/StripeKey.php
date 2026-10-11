<?php

namespace App\Domains\Billing\Services;

/**
 * Classifies a Stripe API key by its documented prefix (https://docs.stripe.com/keys): secret `sk_` and restricted `rk_` keys,
 * `test` or `live`. The key itself is never returned, logged or printed by this class.
 */
final class StripeKey
{
    /** @return 'test'|'live'|null  null = missing or malformed */
    public static function mode(?string $key): ?string
    {
        if ($key !== null && preg_match('/^(?:sk|rk)_(test|live)_[A-Za-z0-9]{8,}$/', $key, $m)) {
            return $m[1];
        }

        return null;
    }

    /** Operator-facing reason the key must not be used in the current environment, or null when it is acceptable. */
    public static function refusal(?string $key): ?string
    {
        $mode = self::mode($key);
        if ($mode === null) {
            return 'STRIPE_SECRET_KEY is missing or malformed (expected sk_test_… or sk_live_…, or a restricted rk_… key).';
        }
        if ($mode === 'live' && ! app()->isProduction()) {
            return 'A LIVE Stripe key is configured but APP_ENV is not production; refusing to use it. Use a test-mode key (sk_test_…) here.';
        }

        return null;
    }
}
