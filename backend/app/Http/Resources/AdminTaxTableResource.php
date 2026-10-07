<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;

class AdminTaxTableResource extends AdminContentResource
{
    protected function extra(Request $request): array
    {
        return ['tax_year' => $this->tax_year, 'contribution_rate' => $this->contribution_rate, 'contribution_ceiling' => $this->contribution_ceiling,
            'deduction_flat' => $this->deduction_flat, 'brackets' => $this->brackets];
    }
}
