<?php

namespace App\Domains\Travel\Models;

use App\Support\Audit\Auditable;
use Illuminate\Database\Eloquent\Model;

class TravelRequirementTranslation extends Model
{
    use Auditable;

    public $timestamps = false;

    protected $guarded = ['id', 'travel_requirement_id'];
}
