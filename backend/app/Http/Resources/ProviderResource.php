<?php

namespace App\Http\Resources;

use App\Domains\Geo\Models\City;
use App\Domains\Geo\Models\Region;
use App\Domains\Marketplace\Models\ServiceProvider;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Public representation of a directory listing. Third-party service: never official, never recommended by EXPA.
 * Private contact fields are included only when the provider opted in (show_*), commission and verification
 * internals never.
 *
 * @mixin ServiceProvider
 */
class ProviderResource extends JsonResource
{
    public function __construct($resource, private bool $full = false)
    {
        parent::__construct($resource);
    }

    public function toArray(Request $request): array
    {
        $place = fn ($m) => $m ? ['id' => $m->id, 'slug' => $m->slug, 'name' => $m->localized('name')] : null;
        $state = $this->effectiveVerification();

        $data = [
            'id' => $this->id, 'slug' => $this->slug,
            'category' => $this->category->value, 'category_label' => __('marketplace.categories.'.$this->category->value),
            'display_name' => $this->display_name, 'headline' => $this->localized('headline'),
            'city' => $place($this->city), 'region' => $place($this->region),
            'serves_online' => $this->serves_online, 'languages' => $this->languages ?? [],
            'verification' => [
                'status' => $state,
                'label' => __('marketplace.verification.'.$state),
                'verified_at' => $state === 'verified' ? $this->verified_at?->toDateString() : null,
                'valid_until' => $state === 'verified' ? $this->verification_expires_at?->toDateString() : null,
            ],
            'rating' => ['average' => $this->rating_count ? (float) $this->rating_avg : null, 'count' => (int) $this->rating_count],
            'locale' => $this->resolveLocale(), 'fallback' => $this->usesFallback(),
            // AI/label compatibility: a provider is a third-party service, never an official source.
            'source_type' => 'third_party', 'official' => false,
            'notice' => __('marketplace.notice'),
        ];

        if ($this->full) {
            $data += [
                'description' => $this->localized('description'), 'availability_note' => $this->localized('availability_note'),
                'areas' => $this->areas->map(fn ($a) => ['region' => $place($a->region_id ? $this->regionFor($a->region_id) : null), 'city' => $place($a->city_id ? $this->cityFor($a->city_id) : null)])->values(),
                'services' => $this->services->map(fn ($s) => [
                    'name' => $s->localized('name'), 'description' => $s->localized('description'), 'price_from_eur' => $s->price_from_eur,
                ])->values(),
                'contact' => array_filter([
                    'email' => $this->show_email ? $this->contact_email : null,
                    'phone' => $this->show_phone ? $this->contact_phone : null,
                    'website' => $this->show_website ? $this->website : null,
                ], fn ($v) => $v !== null),
                'can_request_contact' => true,
                'updated_at' => $this->updated_at?->toIso8601String(),
            ];
        }

        return $data;
    }

    private function regionFor(int $id)
    {
        return Region::with('translations')->find($id);
    }

    private function cityFor(int $id)
    {
        return City::with('translations')->find($id);
    }
}
