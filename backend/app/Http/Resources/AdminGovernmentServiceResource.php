<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;

class AdminGovernmentServiceResource extends AdminContentResource
{
    protected string $primary = 'name';

    protected function extra(Request $request): array
    {
        return [
            'domain' => $this->domain->value,
            'italian_term' => $this->italian_term,
            'guide_id' => $this->guide_id,
            'region_id' => $this->region_id,
            'city_id' => $this->city_id,
            'office_ids' => $this->resource->relationLoaded('offices') ? $this->offices->pluck('id')->sort()->values() : null,
        ];
    }
}
