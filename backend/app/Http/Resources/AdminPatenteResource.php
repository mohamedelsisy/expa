<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;

/** Admin view for patente categories and topics. */
class AdminPatenteResource extends AdminContentResource
{
    protected function extra(Request $request): array
    {
        return ['sort_order' => $this->sort_order];
    }
}
