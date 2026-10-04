<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;

class AdminStudyProgramResource extends AdminContentResource
{
    protected string $primary = 'title';

    protected function extra(Request $request): array
    {
        return [
            'university_id' => $this->university_id, 'degree_level' => $this->degree_level->value, 'field' => $this->field->value,
            'instruction_language' => $this->instruction_language, 'duration_years' => $this->duration_years,
            'tuition_min_year' => $this->tuition_min_year, 'tuition_max_year' => $this->tuition_max_year,
            'required_italian_level' => $this->required_italian_level?->value, 'required_english_level' => $this->required_english_level?->value,
            'application_deadline' => $this->application_deadline?->toDateString(), 'program_url' => $this->program_url,
        ];
    }
}
