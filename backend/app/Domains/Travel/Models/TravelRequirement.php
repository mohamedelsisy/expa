<?php

namespace App\Domains\Travel\Models;

use App\Domains\Content\Concerns\HasContentLifecycle;
use App\Domains\Content\Concerns\HasSource;
use App\Domains\Content\Concerns\HasTranslations;
use App\Support\Audit\Auditable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * One sourced statement about travel for a nationality (or any) to a destination, optionally for a residence status.
 * Travel eligibility is a legal claim: every entry needs an official source and a verification date to be published.
 */
class TravelRequirement extends Model
{
    use Auditable, HasContentLifecycle, HasSource, HasTranslations, SoftDeletes;

    public const ANY = 'any';

    protected $guarded = ['id', 'status', 'publish_at', 'published_at', 'created_by', 'updated_by'];

    protected $attributes = ['residence_status' => 'any'];

    protected array $translatable = ['title', 'summary', 'requirements', 'notes'];

    public array $requiredTranslatableFields = ['title', 'summary'];

    protected bool $requiresSource = true;

    public static function contentAttributes(): array
    {
        return ['slug', 'nationality', 'destination', 'residence_status', 'sort_order', 'source_name', 'source_url', 'source_type', 'last_verified_at'];
    }

    public function scopeFor(Builder $q, string $nationality, string $destination, ?string $status): Builder
    {
        $q->where('destination', strtoupper($destination))->whereIn('nationality', [strtoupper($nationality), '*']);
        if ($status) {
            $q->whereIn('residence_status', [$status, self::ANY]);
        }

        return $q;
    }
}
