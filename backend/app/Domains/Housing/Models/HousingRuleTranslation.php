<?php

namespace App\Domains\Housing\Models;

use App\Support\Audit\Auditable;
use Illuminate\Database\Eloquent\Model;

class HousingRuleTranslation extends Model
{
    use Auditable;

    public $timestamps = false;

    protected $guarded = ['id', 'housing_rule_id'];
}
