<?php

namespace App\Http\Requests;

use App\Domains\Patente\Enums\LicenseType;
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
        return ['rights_note', 'rights_holder', 'license_proof_ref'];
    }

    protected function attributeRules(bool $creating): array
    {
        $req = $creating ? 'required' : 'sometimes';

        return [
            'patente_topic_id' => [$req, 'integer', Rule::exists('patente_topics', 'id')],
            'is_true' => [$req, 'boolean'],
            // Provenance/licence of the question text: where it comes from and under what rights EXPA may use it.
            // Either the legacy note or the structured licence must be given when creating.
            'rights_note' => [$creating ? 'required_without:license_type' : 'sometimes', 'nullable', 'string', 'min:5', 'max:500'],
            'license_type' => ['sometimes', 'nullable', Rule::enum(LicenseType::class)],
            'rights_holder' => ['sometimes', 'nullable', 'string', 'max:255'],
            'license_proof_ref' => ['sometimes', 'nullable', 'string', 'max:500'],
        ];
    }

    protected function translationFieldRules(): array
    {
        return ['explanation' => ['nullable', 'string', 'max:3000']];
    }
}
