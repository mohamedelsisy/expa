<?php

namespace App\Http\Controllers\Api\V1;

use App\Domains\Money\Models\TaxTable;
use App\Domains\Money\Services\NetSalaryEstimator;
use App\Http\Controllers\Controller;
use App\Support\ApiResponse;
use Illuminate\Http\Request;

class MoneyController extends Controller
{
    /**
     * Gross -> net estimate. Stateless (nothing stored). Without a published, sourced tax table for the year it answers
     * honestly that the estimate is not available instead of guessing numbers.
     */
    public function netSalary(Request $request, NetSalaryEstimator $estimator)
    {
        $data = $request->validate([
            'gross_annual' => ['required', 'numeric', 'min:0', 'max:10000000'],
            'months' => ['sometimes', 'integer', 'in:12,13,14'],
            'tax_year' => ['sometimes', 'integer', 'min:2000', 'max:2100'],
        ]);

        $table = TaxTable::currentFor($data['tax_year'] ?? null);
        if (! $table) {
            return ApiResponse::data([
                'available' => false,
                'reason' => 'tables_not_published',
                'message' => __('money.not_available'),
            ]);
        }

        return ApiResponse::data([
            'available' => true,
            'tax_year' => $table->tax_year,
            'estimate' => $estimator->estimate($table, (float) $data['gross_annual'], (int) ($data['months'] ?? 12)),
            'table' => ['name' => $table->localized('name'), 'source' => $table->sourcePayload()],
            'disclaimer' => __('money.disclaimer'),
        ]);
    }
}
