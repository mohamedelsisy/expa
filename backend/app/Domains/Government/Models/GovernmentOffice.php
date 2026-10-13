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

    /**
     * With a city: that city's offices plus region-level offices (no city) of its region. With only a region: every
     * office in the region, whether or not it is attached to a city (a region filter must not hide city offices).
     */
    public function scopeServing(Builder $query, ?City $city, ?Region $region = null): Builder
    {
        if ($city) {
            $regionId = ($region ?? $city->region)?->id;

            return $query->where(function (Builder $q) use ($city, $regionId) {
                $q->where('city_id', $city->id);
                if ($regionId) {
                    $q->orWhere(fn ($r) => $r->where('region_id', $regionId)->whereNull('city_id'));
                }
            });
        }

        return $region ? $query->where('region_id', $region->id) : $query;
    }

    /**
     * Records imported from an official registry (they carry a source_id) are published in the registry's own language:
     * Italian. Curated records keep the platform default (Arabic is required). Four-eyes review still applies to both.
     */
    public function requiredLocales(): array
    {
        return filled($this->source_id) ? ['it'] : (array) config('content.required_locales_to_publish');
    }
}
