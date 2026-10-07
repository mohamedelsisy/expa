<?php

namespace App\Domains\Money\Models;

use App\Support\Audit\Auditable;
use Illuminate\Database\Eloquent\Model;

class TaxTableTranslation extends Model
{
    use Auditable;

    public $timestamps = false;

    protected $guarded = ['id', 'tax_table_id'];
}
