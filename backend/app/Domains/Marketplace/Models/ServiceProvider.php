<?php

namespace App\Domains\Marketplace\Models;

use App\Domains\Access\Models\Role;
use App\Domains\Content\Concerns\HasContentLifecycle;
use App\Domains\Content\Concerns\HasTranslations;
use App\Domains\Geo\Models\City;
use App\Domains\Geo\Models\Region;
use App\Domains\Marketplace\Enums\ProviderCategory;
use App\Domains\Marketplace\Enums\VerificationStatus;
use App\Models\User;
use App\Support\Audit\Auditable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\DB;

/**
 * A third-party service provider listed in the directory. EXPA does not recommend or guarantee providers.
 * Listing publication follows the content lifecycle (owner drafts, admin approves); verification is a separate,
 * expiring state. Private contact data and commission configuration never reach public payloads.
 */
class ServiceProvider extends Model
{
    use Auditable, HasContentLifecycle, HasTranslations, SoftDeletes;

    protected $guarded = ['id', 'user_id', 'status', 'publish_at', 'published_at', 'created_by', 'updated_by', 'verification_status',
        'verification_requested_at', 'verified_by', 'verified_at', 'verification_expires_at', 'verification_basis', 'rating_avg', 'rating_count',
        'pending_changes', 'pending_changes_at'];

    protected $hidden = ['contact_email', 'contact_phone', 'commission_percent', 'commission_note', 'verification_basis', 'pending_changes', 'verified_by'];

    protected array $auditExcept = ['contact_email', 'contact_phone', 'pending_changes'];

    protected $attributes = ['verification_status' => 'unverified', 'rating_count' => 0, 'serves_online' => false, 'show_email' => false, 'show_phone' => false, 'show_website' => true];

    protected array $translatable = ['headline', 'description', 'availability_note'];

    public array $requiredTranslatableFields = ['headline'];

    protected bool $requiresSource = false;

    protected function casts(): array
    {
        return [
            'category' => ProviderCategory::class,
            'verification_status' => VerificationStatus::class,
            'languages' => 'array',
            'serves_online' => 'boolean', 'show_email' => 'boolean', 'show_phone' => 'boolean', 'show_website' => 'boolean',
            'contact_email' => 'encrypted', 'contact_phone' => 'encrypted',
            'pending_changes' => 'array',
            'commission_percent' => 'decimal:2', 'rating_avg' => 'decimal:2',
            'verification_requested_at' => 'datetime', 'verified_at' => 'datetime', 'verification_expires_at' => 'datetime', 'pending_changes_at' => 'datetime',
        ];
    }

    /** Admin-editable columns (the owner's subset is ownerAttributes()). */
    public static function contentAttributes(): array
    {
        return [...self::ownerAttributes(), 'slug', 'sort_order', 'commission_percent', 'commission_note'];
    }

    public static function ownerAttributes(): array
    {
        return ['category', 'display_name', 'region_id', 'city_id', 'serves_online', 'languages', 'contact_email', 'contact_phone',
            'website', 'show_email', 'show_phone', 'show_website'];
    }

    /** Shape expected by the generic admin content resource: providers are always third-party, never an official source. */
    public function sourcePayload(): array
    {
        return ['name' => null, 'url' => null, 'type' => 'third_party', 'last_verified_at' => $this->verified_at?->toDateString(), 'freshness' => $this->isVerified() ? 'fresh' : 'unverified'];
    }

    public function urlFields(): array
    {
        return ['website'];
    }

    /** @return list<array<string,mixed>> */
    public function extraPublishProblems(): array
    {
        $p = [];
        if (! $this->areas()->exists() && ! $this->serves_online && ! $this->city_id) {
            $p[] = ['code' => 'missing_coverage'];
        }
        if (blank($this->contact_email) && blank($this->contact_phone)) {
            $p[] = ['code' => 'missing_contact']; // leads need a route to the provider
        }

        return $p;
    }

    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function region(): BelongsTo
    {
        return $this->belongsTo(Region::class);
    }

    public function city(): BelongsTo
    {
        return $this->belongsTo(City::class);
    }

    public function areas(): HasMany
    {
        return $this->hasMany(ProviderArea::class);
    }

    public function services(): HasMany
    {
        return $this->hasMany(ProviderService::class)->orderBy('sort_order')->orderBy('id');
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(ProviderReview::class);
    }

    public function leads(): HasMany
    {
        return $this->hasMany(ProviderLead::class);
    }

    public function evidence(): HasMany
    {
        return $this->hasMany(ProviderVerificationDocument::class);
    }

    /** verified | unverified | pending | expired: `verified` only while the verification is current. */
    public function effectiveVerification(): string
    {
        if ($this->verification_status === VerificationStatus::Verified) {
            return $this->verification_expires_at && $this->verification_expires_at->isPast() ? 'expired' : 'verified';
        }

        return $this->verification_status->value;
    }

    public function isVerified(): bool
    {
        return $this->effectiveVerification() === 'verified';
    }

    /** Public directory: published, and verified unless config allows labelled unverified listings. */
    public function scopeListable(Builder $query): Builder
    {
        $query->published();
        if (! config('marketplace.list_unverified')) {
            $query->where('verification_status', VerificationStatus::Verified->value)
                ->where(fn ($q) => $q->whereNull('verification_expires_at')->orWhere('verification_expires_at', '>', now()));
        }

        return $query;
    }

    public function refreshRating(): void
    {
        $row = DB::table('provider_reviews')->where('service_provider_id', $this->id)->where('status', 'approved')
            ->selectRaw('count(*) as c, avg(rating) as a')->first();
        $this->forceFill(['rating_count' => (int) $row->c, 'rating_avg' => $row->c ? round((float) $row->a, 2) : null])->saveQuietly();
    }

    /** Apply fields supplied by the admin or the owner (already validated): scalar columns, translations, areas, services. */
    public function applyData(array $data, array $allowed): void
    {
        $this->fill(array_intersect_key($data, array_flip($allowed)));
        $this->save();
        if (! empty($data['translations'])) {
            $this->setTranslations(array_filter($data['translations'], fn ($t) => is_array($t) && $t !== []));
        }
        $this->syncContentRelations($data);
    }

    /** `areas`: [{region_id?, city_id?}], `services`: [{price_from_eur?, sort_order?, translations}], `owner_user_id` (admin). */
    public function syncContentRelations(array $data): void
    {
        if (array_key_exists('areas', $data)) {
            $this->areas()->delete();
            foreach ($data['areas'] ?? [] as $a) {
                $this->areas()->create(['region_id' => $a['region_id'] ?? null, 'city_id' => $a['city_id'] ?? null]);
            }
        }
        if (array_key_exists('services', $data)) {
            $this->services()->get()->each->delete();
            foreach (array_values($data['services'] ?? []) as $i => $s) {
                $svc = $this->services()->create(['price_from_eur' => $s['price_from_eur'] ?? null, 'sort_order' => $s['sort_order'] ?? $i]);
                $svc->setTranslations(array_filter($s['translations'] ?? [], fn ($t) => is_array($t) && $t !== []));
            }
        }
        if (! empty($data['owner_user_id'])) {
            $this->forceFill(['user_id' => $data['owner_user_id']])->save();
            $owner = User::find($data['owner_user_id']);
            if ($owner) {
                $role = Role::firstWhere('key', 'provider');
                if ($role) {
                    $owner->roles()->syncWithoutDetaching([$role->id]);
                }
            }
        }
        $this->unsetRelation('areas');
        $this->unsetRelation('services');
    }
}
