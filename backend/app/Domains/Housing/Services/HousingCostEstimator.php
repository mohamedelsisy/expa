<?php

namespace App\Domains\Housing\Services;

/**
 * Monthly cost computed ONLY from numbers that are in the pasted text or that the user typed in. Nothing is estimated
 * from averages; every simplification is returned in `assumptions` so the user can see (and correct) it.
 */
class HousingCostEstimator
{
    public const EXTRA_FIELDS = ['rent_monthly', 'utilities_monthly', 'condo_fees_monthly', 'internet_monthly'];

    /**
     * @param  array<string,bool|float|null>  $s  extracted signals
     * @param  array<string,float|int|null>  $extra  user-provided numbers
     * @return array{currency:string,monthly_total:?float,components:list<array>,one_time:list<array>,assumptions:list<array{code:string,text:string}>}
     */
    public function estimate(array $s, array $extra = []): array
    {
        $components = [];
        $oneTime = [];
        $assumptions = [];
        $note = function (string $code) use (&$assumptions) {
            $assumptions[] = ['code' => $code, 'text' => __("housing.assumptions.$code")];
        };

        $rent = isset($extra['rent_monthly']) ? ['v' => (float) $extra['rent_monthly'], 'src' => 'user'] : (($s['rent_monthly'] ?? null) ? ['v' => (float) $s['rent_monthly'], 'src' => 'text'] : null);
        if ($rent) {
            $components[] = ['key' => 'rent', 'amount' => round($rent['v'], 2), 'source' => $rent['src']];
        } else {
            $note('rent_missing');
        }

        $included = ($s['utilities_included'] ?? false) === true;
        $condo = isset($extra['condo_fees_monthly']) ? ['v' => (float) $extra['condo_fees_monthly'], 'src' => 'user'] : (($s['expenses_monthly'] ?? null) ? ['v' => (float) $s['expenses_monthly'], 'src' => 'text'] : null);
        if ($included) {
            $note('utilities_included');
        } else {
            if ($condo) {
                $components[] = ['key' => 'condo_fees', 'amount' => round($condo['v'], 2), 'source' => $condo['src']];
                if ($condo['src'] === 'text') {
                    $note('expenses_assumed_monthly');
                }
            }
            if (isset($extra['utilities_monthly'])) {
                $components[] = ['key' => 'utilities', 'amount' => round((float) $extra['utilities_monthly'], 2), 'source' => 'user'];
            } else {
                $note(($s['utilities_excluded'] ?? false) ? 'utilities_not_counted_excluded' : 'utilities_not_counted_unknown');
            }
        }
        if (isset($extra['internet_monthly'])) {
            $components[] = ['key' => 'internet', 'amount' => round((float) $extra['internet_monthly'], 2), 'source' => 'user'];
        }

        // One-time amounts are shown separately and never mixed into the monthly figure.
        if (($s['deposit_amount'] ?? null) !== null) {
            $oneTime[] = ['key' => 'deposit', 'amount' => round((float) $s['deposit_amount'], 2), 'source' => 'text'];
        } elseif (($s['deposit_months'] ?? null) !== null && $rent) {
            $oneTime[] = ['key' => 'deposit', 'amount' => round($rent['v'] * (float) $s['deposit_months'], 2), 'source' => 'text', 'derived' => true];
            $note('deposit_from_months');
        }
        if (($s['agency_fee_amount'] ?? null) !== null) {
            $oneTime[] = ['key' => 'agency_fee', 'amount' => round((float) $s['agency_fee_amount'], 2), 'source' => 'text'];
        }

        return [
            'currency' => 'EUR',
            'monthly_total' => $rent ? round(array_sum(array_column($components, 'amount')), 2) : null,
            'components' => $components,
            'one_time' => $oneTime,
            'assumptions' => $assumptions,
        ];
    }
}
