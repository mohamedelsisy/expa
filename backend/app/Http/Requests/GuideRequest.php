<?php

namespace App\Http\Requests;

use App\Domains\Geo\Models\City;
use App\Domains\Guides\Enums\GuideCategory;
use App\Enums\SourceType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class GuideRequest extends FormRequest
{
    /** Text fields: markdown allowed, HTML is stripped. */
    private const TEXT_FIELDS = ['title', 'summary', 'what_is', 'who_needs', 'where_to_apply', 'how_to_book', 'costs', 'processing_time', 'body'];

    public function rules(): array
    {
        $creating = $this->isMethod('POST');
        $req = $creating ? 'required' : 'sometimes';
        $guide = $this->route('guide');

        $rules = [
            'slug' => [$req, 'string', 'max:120', 'regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/', Rule::unique('guides', 'slug')->ignore($guide?->id)],
            'category' => [$req, Rule::enum(GuideCategory::class)],
            'italian_term' => ['sometimes', 'nullable', 'string', 'max:255'],
            'region_id' => ['sometimes', 'nullable', 'integer', Rule::exists('regions', 'id')],
            'city_id' => ['sometimes', 'nullable', 'integer', Rule::exists('cities', 'id')],
            'sort_order' => ['sometimes', 'integer', 'min:0', 'max:100000'],
            'source_name' => ['sometimes', 'nullable', 'string', 'max:255'],
            'source_url' => ['sometimes', 'nullable', 'string', 'max:2048', 'url:https'],
            'source_type' => ['sometimes', 'nullable', Rule::enum(SourceType::class)],
            'last_verified_at' => ['sometimes', 'nullable', 'date', 'before_or_equal:today'],
            'translations' => [$req, 'array', 'min:1'],
        ];

        foreach (array_keys(config('expa.locales')) as $locale) {
            $p = "translations.$locale";
            $rules[$p] = ['nullable', 'array'];
            $rules["$p.title"] = ['required_with:'.$p, 'string', 'max:255'];
            foreach (['summary', 'what_is', 'who_needs', 'where_to_apply', 'how_to_book', 'costs'] as $f) {
                $rules["$p.$f"] = ['nullable', 'string', 'max:5000'];
            }
            $rules["$p.processing_time"] = ['nullable', 'string', 'max:255'];
            $rules["$p.body"] = ['nullable', 'string', 'max:50000'];
            $rules["$p.required_documents"] = ['nullable', 'array', 'max:50'];
            $rules["$p.required_documents.*"] = ['string', 'max:300'];
            $rules["$p.steps"] = ['nullable', 'array', 'max:50'];
            $rules["$p.steps.*.title"] = ['required', 'string', 'max:200'];
            $rules["$p.steps.*.text"] = ['nullable', 'string', 'max:1500'];
        }

        return $rules;
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($v) {
            $unknown = array_diff(array_keys((array) $this->input('translations', [])), array_keys(config('expa.locales')));
            foreach ($unknown as $locale) {
                $v->errors()->add("translations.$locale", __('validation.in', ['attribute' => 'locale']));
            }

            $cityId = $this->input('city_id', $this->route('guide')?->city_id);
            $regionId = $this->input('region_id', $this->route('guide')?->region_id);
            if ($cityId && $regionId && ! $v->errors()->hasAny(['city_id', 'region_id'])
                && City::whereKey($cityId)->value('region_id') !== (int) $regionId) {
                $v->errors()->add('city_id', __('errors.region_city_mismatch'));
            }
        });
    }

    protected function prepareForValidation(): void
    {
        $translations = $this->input('translations');
        if (is_array($translations)) {
            foreach ($translations as $locale => $fields) {
                if (! is_array($fields)) {
                    continue;
                }
                foreach (self::TEXT_FIELDS as $f) {
                    if (isset($fields[$f]) && is_string($fields[$f])) {
                        $translations[$locale][$f] = trim(strip_tags($fields[$f]));
                    }
                }
                foreach (['required_documents'] as $f) {
                    if (isset($fields[$f]) && is_array($fields[$f])) {
                        $translations[$locale][$f] = array_map(fn ($x) => is_string($x) ? trim(strip_tags($x)) : $x, $fields[$f]);
                    }
                }
                if (isset($fields['steps']) && is_array($fields['steps'])) {
                    $translations[$locale]['steps'] = array_map(fn ($s) => is_array($s) ? array_map(fn ($x) => is_string($x) ? trim(strip_tags($x)) : $x, $s) : $s, $fields['steps']);
                }
            }
            $this->merge(['translations' => $translations]);
        }
        foreach (['source_name', 'italian_term'] as $f) {
            if (is_string($this->input($f))) {
                $this->merge([$f => trim(strip_tags($this->input($f)))]);
            }
        }
    }
}
