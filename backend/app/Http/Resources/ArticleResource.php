<?php

namespace App\Http\Resources;

use App\Domains\Articles\Models\Article;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin Article */
class ArticleResource extends JsonResource
{
    public function __construct($resource, private bool $full = false)
    {
        parent::__construct($resource);
    }

    public function toArray(Request $request): array
    {
        $place = fn ($m) => $m ? ['id' => $m->id, 'slug' => $m->slug, 'name' => $m->localized('name')] : null;
        $hasSource = filled($this->source_name) && filled($this->source_url);

        $data = [
            'id' => $this->id, 'slug' => $this->slug,
            'category' => $this->category->value, 'category_label' => __('articles.categories.'.$this->category->value),
            'title' => $this->localized('title'), 'excerpt' => $this->localized('excerpt'),
            'author_name' => $this->author_name, 'cover_image_url' => $this->cover_image_url, 'reading_minutes' => $this->reading_minutes,
            'city' => $place($this->city), 'region' => $place($this->region),
            'locale' => $this->resolveLocale(), 'fallback' => $this->usesFallback(), 'available_locales' => $this->translatedLocales(),
            'published_at' => $this->published_at?->toIso8601String(), 'updated_at' => $this->updated_at?->toIso8601String(),
            // Editorial content: never official by itself. Only a stated source carries a source type.
            'status' => 'published',
            'content_type' => 'editorial',
            'source' => $hasSource ? $this->sourcePayload() : null,
        ];

        if ($this->full) {
            $data += [
                'body' => $this->localized('body'),
                'tags' => $this->tagList(),
                'seo' => [
                    'title' => $this->localized('seo_title') ?: $this->localized('title'),
                    'description' => $this->localized('seo_description') ?: $this->localized('excerpt'),
                    'canonical_path' => '/articles/'.$this->slug,
                    'alternates' => $this->translatedLocales(),
                ],
                'disclaimer' => __('articles.disclaimer'),
            ];
        }

        return $data;
    }
}
