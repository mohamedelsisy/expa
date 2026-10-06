<?php

namespace App\Http\Requests;

use App\Domains\Learning\Enums\Scenario;
use App\Domains\Profile\Enums\CefrLevel;
use Illuminate\Validation\Rule;

class ItalianVocabularyRequest extends ContentRequest
{
    protected function table(): string
    {
        return 'italian_vocabularies';
    }

    protected function primaryField(): string
    {
        return 'gloss';
    }

    protected function hasPlace(): bool
    {
        return false;
    }

    protected function plainTextAttributes(): array
    {
        return ['lemma', 'example_it', 'audio_rights_note'];
    }

    public static function categories(): array
    {
        return [...array_map(fn ($s) => $s->value, Scenario::cases()), ...config('learning.vocabulary_extra_categories')];
    }

    protected function attributeRules(bool $creating): array
    {
        $req = $creating ? 'required' : 'sometimes';

        return [
            'lemma' => [$req, 'string', 'max:150'],
            'part_of_speech' => ['sometimes', 'nullable', Rule::in(['noun', 'verb', 'adjective', 'adverb', 'phrase', 'preposition', 'other'])],
            'level' => [$req, Rule::enum(CefrLevel::class)->only([CefrLevel::A0, CefrLevel::A1, CefrLevel::A2, CefrLevel::B1, CefrLevel::B2, CefrLevel::C1])],
            'category' => ['sometimes', 'nullable', Rule::in(self::categories())],
            'example_it' => ['sometimes', 'nullable', 'string', 'max:500'],
            'audio_url' => ['sometimes', 'nullable', 'string', 'max:2048', 'url:https'],
            'audio_rights_note' => ['sometimes', 'nullable', 'string', 'max:500'],
        ];
    }

    protected function translationFieldRules(): array
    {
        return ['example_gloss' => ['nullable', 'string', 'max:500']];
    }
}
