<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;

class AdminPatenteQuestionResource extends AdminContentResource
{
    protected string $primary = 'statement';

    protected function extra(Request $request): array
    {
        return [
            'patente_topic_id' => $this->patente_topic_id,
            'is_true' => $this->is_true,
            'rights_note' => $this->rights_note,
        ];
    }
}
