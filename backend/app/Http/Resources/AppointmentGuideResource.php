<?php

namespace App\Http\Resources;

use App\Domains\Appointments\Models\AppointmentGuide;
use App\Support\BookingInfo;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin AppointmentGuide */
class AppointmentGuideResource extends JsonResource
{
    public function __construct($resource, private bool $full = false)
    {
        parent::__construct($resource);
    }

    public function toArray(Request $request): array
    {
        $data = [
            'id' => $this->id,
            'slug' => $this->slug,
            'office_type' => $this->office_type->value,
            'office_type_label' => __('government.office_types.'.$this->office_type->value),
            'title' => $this->localized('title'),
            'summary' => $this->localized('summary'),
            'booking' => BookingInfo::make($this->booking_method->value, $this->booking_portal_url),
            'locale' => $this->resolveLocale(),
            'fallback' => $this->usesFallback(),
            'status' => 'published', // the public API only ever serves published items
            'source' => $this->sourcePayload(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];

        if ($this->full) {
            $data['steps'] = $this->localized('steps');
            $data['tips'] = $this->localized('tips');
            $data['cautions'] = $this->localized('cautions');
        }

        return $data;
    }
}
