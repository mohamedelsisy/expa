<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;

class AdminLegalDocumentResource extends AdminContentResource
{
    protected function extra(Request $request): array
    {
        return ['version' => $this->version];
    }
}
