<?php

namespace App\Domains\Billing\Models;

use Illuminate\Database\Eloquent\Model;

class BillingEvent extends Model
{
    protected $guarded = ['id'];

    public $timestamps = false;

    protected function casts(): array
    {
        return ['processed_at' => 'datetime'];
    }
}
