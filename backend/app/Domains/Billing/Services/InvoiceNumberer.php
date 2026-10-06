<?php

namespace App\Domains\Billing\Services;

use Illuminate\Support\Facades\DB;

/**
 * Sequential, gap-free numbering per calendar year: EXPA-2026-000001. The counter row is locked for the duration of the
 * surrounding transaction (the caller creates the invoice in the same transaction), so a rolled-back invoice does not
 * consume a number and two concurrent payments never receive the same one.
 */
class InvoiceNumberer
{
    public function next(?int $year = null): string
    {
        $year ??= (int) now()->format('Y');

        return DB::transaction(function () use ($year) {
            DB::table('invoice_sequences')->insertOrIgnore(['year' => $year, 'last_number' => 0]);
            $row = DB::table('invoice_sequences')->where('year', $year)->lockForUpdate()->first();
            $n = (int) $row->last_number + 1;
            DB::table('invoice_sequences')->where('year', $year)->update(['last_number' => $n]);

            return sprintf('%s-%d-%06d', config('billing.invoice_prefix'), $year, $n);
        });
    }
}
