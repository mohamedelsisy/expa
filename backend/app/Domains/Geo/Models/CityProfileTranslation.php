<?php

namespace App\Domains\Geo\Models;

use Illuminate\Database\Eloquent\Model;

class CityProfileTranslation extends Model
{
    public $timestamps = false;

    protected $guarded = ['id', 'city_profile_id'];
}
