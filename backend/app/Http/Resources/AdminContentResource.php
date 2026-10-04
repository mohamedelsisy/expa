<?php

namespace App\Http\Resources;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Admin view of any lifecycle content item. Subclasses add module fields via extra().
 *
 * @mixin Model
 */
abstract class AdminContentResource extends JsonResource
{
    protected string $primary = 'title';

    public function __construct($resource, protected bool $full = false)
    {
        parent::__construct($resource);
    }

    public function primaryField(): string
    {
        return $this->primary;
    }

    protected function extra(Request $request): array
    {
        return [];
    }

    public function toArray(Request $request): array
    {
        $item = $this->resource;
        $data = [
            'id' => $item->id,
            'slug' => $item->slug,
            'status' => $item->status->value,
            'allowed_transitions' => array_map(fn ($s) => $s->value, $item->status->allowedTransitions()),
            'publish_at' => $item->publish_at?->toIso8601String(),
            'published_at' => $item->published_at?->toIso8601String(),
            'titles' => $item->translations->mapWithKeys(fn ($t) => [$t->locale => $t->{$this->primary}]),
            'missing_locales' => $item->missingLocales(),
            'source' => $item->sourcePayload(),
            'created_by' => $item->created_by,
            'updated_at' => $item->updated_at?->toIso8601String(),
        ] + $this->extra($request);

        if ($this->full) {
            $data['translations'] = $item->translations->mapWithKeys(fn ($t) => [
                $t->locale => collect($item->translatableFields())->mapWithKeys(fn ($f) => [$f => $t->{$f}])->all(),
            ]);
        }

        return $data;
    }
}
