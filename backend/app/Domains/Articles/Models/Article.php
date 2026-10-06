<?php

namespace App\Domains\Articles\Models;

use App\Domains\Articles\Enums\ArticleCategory;
use App\Domains\Content\Concerns\HasContentLifecycle;
use App\Domains\Content\Concerns\HasSource;
use App\Domains\Content\Concerns\HasTranslations;
use App\Domains\Content\Services\PublishGuard;
use App\Domains\Geo\Models\City;
use App\Domains\Geo\Models\Region;
use App\Domains\Guides\Models\Guide;
use App\Enums\SourceType;
use App\Support\Audit\Auditable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\DB;

/**
 * Editorial article. A source is OPTIONAL (articles are explanations, not official procedures), but whatever
 * source is given must be complete and valid; `official` still requires an allow-listed domain. Articles never
 * replace the sourced guides: they link to them (`related guides`).
 */
class Article extends Model
{
    use Auditable, HasContentLifecycle, HasSource, HasTranslations, SoftDeletes;

    protected $guarded = ['id', 'status', 'publish_at', 'published_at', 'created_by', 'updated_by'];

    protected array $translatable = ['title', 'excerpt', 'body', 'seo_title', 'seo_description'];

    protected bool $requiresSource = false;

    public array $requiredTranslatableFields = ['title', 'excerpt', 'body'];

    protected function casts(): array
    {
        return ['category' => ArticleCategory::class];
    }

    public static function contentAttributes(): array
    {
        return ['slug', 'category', 'region_id', 'city_id', 'author_name', 'cover_image_url', 'reading_minutes', 'sort_order',
            'source_name', 'source_url', 'source_type', 'last_verified_at'];
    }

    public function urlFields(): array
    {
        return ['source_url', 'cover_image_url'];
    }

    /** A partially filled source is rejected; an official claim must sit on an official domain. */
    public function extraPublishProblems(): array
    {
        $fields = ['source_name', 'source_url', 'source_type'];
        $filled = collect($fields)->filter(fn ($f) => filled($this->{$f}));
        if ($filled->isEmpty()) {
            return [];
        }
        $problems = [];
        foreach ($fields as $f) {
            if (blank($this->{$f})) {
                $problems[] = ['code' => 'missing_source_field', 'field' => $f];
            }
        }
        if (! $problems && $this->source_type === SourceType::Official) {
            $host = app(PublishGuard::class)->httpsHost($this->source_url);
            if ($host !== null && ! app(PublishGuard::class)->isOfficialHost($host)) {
                $problems[] = ['code' => 'source_domain_not_official', 'field' => 'source_url'];
            }
        }

        return $problems;
    }

    public function region(): BelongsTo
    {
        return $this->belongsTo(Region::class);
    }

    public function city(): BelongsTo
    {
        return $this->belongsTo(City::class);
    }

    public function guides(): BelongsToMany
    {
        return $this->belongsToMany(Guide::class, 'article_guide');
    }

    /** @return list<string> */
    public function tagList(): array
    {
        return DB::table('article_tags')->where('article_id', $this->id)->orderBy('tag')->pluck('tag')->all();
    }

    /** Pivots: `tags` (lowercase slugs) and `related_guides` (guide slugs). Missing keys leave the relation untouched. */
    public function syncContentRelations(array $data): void
    {
        if (array_key_exists('tags', $data)) {
            DB::table('article_tags')->where('article_id', $this->id)->delete();
            $rows = collect($data['tags'] ?? [])->unique()->map(fn ($t) => ['article_id' => $this->id, 'tag' => $t])->all();
            if ($rows) {
                DB::table('article_tags')->insert($rows);
            }
        }
        if (array_key_exists('related_guides', $data)) {
            $this->guides()->sync(Guide::whereIn('slug', $data['related_guides'] ?? [])->pluck('id')->all());
        }
    }
}
