<?php

namespace App\Http\Requests;

class TravelRequirementRequest extends ContentRequest
{
    protected function table(): string
    {
        return 'travel_requirements';
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

        return [
            'nationality' => [$req, 'string', 'regex:/^([A-Z]{2}|\*)$/'],
            'destination' => [$req, 'string', 'regex:/^[A-Z]{2}$/'],
            'residence_status' => ['sometimes', 'string', 'regex:/^[a-z_]{2,40}$/'],
        ];
    }

    protected function translationFieldRules(): array
    {
        return ['summary' => ['nullable', 'string', 'max:1000'], 'requirements' => ['nullable', 'string', 'max:5000'], 'notes' => ['nullable', 'string', 'max:3000']];
    }
}
