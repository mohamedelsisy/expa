<?php

namespace App\Http\Requests;

use App\Domains\Study\Enums\DegreeLevel;
use Illuminate\Validation\Rule;

class ScholarshipRequest extends ContentRequest
{
    protected function table(): string
    {
        return 'scholarships';
    }

    protected function primaryField(): string
    {
        return 'name';
    }

    protected function hasPlace(): bool
    {
        return false;
    }

    protected function attributeRules(bool $creating): array
    {
        return [
            'degree_levels' => ['sometimes', 'nullable', 'array', 'max:5'],
            'degree_levels.*' => [Rule::enum(DegreeLevel::class), 'distinct'],
            'deadline' => ['sometimes', 'nullable', 'date', 'after:2000-01-01', 'before:2100-01-01'],
            'apply_url' => ['sometimes', 'nullable', 'string', 'max:2048', 'url:https'],
        ];
    }

    protected function translationFieldRules(): array
    {
        return ['summary' => ['nullable', 'string', 'max:5000'], 'eligibility' => ['nullable', 'string', 'max:5000'], 'how_to_apply' => ['nullable', 'string', 'max:5000']];
    }
}
