<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;

class AdminUniversityResource extends AdminContentResource
{
    protected string $primary = 'name';

    protected function extra(Request $request): array
    {
        return ['kind' => $this->kind, 'region_id' => $this->region_id, 'city_id' => $this->city_id, 'website' => $this->website];
    }
}
