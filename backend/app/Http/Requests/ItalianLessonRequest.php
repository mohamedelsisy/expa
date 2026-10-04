<?php

namespace App\Http\Requests;

use App\Domains\Learning\Enums\LessonType;
use App\Domains\Learning\Enums\Scenario;
use App\Domains\Profile\Enums\CefrLevel;
use Illuminate\Validation\Rule;

class ItalianLessonRequest extends ContentRequest
{
    private const ITEM_KEYS = ['it', 'gloss', 'example_it', 'example_gloss', 'speaker', 'tip', 'phonetic'];

    protected function table(): string
    {
        return 'italian_lessons';
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
            'level' => [$req, Rule::enum(CefrLevel::class)->only([CefrLevel::A0, CefrLevel::A1, CefrLevel::A2, CefrLevel::B1, CefrLevel::B2, CefrLevel::C1])],
            'type' => [$req, Rule::enum(LessonType::class)],
            'scenario' => ['sometimes', 'nullable', Rule::enum(Scenario::class)],
            'duration_minutes' => ['sometimes', 'integer', 'min:1', 'max:30'],
        ];
    }

    protected function translationFieldRules(): array
    {
        return [
            'summary' => ['nullable', 'string', 'max:2000'],
            'body' => ['nullable', 'string', 'max:20000'],
            'items' => ['nullable', 'array', 'max:100'],
            'items.*' => ['array'],
            'items.*.it' => ['required', 'string', 'max:500'],
            'items.*.gloss' => ['nullable', 'string', 'max:500'],
            'items.*.example_it' => ['nullable', 'string', 'max:500'],
            'items.*.example_gloss' => ['nullable', 'string', 'max:500'],
            'items.*.speaker' => ['nullable', 'string', 'max:50'],
            'items.*.tip' => ['nullable', 'string', 'max:500'],
            'items.*.phonetic' => ['nullable', 'string', 'max:200'],
        ];
    }

    protected function afterValidation($validator): void
    {
        foreach ((array) $this->input('translations', []) as $locale => $t) {
            foreach ((array) ($t['items'] ?? []) as $i => $item) {
                if (is_array($item) && array_diff(array_keys($item), self::ITEM_KEYS)) {
                    $validator->errors()->add("translations.$locale.items.$i", __('validation.prohibited', ['attribute' => 'items']));
                }
            }
        }
    }
}
