<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;

class AdminItalianExerciseResource extends AdminContentResource
{
    protected string $primary = 'prompt';

    protected function extra(Request $request): array
    {
        return [
            'type' => $this->type->value, 'level' => $this->level->value, 'scenario' => $this->scenario?->value,
            'italian_vocabulary_id' => $this->italian_vocabulary_id, 'content' => $this->content,
            'audio_url' => $this->audio_url, 'audio_rights_note' => $this->audio_rights_note, 'sort_order' => $this->sort_order,
            'reviewed' => $this->isReviewed(), 'reviewed_at' => $this->reviewed_by_teacher_at?->toIso8601String(), 'reviewed_by' => $this->reviewed_by,
        ];
    }
}
