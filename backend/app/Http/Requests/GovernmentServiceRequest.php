<?php

namespace App\Http\Requests;

use App\Domains\Government\Enums\ServiceDomain;
use Illuminate\Validation\Rule;

class GovernmentServiceRequest extends ContentRequest
{
    protected function table(): string
    {
        return 'government_services';
    }

    protected function primaryField(): string
    {
        return 'name';
    }

    protected function plainTextAttributes(): array
    {
        return ['italian_term'];
    }

    protected function attributeRules(bool $creating): array
    {
        return [
            'domain' => [$creating ? 'required' : 'sometimes', Rule::enum(ServiceDomain::class)],
            'italian_term' => ['sometimes', 'nullable', 'string', 'max:255'],
            'guide_id' => ['sometimes', 'nullable', 'integer', Rule::exists('guides', 'id')],
            'office_ids' => ['sometimes', 'array', 'max:200'],
            'office_ids.*' => ['integer', 'distinct', Rule::exists('government_offices', 'id')],
        ];
    }

    protected function translationFieldRules(): array
    {
        return [
            'summary' => ['nullable', 'string', 'max:5000'],
            'how_to_apply' => ['nullable', 'string', 'max:10000'],
            'notes' => ['nullable', 'string', 'max:5000'],
            'required_documents' => ['nullable', 'array', 'max:50'],
            'required_documents.*' => ['string', 'max:300'],
        ];
    }
}
