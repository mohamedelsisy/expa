<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;

class AdminAppointmentGuideResource extends AdminContentResource
{
    protected function extra(Request $request): array
    {
        return [
            'office_type' => $this->office_type->value,
            'booking_method' => $this->booking_method->value,
            'booking_portal_url' => $this->booking_portal_url,
        ];
    }
}
