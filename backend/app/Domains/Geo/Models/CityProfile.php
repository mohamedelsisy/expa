<?php

namespace App\Domains\Geo\Models;

use App\Domains\Content\Concerns\HasContentLifecycle;
use App\Domains\Content\Concerns\HasSource;
use App\Domains\Content\Concerns\HasTranslations;
use App\Domains\Content\Services\PublishGuard;
use App\Enums\SourceType;
use App\Support\Audit\Auditable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

/** Public landing content for one city. Lifecycle is on the profile; blocks are its ordered children. */
class CityProfile extends Model
{
    use Auditable, HasContentLifecycle, HasSource, HasTranslations, SoftDeletes;

    protected $guarded = ['id', 'status', 'publish_at', 'published_at', 'created_by', 'updated_by'];

    protected array $translatable = ['headline', 'summary', 'seo_description'];

    protected bool $requiresSource = false;

    public array $requiredTranslatableFields = ['headline', 'summary'];

    public static function contentAttributes(): array
    {
        return ['slug', 'city_id', 'sort_order', 'source_name', 'source_url', 'source_type', 'last_verified_at'];
    }

    public function city(): BelongsTo
    {
        return $this->belongsTo(City::class);
    }

    public function blocks(): HasMany
    {
        return $this->hasMany(CityBlock::class)->orderBy('sort_order')->orderBy('id');
    }

    /** @return list<array<string,mixed>> */
    public function extraPublishProblems(): array
    {
        $guard = app(PublishGuard::class);
        $problems = [];
        foreach ($this->blocks()->with('translations')->get() as $block) {
            $ar = $block->translation('ar');
            if (! $ar || blank($ar->title) || blank($ar->body)) {
                $problems[] = ['code' => 'block_missing_translation', 'block' => $block->block_key->value, 'locale' => 'ar'];
            }
            $official = $block->info_type === 'official_info';
            $hasSource = collect(['source_name', 'source_url', 'source_type'])->contains(fn ($f) => filled($block->{$f}));
            if (! $official && ! $hasSource) {
                continue;
            }
            foreach (['source_name', 'source_url', 'source_type', 'last_verified_at'] as $f) {
                if (blank($block->{$f})) {
                    $problems[] = ['code' => 'missing_source_field', 'block' => $block->block_key->value, 'field' => $f];
                }
            }
            $host = $guard->httpsHost($block->source_url);
            if (filled($block->source_url) && $host === null) {
                $problems[] = ['code' => 'invalid_source_url', 'block' => $block->block_key->value];
            } elseif ($host !== null && $block->source_type === SourceType::Official && ! $guard->isOfficialHost($host)) {
                $problems[] = ['code' => 'source_domain_not_official', 'block' => $block->block_key->value];
            }
            if ($block->last_verified_at?->isFuture()) {
                $problems[] = ['code' => 'verified_in_future', 'block' => $block->block_key->value];
            }
        }

        return $problems;
    }

    /**
     * Replace the block list from `blocks`: [{key, info_type, sort_order, source_*, translations:{ar:{title,body}}}].
     * Missing `blocks` key leaves blocks untouched.
     */
    public function syncContentRelations(array $data): void
    {
        if (! array_key_exists('blocks', $data)) {
            return;
        }
        $this->blocks()->delete();
        foreach (array_values($data['blocks'] ?? []) as $i => $b) {
            $block = new CityBlock([
                'info_type' => $b['info_type'] ?? 'general_guidance',
                'sort_order' => $b['sort_order'] ?? $i,
                'source_name' => $b['source_name'] ?? null, 'source_url' => $b['source_url'] ?? null,
                'source_type' => $b['source_type'] ?? null, 'last_verified_at' => $b['last_verified_at'] ?? null,
            ]);
            $block->block_key = $b['key'];
            $block->city_profile_id = $this->id;
            $block->save();
            $block->setTranslations(array_filter($b['translations'] ?? [], fn ($t) => is_array($t) && $t !== []));
        }
        $this->unsetRelation('blocks');
    }
}
