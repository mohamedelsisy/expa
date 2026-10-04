<?php

namespace App\Http\Resources;

use App\Domains\Guides\Models\Guide;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin Guide */
class AdminGuideResource extends JsonResource
{
    public function __construct($resource, private bool $full = false)
    {
        parent::__construct($resource);
    }

    public function toArray(Request $request): array
    {
        $titles = $this->translations->mapWithKeys(fn ($t) => [$t->locale => $t->title]);

        $data = [
            'id' => $this->id,
            'slug' => $this->slug,
            'category' => $this->category->value,
            'italian_term' => $this->italian_term,
            'status' => $this->status->value,
            'allowed_transitions' => array_map(fn ($s) => $s->value, $this->status->allowedTransitions()),
            'publish_at' => $this->publish_at?->toIso8601String(),
            'published_at' => $this->published_at?->toIso8601String(),
            'region_id' => $this->region_id,
            'city_id' => $this->city_id,
            'titles' => $titles,
            'missing_locales' => $this->missingLocales(),
            'source' => $this->sourcePayload(),
            'created_by' => $this->created_by,
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];

        if ($this->full) {
            $data['translations'] = $this->translations->mapWithKeys(fn ($t) => [
                $t->locale => collect($this->translatableFields())->mapWithKeys(fn ($f) => [$f => $t->{$f}])->all(),
            ]);
        }

        return $data;
    }
}
