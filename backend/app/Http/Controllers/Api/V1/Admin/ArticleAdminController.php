<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Domains\Articles\Models\Article;
use App\Http\Requests\ArticleRequest;
use App\Http\Resources\AdminArticleResource;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;

class ArticleAdminController extends ContentAdminController
{
    protected function modelClass(): string
    {
        return Article::class;
    }

    protected function resourceClass(): string
    {
        return AdminArticleResource::class;
    }

    protected function requestClass(): string
    {
        return ArticleRequest::class;
    }

    protected function filterRules(): array
    {
        return ['filter.category' => ['nullable', 'string', 'max:30']];
    }

    protected function applyFilters(Builder $query, Request $request): void
    {
        if ($c = $request->input('filter.category')) {
            $query->where('category', $c);
        }
    }
}
