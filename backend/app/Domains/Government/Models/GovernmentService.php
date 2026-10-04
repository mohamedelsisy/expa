<?php

namespace App\Domains\Government\Models;

use App\Domains\Content\Concerns\HasContentLifecycle;
use App\Domains\Content\Concerns\HasSource;
use App\Domains\Content\Concerns\HasTranslations;
use App\Domains\Geo\Models\City;
use App\Domains\Geo\Models\Region;
use App\Domains\Government\Enums\ServiceDomain;
use App\Domains\Guides\Models\Guide;
use App\Support\Audit\Auditable;
use Database\Factories\GovernmentServiceFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class GovernmentService extends Model
{
    /** @use HasFactory<GovernmentServiceFactory> */
    use Auditable, HasContentLifecycle, HasFactory, HasSource, HasTranslations, SoftDeletes;

    protected $guarded = ['id', 'status', 'publish_at', 'published_at', 'created_by', 'updated_by'];

    protected array $translatable = ['name', 'summary', 'how_to_apply', 'required_documents', 'notes'];

    public array $requiredTranslatableFields = ['name', 'summary', 'how_to_apply'];

    protected bool $requiresSource = true;

    protected function casts(): array
    {
        return ['domain' => ServiceDomain::class];
    }

    public static function contentAttributes(): array
    {
        return ['slug', 'domain', 'italian_term', 'guide_id', 'region_id', 'city_id', 'sort_order',
            'source_name', 'source_url', 'source_type', 'last_verified_at'];
    }

    /** Pivot sync from admin payload `office_ids`. */
    public function syncContentRelations(array $data): void
    {
        if (array_key_exists('office_ids', $data)) {
            $this->offices()->sync($data['office_ids'] ?? []);
        }
    }

    protected static function newFactory(): GovernmentServiceFactory
    {
        return GovernmentServiceFactory::new();
    }

    public function guide(): BelongsTo
    {
        return $this->belongsTo(Guide::class);
    }

    public function region(): BelongsTo
    {
        return $this->belongsTo(Region::class);
    }

    public function city(): BelongsTo
    {
        return $this->belongsTo(City::class);
    }

    public function offices(): BelongsToMany
    {
        return $this->belongsToMany(GovernmentOffice::class, 'government_service_office');
    }
}
