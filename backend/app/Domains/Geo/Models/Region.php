<?php

namespace App\Domains\Geo\Models;

use App\Domains\Content\Concerns\HasTranslations;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Region extends Model
{
    use HasTranslations;

    protected $guarded = [];

    protected array $translatable = ['name'];

    public function cities(): HasMany
    {
        return $this->hasMany(City::class);
    }
}
