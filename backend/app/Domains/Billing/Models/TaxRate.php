<?php

namespace App\Domains\Billing\Models;

use Illuminate\Database\Eloquent\Model;

/** Per-country VAT rate. The table ships EMPTY: a rate is applied only after a human entered and verified it. */
class TaxRate extends Model
{
    protected $guarded = ['id'];

    protected function casts(): array
    {
        return ['rate' => 'decimal:2', 'valid_from' => 'date', 'verified_at' => 'datetime'];
    }
}
