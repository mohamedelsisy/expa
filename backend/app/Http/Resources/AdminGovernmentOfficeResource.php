<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;

class AdminGovernmentOfficeResource extends AdminContentResource
{
    protected string $primary = 'name';

    protected function extra(Request $request): array
    {
        return [
            'office_type' => $this->office_type->value,
            'region_id' => $this->region_id,
            'city_id' => $this->city_id,
            'address' => $this->address,
            'postal_code' => $this->postal_code,
            'phone' => $this->phone,
            'email' => $this->email,
            'official_url' => $this->official_url,
            'booking_url' => $this->booking_url,
            'booking_method' => $this->booking_method->value,
        ];
    }
}
