<?php

namespace App\Domains\Billing\Services;

use App\Domains\Billing\Models\Plan;
use App\Domains\Billing\Models\TaxRate;

/**
 * VAT architecture. Nothing here knows a tax rate: it is resolved from configuration only.
 *   1. `plans.vat_rate` (explicit per-plan rate, set by an admin) wins;
 *   2. otherwise a VERIFIED row of `tax_rates` for the invoice country (BILLING_TAX_COUNTRY);
 *   3. otherwise no tax is computed and the invoice shows no tax lines.
 * `payments.amount_minor` is always what the provider charged (gross). With `price_includes_vat` the net amount is derived
 * from the gross; without it the net is the plan price and the tax is the difference.
 */
class TaxCalculator
{
    /** @return array{rate:string,net_minor:int,tax_minor:int,country:?string}|null */
    public function breakdown(?Plan $plan, int $grossMinor, ?string $country = null): ?array
    {
        $country ??= config('billing.tax.country');
        $rate = $plan?->vat_rate;
        if ($rate === null && $country) {
            $rate = TaxRate::where('country', strtoupper($country))->whereNotNull('verified_at')
                ->where(fn ($q) => $q->whereNull('valid_from')->orWhere('valid_from', '<=', now()->toDateString()))
                ->orderByDesc('valid_from')->value('rate');
        }
        if ($rate === null || (float) $rate <= 0) {
            return null;
        }

        if ($plan && ! $plan->price_includes_vat && $plan->price_minor > 0 && $plan->price_minor <= $grossMinor) {
            $net = $plan->price_minor;
        } else {
            $net = (int) round($grossMinor / (1 + ((float) $rate) / 100));
        }

        return ['rate' => number_format((float) $rate, 2, '.', ''), 'net_minor' => $net, 'tax_minor' => $grossMinor - $net, 'country' => $country ? strtoupper($country) : null];
    }
}
