<?php

namespace App\Domains\Marketplace\Models;

use App\Domains\Content\Concerns\HasTranslations;
use Illuminate\Database\Eloquent\Model;

class ProviderService extends Model
{
    use HasTranslations;

    protected $guarded = ['id', 'service_provider_id'];

    protected array $translatable = ['name', 'description'];
}
