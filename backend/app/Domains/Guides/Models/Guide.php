<?php

namespace App\Domains\Guides\Models;

use App\Domains\Content\Concerns\HasContentLifecycle;
use App\Domains\Content\Concerns\HasSource;
use App\Domains\Content\Concerns\HasTranslations;
use App\Domains\Geo\Models\City;
use App\Domains\Geo\Models\Region;
use App\Domains\Guides\Enums\GuideCategory;
use App\Support\Audit\Auditable;
use Database\Factories\GuideFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Guide extends Model
{
    /** @use HasFactory<GuideFactory> */
    use Auditable, HasContentLifecycle, HasFactory, HasSource, HasTranslations, SoftDeletes;

    protected $guarded = ['id', 'status', 'publish_at', 'published_at', 'created_by', 'updated_by'];

    protected array $translatable = [
        'title', 'summary', 'what_is', 'who_needs', 'required_documents', 'steps',
        'where_to_apply', 'how_to_book', 'costs', 'processing_time', 'body',
    ];

    /** Must be non-empty in each required locale before publishing. */
    public array $requiredTranslatableFields = ['title', 'summary', 'what_is'];

    protected bool $requiresSource = true;

    protected function casts(): array
    {
        return ['category' => GuideCategory::class];
    }

    /** Non-translated columns an editor may set (everything else is workflow-controlled). */
    public static function contentAttributes(): array
    {
        return ['slug', 'category', 'italian_term', 'region_id', 'city_id', 'sort_order',
            'source_name', 'source_url', 'source_type', 'last_verified_at'];
    }

    protected static function newFactory(): GuideFactory
    {
        return GuideFactory::new();
    }

    public function region(): BelongsTo
    {
        return $this->belongsTo(Region::class);
    }

    public function city(): BelongsTo
    {
        return $this->belongsTo(City::class);
    }

    /**
     * Guides relevant to a place: national guides, plus those for the city's region, plus city-specific ones.
     * With no place given, only national guides are not implied: all guides are returned.
     */
    public function scopeApplicableTo(Builder $query, ?City $city = null, ?Region $region = null): Builder
    {
        $region ??= $city?->region;

        return $query->where(function (Builder $q) use ($city, $region) {
            $q->where(fn ($n) => $n->whereNull('region_id')->whereNull('city_id')); // national
            if ($region) {
                $q->orWhere(fn ($r) => $r->where('region_id', $region->id)->whereNull('city_id'));
            }
            if ($city) {
                $q->orWhere('city_id', $city->id);
            }
        });
    }

    public function scopeMatching(Builder $query, string $term): Builder
    {
        $like = '%'.addcslashes($term, '%_\\').'%';

        return $query->where(fn ($q) => $q
            ->where('italian_term', 'like', $like)
            ->orWhereHas('translations', fn ($t) => $t->where('title', 'like', $like)->orWhere('summary', 'like', $like)));
    }
}
