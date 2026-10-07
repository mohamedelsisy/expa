<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;

class AdminTravelRequirementResource extends AdminContentResource
{
    protected function extra(Request $request): array
    {
        return ['nationality' => $this->nationality, 'destination' => $this->destination, 'residence_status' => $this->residence_status];
    }
}
