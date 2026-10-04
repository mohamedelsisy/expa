<?php

namespace App\Http\Requests;

use Illuminate\Validation\Rule;

class UniversityRequest extends ContentRequest
{
    protected function table(): string
    {
        return 'universities';
    }

    protected function primaryField(): string
    {
        return 'name';
    }

    protected function attributeRules(bool $creating): array
    {
        return [
            'kind' => ['sometimes', Rule::in(['public', 'private', 'other'])],
            'website' => ['sometimes', 'nullable', 'string', 'max:2048', 'url:https'],
        ];
    }

    protected function translationFieldRules(): array
    {
        return ['summary' => ['nullable', 'string', 'max:5000'], 'notes' => ['nullable', 'string', 'max:5000']];
    }
}
