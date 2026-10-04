<?php

namespace App\Domains\Government\Models;

use App\Domains\Content\Concerns\HasContentLifecycle;
use App\Domains\Content\Concerns\HasSource;
use App\Domains\Content\Concerns\HasTranslations;
use App\Domains\Geo\Models\City;
use App\Domains\Geo\Models\Region;
use App\Domains\Government\Enums\BookingMethod;
use App\Domains\Government\Enums\OfficeType;
use App\Support\Audit\Auditable;
use Database\Factories\GovernmentOfficeFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class GovernmentOffice extends Model
{
    /** @use HasFactory<GovernmentOfficeFactory> */
    use Auditable, HasContentLifecycle, HasFactory, HasSource, HasTranslations, SoftDeletes;

    protected $guarded = ['id', 'status', 'publish_at', 'published_at', 'created_by', 'updated_by'];

    protected array $translatable = ['name', 'opening_hours', 'notes'];

    public array $requiredTranslatableFields = ['name'];

    protected bool $requiresSource = true;

    protected function casts(): array
    {
        return ['office_type' => OfficeType::class, 'booking_method' => BookingMethod::class];
    }

    public static function contentAttributes(): array
    {
        return ['slug', 'office_type', 'region_id', 'city_id', 'address', 'postal_code', 'phone', 'email',
            'official_url', 'booking_url', 'booking_method', 'sort_order',
            'source_name', 'source_url', 'source_type', 'last_verified_at'];
    }

    /** URL columns that must be https before publishing. */
    public function urlFields(): array
    {
        return ['official_url', 'booking_url'];
    }

    protected static function newFactory(): GovernmentOfficeFactory
    {
        return GovernmentOfficeFactory::new();
    }

    public function region(): BelongsTo
    {
        return $this->belongsTo(Region::class);
    }

    public function city(): BelongsTo
    {
        return $this->belongsTo(City::class);
    }

    public function services(): BelongsToMany
    {
        return $this->belongsToMany(GovernmentService::class, 'government_service_office');
    }

    /** Offices serving a place: in that city, or region-level offices of that region. */
    public function scopeServing(Builder $query, ?City $city, ?Region $region = null): Builder
    {
        $region ??= $city?->region;

        return $query->where(function (Builder $q) use ($city, $region) {
            if ($city) {
                $q->orWhere('city_id', $city->id);
            }
            if ($region) {
                $q->orWhere(fn ($r) => $r->where('region_id', $region->id)->whereNull('city_id'));
            }
        });
    }
}
