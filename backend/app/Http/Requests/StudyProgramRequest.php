<?php

namespace App\Http\Requests;

use App\Domains\Profile\Enums\CefrLevel;
use App\Domains\Study\Enums\DegreeLevel;
use App\Domains\Study\Enums\StudyField;
use Illuminate\Validation\Rule;

class StudyProgramRequest extends ContentRequest
{
    protected function table(): string
    {
        return 'study_programs';
    }

    protected function primaryField(): string
    {
        return 'title';
    }

    protected function hasPlace(): bool
    {
        return false;
    }

    protected function attributeRules(bool $creating): array
    {
        $req = $creating ? 'required' : 'sometimes';
        $levels = [CefrLevel::A0, CefrLevel::A1, CefrLevel::A2, CefrLevel::B1, CefrLevel::B2, CefrLevel::C1, CefrLevel::C2];

        return [
            'university_id' => [$req, 'integer', Rule::exists('universities', 'id')],
            'degree_level' => [$req, Rule::enum(DegreeLevel::class)],
            'field' => [$req, Rule::enum(StudyField::class)],
            'instruction_language' => [$req, Rule::in(['en', 'it', 'both'])],
            'duration_years' => ['sometimes', 'nullable', 'integer', 'min:1', 'max:10'],
            'tuition_min_year' => ['sometimes', 'nullable', 'integer', 'min:0', 'max:200000'],
            'tuition_max_year' => ['sometimes', 'nullable', 'integer', 'min:0', 'max:200000', 'gte:tuition_min_year'],
            'required_italian_level' => ['sometimes', 'nullable', Rule::enum(CefrLevel::class)->only($levels)],
            'required_english_level' => ['sometimes', 'nullable', Rule::enum(CefrLevel::class)->only($levels)],
            'application_deadline' => ['sometimes', 'nullable', 'date', 'after:2000-01-01', 'before:2100-01-01'],
            'program_url' => ['sometimes', 'nullable', 'string', 'max:2048', 'url:https'],
        ];
    }

    protected function translationFieldRules(): array
    {
        return ['summary' => ['nullable', 'string', 'max:5000'], 'admission_requirements' => ['nullable', 'string', 'max:10000'], 'notes' => ['nullable', 'string', 'max:5000']];
    }
}
