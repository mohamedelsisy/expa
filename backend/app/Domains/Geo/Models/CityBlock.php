<?php

namespace App\Domains\Geo\Models;

use App\Domains\Content\Concerns\HasSource;
use App\Domains\Content\Concerns\HasTranslations;
use App\Domains\Geo\Enums\CityBlockKey;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * A content block of a city landing page. `official_info` blocks must carry a complete, valid source
 * (checked by CityProfile::extraPublishProblems); `general_guidance` blocks are labelled as such by the API.
 */
class CityBlock extends Model
{
    use HasSource, HasTranslations;

    protected $guarded = ['id', 'city_profile_id'];

    protected array $translatable = ['title', 'body'];

    protected function casts(): array
    {
        return ['block_key' => CityBlockKey::class];
    }

    public function profile(): BelongsTo
    {
        return $this->belongsTo(CityProfile::class, 'city_profile_id');
    }
}
