<?php

namespace App\Http\Resources;

use App\Domains\Guides\Models\Guide;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Public representation. `full` adds the whole guide template; the list view stays light.
 *
 * @mixin Guide
 */
class GuideResource extends JsonResource
{
    public function __construct($resource, private bool $full = false)
    {
        parent::__construct($resource);
    }

    public function toArray(Request $request): array
    {
        $place = fn ($m) => $m ? ['id' => $m->id, 'slug' => $m->slug, 'name' => $m->localized('name')] : null;

        $data = [
            'id' => $this->id,
            'slug' => $this->slug,
            'category' => $this->category->value,
            'category_label' => __('guides.categories.'.$this->category->value),
            'italian_term' => $this->italian_term,
            'applies_to' => $this->city_id ? 'city' : ($this->region_id ? 'region' : 'national'),
            'region' => $place($this->region),
            'city' => $place($this->city),
            'title' => $this->localized('title'),
            'summary' => $this->localized('summary'),
            'locale' => $this->resolveLocale(),
            'fallback' => $this->usesFallback(),
            'available_locales' => $this->translatedLocales(),
            'status' => 'published', // the public API only ever serves published items
            'source' => $this->sourcePayload(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];

        if ($this->full) {
            foreach (['what_is', 'who_needs', 'required_documents', 'steps', 'where_to_apply', 'how_to_book', 'costs', 'processing_time', 'body'] as $f) {
                $data[$f] = $this->localized($f);
            }
            $data['published_at'] = $this->published_at?->toIso8601String();
        }

        return $data;
    }
}
