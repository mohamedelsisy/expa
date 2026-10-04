<?php

namespace App\Domains\Study\Models;

use App\Support\Audit\Auditable;
use Illuminate\Database\Eloquent\Model;

class UniversityTranslation extends Model
{
    use Auditable;

    public $timestamps = false;

    protected $guarded = ['id', 'university_id'];
}
