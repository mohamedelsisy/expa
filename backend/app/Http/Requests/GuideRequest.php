<?php

namespace App\Http\Requests;

use App\Domains\Guides\Enums\GuideCategory;
use Illuminate\Validation\Rule;

class GuideRequest extends ContentRequest
{
    protected function table(): string
    {
        return 'guides';
    }

    protected function primaryField(): string
    {
        return 'title';
    }

    protected function plainTextAttributes(): array
    {
        return ['italian_term'];
    }

    protected function attributeRules(bool $creating): array
    {
        return [
            'category' => [$creating ? 'required' : 'sometimes', Rule::enum(GuideCategory::class)],
            'italian_term' => ['sometimes', 'nullable', 'string', 'max:255'],
        ];
    }

    protected function translationFieldRules(): array
    {
        $rules = [];
        foreach (['summary', 'what_is', 'who_needs', 'where_to_apply', 'how_to_book', 'costs'] as $f) {
            $rules[$f] = ['nullable', 'string', 'max:5000'];
        }

        return $rules + [
            'processing_time' => ['nullable', 'string', 'max:255'],
            'body' => ['nullable', 'string', 'max:50000'],
            'required_documents' => ['nullable', 'array', 'max:50'],
            'required_documents.*' => ['string', 'max:300'],
            'steps' => ['nullable', 'array', 'max:50'],
            'steps.*.title' => ['required', 'string', 'max:200'],
            'steps.*.text' => ['nullable', 'string', 'max:1500'],
        ];
    }
}
