<?php

namespace App\Http\Requests;

class PatenteTopicRequest extends ContentRequest
{
    protected function table(): string
    {
        return 'patente_topics';
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
        return [];
    }

    protected function translationFieldRules(): array
    {
        return ['summary' => ['nullable', 'string', 'max:3000'], 'body' => ['nullable', 'string', 'max:50000']];
    }
}
