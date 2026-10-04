<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;

class AdminGuideResource extends AdminContentResource
{
    protected function extra(Request $request): array
    {
        return [
            'category' => $this->category->value,
            'italian_term' => $this->italian_term,
            'region_id' => $this->region_id,
            'city_id' => $this->city_id,
        ];
    }
}
