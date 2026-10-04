<?php

namespace App\Http\Requests;

use App\Domains\Government\Enums\BookingMethod;
use App\Domains\Government\Enums\OfficeType;
use Illuminate\Validation\Rule;

class GovernmentOfficeRequest extends ContentRequest
{
    protected function table(): string
    {
        return 'government_offices';
    }

    protected function primaryField(): string
    {
        return 'name';
    }

    protected function plainTextAttributes(): array
    {
        return ['address', 'phone'];
    }

    protected function attributeRules(bool $creating): array
    {
        return [
            'office_type' => [$creating ? 'required' : 'sometimes', Rule::enum(OfficeType::class)],
            'booking_method' => ['sometimes', Rule::enum(BookingMethod::class)],
            'address' => ['sometimes', 'nullable', 'string', 'max:255'],
            'postal_code' => ['sometimes', 'nullable', 'string', 'regex:/^\d{5}$/'],
            'phone' => ['sometimes', 'nullable', 'string', 'max:40', 'regex:/^[+0-9 ().\/-]+$/'],
            'email' => ['sometimes', 'nullable', 'email:rfc', 'max:255'],
            'official_url' => ['sometimes', 'nullable', 'string', 'max:2048', 'url:https'],
            'booking_url' => ['sometimes', 'nullable', 'string', 'max:2048', 'url:https'],
        ];
    }

    protected function translationFieldRules(): array
    {
        return [
            'opening_hours' => ['nullable', 'string', 'max:2000'],
            'notes' => ['nullable', 'string', 'max:5000'],
        ];
    }
}
