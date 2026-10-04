<?php

namespace App\Domains\Government\Models;

use App\Support\Audit\Auditable;
use Illuminate\Database\Eloquent\Model;

class GovernmentOfficeTranslation extends Model
{
    use Auditable;

    public $timestamps = false;

    protected $guarded = ['id', 'government_office_id'];
}
