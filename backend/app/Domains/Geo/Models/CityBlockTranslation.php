<?php

namespace App\Domains\Geo\Models;

use Illuminate\Database\Eloquent\Model;

class CityBlockTranslation extends Model
{
    public $timestamps = false;

    protected $guarded = ['id', 'city_block_id'];
}
