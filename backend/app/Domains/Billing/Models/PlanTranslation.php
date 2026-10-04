<?php

namespace App\Domains\Billing\Models;

use Illuminate\Database\Eloquent\Model;

class PlanTranslation extends Model
{
    public $timestamps = false;

    protected $guarded = ['id', 'plan_id'];
}
