<?php

namespace App\Domains\Marketplace\Models;

use Illuminate\Database\Eloquent\Model;

class ProviderVerificationDocument extends Model
{
    protected $guarded = ['id', 'service_provider_id', 'storage_path'];

    protected $hidden = ['storage_path'];
}
