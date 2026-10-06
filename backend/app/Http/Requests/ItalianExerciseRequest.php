<?php

namespace App\Http\Requests;

use App\Domains\Learning\Enums\ExerciseType;
use App\Domains\Learning\Enums\Scenario;
use App\Domains\Profile\Enums\CefrLevel;
use Illuminate\Validation\Rule;

class ItalianExerciseRequest extends ContentRequest
{
    protected function table(): string
    {
        return 'italian_exercises';
    }

    protected function primaryField(): string
    {
        return 'prompt';
    }

    protected function hasPlace(): bool
    {
        return false;
    }

    protected function plainTextAttributes(): array
    {
        return ['audio_rights_note'];
    }

    protected function attributeRules(bool $creating): array
    {
        $req = $creating ? 'required' : 'sometimes';

        return [
            'type' => [$req, Rule::enum(ExerciseType::class)],
            'level' => [$req, Rule::enum(CefrLevel::class)->only([CefrLevel::A0, CefrLevel::A1, CefrLevel::A2, CefrLevel::B1, CefrLevel::B2, CefrLevel::C1])],
            'scenario' => ['sometimes', 'nullable', Rule::enum(Scenario::class)],
            'italian_vocabulary_id' => ['sometimes', 'nullable', 'integer', Rule::exists('italian_vocabularies', 'id')],
            'content' => [$req, 'array'],
            'content.stem' => ['nullable', 'string', 'max:300'],
            'content.sentence' => ['nullable', 'string', 'max:500'],
            'content.choices' => ['nullable', 'array', 'min:2', 'max:8'],
            'content.choices.*' => ['string', 'max:200'],
            'content.correct_index' => ['nullable', 'integer', 'min:0', 'max:7'],
            'content.answers' => ['nullable', 'array', 'min:1', 'max:10'],
            'content.answers.*' => ['string', 'max:100'],
            'content.left' => ['nullable', 'array', 'min:2', 'max:10'],
            'content.left.*' => ['string', 'max:100'],
            'audio_url' => ['sometimes', 'nullable', 'string', 'max:2048', 'url:https'],
            'audio_rights_note' => ['sometimes', 'nullable', 'string', 'max:500'],
        ];
    }

    protected function translationFieldRules(): array
    {
        return ['explanation' => ['nullable', 'string', 'max:2000'], 'options' => ['nullable', 'array', 'max:10'], 'options.*' => ['string', 'max:200']];
    }

    protected function afterValidation($validator): void
    {
        // Only known keys inside `content`: it is never rendered raw, but the shape is part of the contract.
        $unknown = array_diff(array_keys((array) $this->input('content', [])), ['stem', 'sentence', 'choices', 'correct_index', 'answers', 'left']);
        foreach ($unknown as $k) {
            $validator->errors()->add("content.$k", __('validation.prohibited', ['attribute' => $k]));
        }
    }
}
