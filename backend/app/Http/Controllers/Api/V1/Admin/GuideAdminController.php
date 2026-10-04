<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Domains\Guides\Enums\GuideCategory;
use App\Domains\Guides\Models\Guide;
use App\Http\Requests\GuideRequest;
use App\Http\Resources\AdminGuideResource;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class GuideAdminController extends ContentAdminController
{
    protected function modelClass(): string
    {
        return Guide::class;
    }

    protected function resourceClass(): string
    {
        return AdminGuideResource::class;
    }

    protected function requestClass(): string
    {
        return GuideRequest::class;
    }

    protected function sortable(): array
    {
        return [...parent::sortable(), 'category'];
    }

    protected function filterRules(): array
    {
        return ['filter.category' => ['nullable', Rule::enum(GuideCategory::class)]];
    }

    protected function applyFilters(Builder $query, Request $request): void
    {
        if ($c = $request->input('filter.category')) {
            $query->where('category', $c);
        }
    }
}
