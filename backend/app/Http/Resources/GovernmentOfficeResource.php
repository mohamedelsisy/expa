<?php

namespace App\Http\Resources;

use App\Domains\Government\Models\GovernmentOffice;
use App\Support\BookingInfo;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin GovernmentOffice */
class GovernmentOfficeResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $place = fn ($m) => $m ? ['id' => $m->id, 'slug' => $m->slug, 'name' => $m->localized('name')] : null;

        return [
            'id' => $this->id,
            'slug' => $this->slug,
            'office_type' => $this->office_type->value,
            'office_type_label' => __('government.office_types.'.$this->office_type->value),
            'name' => $this->localized('name'),
            'opening_hours' => $this->localized('opening_hours'),
            'notes' => $this->localized('notes'),
            'region' => $place($this->region),
            'city' => $place($this->city),
            'address' => $this->address,
            'postal_code' => $this->postal_code,
            'phone' => $this->phone,
            'email' => $this->email,
            'official_url' => $this->official_url,
            'booking' => BookingInfo::make($this->booking_method->value, $this->booking_url),
            'locale' => $this->resolveLocale(),
            'fallback' => $this->usesFallback(),
            'status' => 'published', // the public API only ever serves published items
            'source' => $this->sourcePayload(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
