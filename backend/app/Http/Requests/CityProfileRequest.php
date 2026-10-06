<?php

namespace App\Http\Requests;

use App\Domains\Geo\Enums\CityBlockKey;
use App\Domains\Geo\Models\City;
use App\Enums\SourceType;
use Illuminate\Validation\Rule;

class CityProfileRequest extends ContentRequest
{
    protected function table(): string
    {
        return 'city_profiles';
    }

    protected function primaryField(): string
    {
        return 'headline';
    }

    protected function hasPlace(): bool
    {
        return false;
    }

    protected function prepareForValidation(): void
    {
        parent::prepareForValidation();
        // The profile slug mirrors its city's slug; the editor never types it.
        if ($this->isMethod('POST') && is_numeric($this->input('city_id'))) {
            $slug = City::whereKey($this->input('city_id'))->value('slug');
            if ($slug) {
                $this->merge(['slug' => $slug]);
            }
        }
        if (is_array($this->input('blocks'))) {
            $strip = fn ($v) => is_string($v) ? trim(strip_tags($v)) : (is_array($v) ? array_map(fn ($x) => is_string($x) ? trim(strip_tags($x)) : $x, $v) : $v);
            $blocks = array_map(function ($b) use ($strip) {
                if (! is_array($b)) {
                    return $b;
                }
                foreach (['source_name'] as $f) {
                    if (isset($b[$f])) {
                        $b[$f] = $strip($b[$f]);
                    }
                }
                if (isset($b['translations']) && is_array($b['translations'])) {
                    $b['translations'] = array_map(fn ($t) => is_array($t) ? array_map($strip, $t) : $t, $b['translations']);
                }

                return $b;
            }, $this->input('blocks'));
            $this->merge(['blocks' => $blocks]);
        }
    }

    protected function attributeRules(bool $creating): array
    {
        $locales = array_keys(config('expa.locales'));
        $rules = [
            'city_id' => $creating
                ? ['required', 'integer', Rule::exists('cities', 'id'), Rule::unique('city_profiles', 'city_id')]
                : ['prohibited'],
            'blocks' => ['sometimes', 'array', 'max:12'],
            'blocks.*' => ['array'],
            'blocks.*.key' => ['required', Rule::enum(CityBlockKey::class), 'distinct'],
            'blocks.*.info_type' => ['sometimes', Rule::in(['official_info', 'general_guidance'])],
            'blocks.*.sort_order' => ['sometimes', 'integer', 'min:0', 'max:1000'],
            'blocks.*.source_name' => ['sometimes', 'nullable', 'string', 'max:255'],
            'blocks.*.source_url' => ['sometimes', 'nullable', 'string', 'max:2048', 'url:https'],
            'blocks.*.source_type' => ['sometimes', 'nullable', Rule::enum(SourceType::class)],
            'blocks.*.last_verified_at' => ['sometimes', 'nullable', 'date', 'before_or_equal:today'],
            'blocks.*.translations' => ['required', 'array', 'min:1'],
        ];
        foreach ($locales as $l) {
            $rules["blocks.*.translations.$l"] = ['nullable', 'array'];
            $rules["blocks.*.translations.$l.title"] = ['required_with:blocks.*.translations.'.$l, 'string', 'max:200'];
            $rules["blocks.*.translations.$l.body"] = ['nullable', 'string', 'max:20000'];
        }

        return $rules;
    }

    protected function translationFieldRules(): array
    {
        return ['summary' => ['nullable', 'string', 'max:2000'], 'seo_description' => ['nullable', 'string', 'max:200']];
    }
}
