<?php

namespace App\Domains\Money\Services;

use App\Domains\Money\Models\TaxTable;

/**
 * Generic, data-driven gross -> net formula: employee contribution % (optionally capped), a flat deduction, then
 * progressive brackets. It contains NO tax numbers of its own; everything comes from a published, sourced TaxTable.
 * An estimate for orientation only, never a payslip or tax advice.
 */
class NetSalaryEstimator
{
    /** @return array<string,mixed> */
    public function estimate(TaxTable $t, float $gross, int $months = 12): array
    {
        $contribBase = $t->contribution_ceiling !== null ? min($gross, (float) $t->contribution_ceiling) : $gross;
        $contributions = round($contribBase * (float) ($t->contribution_rate ?? 0) / 100, 2);
        $taxable = max(0.0, $gross - $contributions - (float) $t->deduction_flat);

        $tax = 0.0;
        $lower = 0.0;
        $lines = [];
        foreach ($t->brackets as $b) {
            $upper = $b['up_to'] === null ? INF : (float) $b['up_to'];
            $slice = max(0.0, min($taxable, $upper) - $lower);
            if ($slice > 0) {
                $amount = round($slice * (float) $b['rate'] / 100, 2);
                $tax += $amount;
                $lines[] = ['from' => $lower, 'to' => $b['up_to'] === null ? null : (float) $b['up_to'], 'rate' => (float) $b['rate'], 'taxable' => round($slice, 2), 'tax' => $amount];
            }
            $lower = $upper;
            if ($taxable <= $upper) {
                break;
            }
        }
        $tax = round($tax, 2);
        $net = round($gross - $contributions - $tax, 2);

        return [
            'gross_annual' => round($gross, 2),
            'contributions' => $contributions,
            'deduction' => (float) $t->deduction_flat,
            'taxable_income' => round($taxable, 2),
            'income_tax' => $tax,
            'brackets' => $lines,
            'net_annual' => $net,
            'months' => $months,
            'net_monthly' => round($net / $months, 2),
        ];
    }
}
