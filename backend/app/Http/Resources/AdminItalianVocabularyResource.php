<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;

class AdminItalianVocabularyResource extends AdminContentResource
{
    protected string $primary = 'gloss';

    protected function extra(Request $request): array
    {
        return [
            'lemma' => $this->lemma, 'part_of_speech' => $this->part_of_speech, 'level' => $this->level->value, 'category' => $this->category,
            'example_it' => $this->example_it, 'audio_url' => $this->audio_url, 'audio_rights_note' => $this->audio_rights_note,
            'sort_order' => $this->sort_order,
            'reviewed' => $this->isReviewed(), 'reviewed_at' => $this->reviewed_by_teacher_at?->toIso8601String(), 'reviewed_by' => $this->reviewed_by,
        ];
    }
}
