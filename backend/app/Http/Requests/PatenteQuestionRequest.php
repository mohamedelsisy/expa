<?php

namespace App\Http\Requests;

use Illuminate\Validation\Rule;

class PatenteQuestionRequest extends ContentRequest
{
    protected function table(): string
    {
        return 'patente_questions';
    }

    protected function primaryField(): string
    {
        return 'statement';
    }

    protected function primaryMax(): int
    {
        return 1000;
    }

    protected function hasPlace(): bool
    {
        return false;
    }

    protected function plainTextAttributes(): array
    {
        return ['rights_note'];
    }

    protected function attributeRules(bool $creating): array
    {
        $req = $creating ? 'required' : 'sometimes';

        return [
            'patente_topic_id' => [$req, 'integer', Rule::exists('patente_topics', 'id')],
            'is_true' => [$req, 'boolean'],
            // Provenance/licence of the question text: where it comes from and under what rights EXPA may use it.
            'rights_note' => [$req, 'string', 'min:5', 'max:500'],
        ];
    }

    protected function translationFieldRules(): array
    {
        return ['explanation' => ['nullable', 'string', 'max:3000']];
    }
}
