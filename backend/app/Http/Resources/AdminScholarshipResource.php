<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;

class AdminScholarshipResource extends AdminContentResource
{
    protected string $primary = 'name';

    protected function extra(Request $request): array
    {
        return ['degree_levels' => $this->degree_levels ?? [], 'deadline' => $this->deadline?->toDateString(), 'apply_url' => $this->apply_url];
    }
}
