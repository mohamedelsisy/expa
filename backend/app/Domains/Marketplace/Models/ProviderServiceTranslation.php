<?php

namespace App\Domains\Marketplace\Models;

use Illuminate\Database\Eloquent\Model;

class ProviderServiceTranslation extends Model
{
    public $timestamps = false;

    protected $guarded = ['id', 'provider_service_id'];
}
