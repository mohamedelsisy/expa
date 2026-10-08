<?php

namespace App\Http\Resources;

use App\Domains\Government\Models\GovernmentService;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin GovernmentService */
class GovernmentServiceResource extends JsonResource
{
    public function __construct($resource, private bool $full = false, private ?iterable $offices = null)
    {
        parent::__construct($resource);
    }

    public function toArray(Request $request): array
    {
        $place = fn ($m) => $m ? ['id' => $m->id, 'slug' => $m->slug, 'name' => $m->localized('name')] : null;

        $data = [
            'id' => $this->id,
            'slug' => $this->slug,
            'domain' => $this->domain->value,
            'domain_label' => __('government.domains.'.$this->domain->value),
            'italian_term' => $this->italian_term,
            'applies_to' => $this->city_id ? 'city' : ($this->region_id ? 'region' : 'national'),
            'region' => $place($this->region),
            'city' => $place($this->city),
            'name' => $this->localized('name'),
            'summary' => $this->localized('summary'),
            'locale' => $this->resolveLocale(),
            'fallback' => $this->usesFallback(),
            'available_locales' => $this->translatedLocales(),
            'status' => 'published', // the public API only ever serves published items
            'source' => $this->sourcePayload(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];

        if ($this->full) {
            $data['how_to_apply'] = $this->localized('how_to_apply');
            $data['required_documents'] = $this->localized('required_documents');
            $data['notes'] = $this->localized('notes');
            $guide = $this->guide;
            $data['guide'] = $guide && $guide->status->value === 'published'
                ? ['slug' => $guide->slug, 'title' => $guide->localized('title')] : null;
            $data['offices'] = collect($this->offices ?? [])->map(fn ($o) => (new GovernmentOfficeResource($o))->toArray($request))->values();
        }

        return $data;
    }
}
