<?php

namespace App\Domains\Geo\Models;

use App\Domains\Content\Concerns\HasTranslations;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class City extends Model
{
    use HasTranslations;

    protected $guarded = [];

    protected array $translatable = ['name'];

    public function region(): BelongsTo
    {
        return $this->belongsTo(Region::class);
    }
}
