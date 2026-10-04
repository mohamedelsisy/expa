<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;

class AdminItalianLessonResource extends AdminContentResource
{
    protected function extra(Request $request): array
    {
        return [
            'level' => $this->level->value,
            'type' => $this->type->value,
            'scenario' => $this->scenario?->value,
            'duration_minutes' => $this->duration_minutes,
            'sort_order' => $this->sort_order,
        ];
    }
}
