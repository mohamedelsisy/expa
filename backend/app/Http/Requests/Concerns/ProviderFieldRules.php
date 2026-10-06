<?php

namespace App\Http\Requests\Concerns;

use App\Domains\Marketplace\Enums\ProviderCategory;
use Illuminate\Validation\Rule;

/** Validation shared by the admin and the owner (provider) requests for a provider listing. */
trait ProviderFieldRules
{
    /** @return array<string,mixed> */
    protected function providerRules(bool $creating): array
    {
        $req = $creating ? 'required' : 'sometimes';

        return [
            'category' => [$req, Rule::enum(ProviderCategory::class)],
            'display_name' => [$req, 'string', 'max:160'],
            'region_id' => ['sometimes', 'nullable', 'integer', Rule::exists('regions', 'id')],
            'city_id' => ['sometimes', 'nullable', 'integer', Rule::exists('cities', 'id')],
            'serves_online' => ['sometimes', 'boolean'],
            'languages' => ['sometimes', 'array', 'max:'.config('marketplace.languages_max')],
            'languages.*' => ['string', 'regex:/^[a-z]{2}$/', 'distinct'],
            'contact_email' => ['sometimes', 'nullable', 'email:rfc', 'max:190'],
            'contact_phone' => ['sometimes', 'nullable', 'string', 'regex:/^\+?[0-9 ()\-]{6,25}$/'],
            'website' => ['sometimes', 'nullable', 'string', 'max:2048', 'url:https'],
            'show_email' => ['sometimes', 'boolean'],
            'show_phone' => ['sometimes', 'boolean'],
            'show_website' => ['sometimes', 'boolean'],
            'areas' => ['sometimes', 'array', 'max:'.config('marketplace.areas_max')],
            'areas.*' => ['array'],
            'areas.*.region_id' => ['nullable', 'integer', Rule::exists('regions', 'id')],
            'areas.*.city_id' => ['nullable', 'integer', Rule::exists('cities', 'id')],
            'services' => ['sometimes', 'array', 'max:'.config('marketplace.services_max')],
            'services.*' => ['array'],
            'services.*.price_from_eur' => ['nullable', 'integer', 'min:0', 'max:1000000'],
            'services.*.translations' => ['required', 'array', 'min:1'],
            'services.*.translations.*' => ['nullable', 'array'],
            'services.*.translations.*.name' => ['required_with:services.*.translations.*', 'string', 'max:160'],
            'services.*.translations.*.description' => ['nullable', 'string', 'max:1000'],
        ];
    }

    /** Text only: HTML is stripped from every free-text field, including nested service translations. */
    protected function stripProviderText(): void
    {
        $strip = function ($v) use (&$strip) {
            if (is_string($v)) {
                return trim(preg_replace('/\]\(\s*(?!https?:|mailto:|tel:|\/|#|\.)[a-z][a-z0-9+.\-]*:[^)]*\)/i', '](#)', strip_tags($v)) ?? '');
            }

            return is_array($v) ? array_map($strip, $v) : $v;
        };
        foreach (['display_name', 'translations', 'services'] as $f) {
            if ($this->has($f)) {
                $this->merge([$f => $strip($this->input($f))]);
            }
        }
    }

    protected function providerTranslationRules(): array
    {
        $rules = [];
        foreach (array_keys(config('expa.locales')) as $l) {
            $rules["translations.$l"] = ['nullable', 'array'];
            $rules["translations.$l.headline"] = ['required_with:translations.'.$l, 'string', 'max:200'];
            $rules["translations.$l.description"] = ['nullable', 'string', 'max:5000'];
            $rules["translations.$l.availability_note"] = ['nullable', 'string', 'max:500'];
        }

        return ['translations' => ['sometimes', 'array']] + $rules;
    }
}
