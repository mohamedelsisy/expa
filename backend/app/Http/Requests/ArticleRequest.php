<?php

namespace App\Http\Requests;

use App\Domains\Articles\Enums\ArticleCategory;
use Illuminate\Validation\Rule;

class ArticleRequest extends ContentRequest
{
    protected function table(): string
    {
        return 'articles';
    }

    protected function primaryField(): string
    {
        return 'title';
    }

    protected function attributeRules(bool $creating): array
    {
        return [
            'category' => [$creating ? 'required' : 'sometimes', Rule::enum(ArticleCategory::class)],
            'author_name' => ['sometimes', 'nullable', 'string', 'max:120'],
            'cover_image_url' => ['sometimes', 'nullable', 'string', 'max:2048', 'url:https'],
            'reading_minutes' => ['sometimes', 'nullable', 'integer', 'min:1', 'max:240'],
            'tags' => ['sometimes', 'array', 'max:10'],
            'tags.*' => ['string', 'max:40', 'regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/', 'distinct'],
            'related_guides' => ['sometimes', 'array', 'max:10'],
            'related_guides.*' => ['string', Rule::exists('guides', 'slug'), 'distinct'],
        ];
    }

    protected function plainTextAttributes(): array
    {
        return ['author_name'];
    }

    protected function translationFieldRules(): array
    {
        return [
            'excerpt' => ['nullable', 'string', 'max:500'],
            'body' => ['nullable', 'string', 'max:60000'],
            'seo_title' => ['nullable', 'string', 'max:70'],
            'seo_description' => ['nullable', 'string', 'max:200'],
        ];
    }
}
