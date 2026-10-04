<?php

namespace App\Http\Requests;

use App\Domains\Government\Enums\BookingMethod;
use App\Domains\Government\Enums\OfficeType;
use Illuminate\Validation\Rule;

class AppointmentGuideRequest extends ContentRequest
{
    protected function table(): string
    {
        return 'appointment_guides';
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
        return [
            'office_type' => [$creating ? 'required' : 'sometimes', Rule::enum(OfficeType::class)],
            'booking_method' => ['sometimes', Rule::enum(BookingMethod::class)],
            'booking_portal_url' => ['sometimes', 'nullable', 'string', 'max:2048', 'url:https'],
        ];
    }

    protected function translationFieldRules(): array
    {
        return [
            'summary' => ['nullable', 'string', 'max:5000'],
            'tips' => ['nullable', 'string', 'max:5000'],
            'cautions' => ['nullable', 'string', 'max:5000'],
            'steps' => ['nullable', 'array', 'max:50'],
            'steps.*.title' => ['required', 'string', 'max:200'],
            'steps.*.text' => ['nullable', 'string', 'max:1500'],
        ];
    }
}
