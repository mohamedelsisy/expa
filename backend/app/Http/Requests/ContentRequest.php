<?php

namespace App\Http\Requests;

use App\Domains\Geo\Models\City;
use App\Enums\SourceType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * Shared validation for lifecycle content. Subclasses supply the table, the primary translated field,
 * module-specific attribute rules and per-translation field rules.
 */
abstract class ContentRequest extends FormRequest
{
    abstract protected function table(): string;

    /** Translated field that must be present in every supplied locale (title / name). */
    abstract protected function primaryField(): string;

    /** @return array<string,mixed> module-specific rules for non-translated attributes */
    abstract protected function attributeRules(bool $creating): array;

    /** @return array<string,mixed> field => rules, for one locale (without the `translations.{locale}.` prefix) */
    abstract protected function translationFieldRules(): array;

    protected function primaryMax(): int
    {
        return 255;
    }

    protected function hasPlace(): bool
    {
        return true;
    }

    protected function routeItemId(): ?int
    {
        $id = $this->route('id');

        return $id === null ? null : (int) $id;
    }

    public function rules(): array
    {
        $creating = $this->isMethod('POST');
        $req = $creating ? 'required' : 'sometimes';

        $rules = [
            'slug' => [$req, 'string', 'max:120', 'regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/', Rule::unique($this->table(), 'slug')->ignore($this->routeItemId())],
            'sort_order' => ['sometimes', 'integer', 'min:0', 'max:100000'],
            'source_name' => ['sometimes', 'nullable', 'string', 'max:255'],
            'source_url' => ['sometimes', 'nullable', 'string', 'max:2048', 'url:https'],
            'source_type' => ['sometimes', 'nullable', Rule::enum(SourceType::class)],
            'last_verified_at' => ['sometimes', 'nullable', 'date', 'before_or_equal:today'],
            'translations' => [$req, 'array', 'min:1'],
        ];
        if ($this->hasPlace()) {
            $rules['region_id'] = ['sometimes', 'nullable', 'integer', Rule::exists('regions', 'id')];
            $rules['city_id'] = ['sometimes', 'nullable', 'integer', Rule::exists('cities', 'id')];
        }
        $rules += $this->attributeRules($creating);

        foreach (array_keys(config('expa.locales')) as $locale) {
            $p = "translations.$locale";
            $rules[$p] = ['nullable', 'array'];
            $rules["$p.{$this->primaryField()}"] = ['required_with:'.$p, 'string', 'max:'.$this->primaryMax()];
            foreach ($this->translationFieldRules() as $field => $fieldRules) {
                $rules["$p.$field"] = $fieldRules;
            }
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

            if ($this->hasPlace()) {
                $cityId = $this->input('city_id');
                $regionId = $this->input('region_id');
                if ($cityId && $regionId && ! $v->errors()->hasAny(['city_id', 'region_id'])
                    && City::whereKey($cityId)->value('region_id') !== (int) $regionId) {
                    $v->errors()->add('city_id', __('errors.region_city_mismatch'));
                }
            }
            // Creating content with no usable translation would produce an empty, unpublishable shell.
            if ($this->isMethod('POST') && ! $v->errors()->has('translations')
                && ! collect((array) $this->input('translations', []))->contains(fn ($t) => is_array($t) && $t !== [])) {
                $v->errors()->add('translations', __('validation.required', ['attribute' => 'translations']));
            }
            $this->afterValidation($v);
        });
    }

    protected function afterValidation($validator): void {}

    /** Markdown/plain text only: every string inside `translations` and the source name is stripped of HTML. */
    protected function prepareForValidation(): void
    {
        $strip = function ($value) use (&$strip) {
            if (is_string($value)) {
                return trim(strip_tags($value));
            }

            return is_array($value) ? array_map($strip, $value) : $value;
        };

        if (is_array($this->input('translations'))) {
            $this->merge(['translations' => $strip($this->input('translations'))]);
        }
        foreach (array_merge(['source_name'], $this->plainTextAttributes()) as $f) {
            if (is_string($this->input($f))) {
                $this->merge([$f => $strip($this->input($f))]);
            }
        }
    }

    /** @return list<string> extra non-translated free-text attributes to strip */
    protected function plainTextAttributes(): array
    {
        return [];
    }
}
