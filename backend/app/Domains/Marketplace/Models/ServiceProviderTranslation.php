<?php

namespace App\Domains\Marketplace\Models;

use Illuminate\Database\Eloquent\Model;

class ServiceProviderTranslation extends Model
{
    public $timestamps = false;

    protected $guarded = ['id', 'service_provider_id'];
}
