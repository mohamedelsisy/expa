<?php

namespace App\Domains\Study\Models;

use App\Domains\Content\Concerns\HasContentLifecycle;
use App\Domains\Content\Concerns\HasSource;
use App\Domains\Content\Concerns\HasTranslations;
use App\Domains\Geo\Models\City;
use App\Domains\Geo\Models\Region;
use App\Support\Audit\Auditable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class University extends Model
{
    use Auditable, HasContentLifecycle, HasSource, HasTranslations, SoftDeletes;

    protected $guarded = ['id', 'status', 'publish_at', 'published_at', 'created_by', 'updated_by'];

    protected array $translatable = ['name', 'summary', 'notes'];

    public array $requiredTranslatableFields = ['name', 'summary'];

    protected bool $requiresSource = true;

    public static function contentAttributes(): array
    {
        return ['slug', 'kind', 'region_id', 'city_id', 'website', 'sort_order', 'source_name', 'source_url', 'source_type', 'last_verified_at'];
    }

    public function urlFields(): array
    {
        return ['website'];
    }

    public function programs(): HasMany
    {
        return $this->hasMany(StudyProgram::class);
    }

    public function city(): BelongsTo
    {
        return $this->belongsTo(City::class);
    }

    public function region(): BelongsTo
    {
        return $this->belongsTo(Region::class);
    }
}
