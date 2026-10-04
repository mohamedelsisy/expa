<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Domains\Learning\Enums\LessonType;
use App\Domains\Learning\Models\ItalianLesson;
use App\Http\Requests\ItalianLessonRequest;
use App\Http\Resources\AdminItalianLessonResource;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ItalianLessonAdminController extends ContentAdminController
{
    protected function modelClass(): string
    {
        return ItalianLesson::class;
    }

    protected function resourceClass(): string
    {
        return AdminItalianLessonResource::class;
    }

    protected function requestClass(): string
    {
        return ItalianLessonRequest::class;
    }

    protected function sortable(): array
    {
        return [...parent::sortable(), 'level', 'type', 'sort_order'];
    }

    protected function filterRules(): array
    {
        return ['filter.level' => ['nullable', 'in:a0,a1,a2,b1,b2,c1'], 'filter.type' => ['nullable', Rule::enum(LessonType::class)]];
    }

    protected function applyFilters(Builder $query, Request $request): void
    {
        foreach (['level', 'type'] as $f) {
            if ($v = $request->input("filter.$f")) {
                $query->where($f, $v);
            }
        }
    }
}
