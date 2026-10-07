<?php

namespace App\Http\Requests;

class TaxTableRequest extends ContentRequest
{
    protected function table(): string
    {
        return 'tax_tables';
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
        $req = $creating ? 'required' : 'sometimes';

        return [
            'tax_year' => [$req, 'integer', 'min:2000', 'max:2100'],
            'contribution_rate' => ['sometimes', 'nullable', 'numeric', 'min:0', 'max:100'],
            'contribution_ceiling' => ['sometimes', 'nullable', 'numeric', 'min:0', 'max:100000000'],
            'deduction_flat' => ['sometimes', 'numeric', 'min:0', 'max:100000000'],
            'brackets' => [$req, 'array', 'min:1', 'max:20'],
            'brackets.*.up_to' => ['nullable', 'numeric', 'min:0', 'max:1000000000'],
            'brackets.*.rate' => ['required', 'numeric', 'min:0', 'max:100'],
        ];
    }

    protected function translationFieldRules(): array
    {
        return ['notes' => ['nullable', 'string', 'max:3000']];
    }
}
