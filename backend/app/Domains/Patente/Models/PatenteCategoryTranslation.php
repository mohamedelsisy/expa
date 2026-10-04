<?php

namespace App\Domains\Patente\Models;

use App\Support\Audit\Auditable;
use Illuminate\Database\Eloquent\Model;

class PatenteCategoryTranslation extends Model
{
    use Auditable;

    public $timestamps = false;

    protected $guarded = ['id', 'patente_category_id'];
}
