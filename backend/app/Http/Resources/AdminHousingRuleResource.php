<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;

class AdminHousingRuleResource extends AdminContentResource
{
    protected function extra(Request $request): array
    {
        return ['kind' => $this->kind, 'signal' => $this->signal, 'condition' => $this->condition, 'threshold' => $this->threshold,
            'severity' => $this->severity, 'basis' => $this->basis];
    }
}
