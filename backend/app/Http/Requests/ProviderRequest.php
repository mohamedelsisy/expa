<?php

namespace App\Http\Requests;

use App\Http\Requests\Concerns\ProviderFieldRules;
use Illuminate\Validation\Rule;

/** Admin create/update of a provider listing (includes admin-only fields: slug, owner, commission). */
class ProviderRequest extends ContentRequest
{
    use ProviderFieldRules;

    protected function table(): string
    {
        return 'service_providers';
    }

    protected function primaryField(): string
    {
        return 'headline';
    }

    protected function prepareForValidation(): void
    {
        parent::prepareForValidation();
        $this->stripProviderText();
    }

    protected function attributeRules(bool $creating): array
    {
        return array_diff_key($this->providerRules($creating), ['region_id' => 1, 'city_id' => 1]) + [
            'commission_percent' => ['sometimes', 'nullable', 'numeric', 'min:0', 'max:100'],
            'commission_note' => ['sometimes', 'nullable', 'string', 'max:255'],
            'owner_user_id' => ['sometimes', 'integer', Rule::exists('users', 'id'), Rule::unique('service_providers', 'user_id')->ignore($this->routeItemId())],
        ];
    }

    protected function translationFieldRules(): array
    {
        return ['description' => ['nullable', 'string', 'max:5000'], 'availability_note' => ['nullable', 'string', 'max:500']];
    }

    protected function plainTextAttributes(): array
    {
        return ['display_name', 'commission_note'];
    }
}
