<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Domains\Learning\Models\ItalianVocabulary;
use App\Http\Controllers\Api\V1\Admin\Concerns\MarksTeacherReview;
use App\Http\Requests\ItalianVocabularyRequest;
use App\Http\Resources\AdminItalianVocabularyResource;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;

class ItalianVocabularyAdminController extends ContentAdminController
{
    use MarksTeacherReview;

    protected function modelClass(): string
    {
        return ItalianVocabulary::class;
    }

    protected function resourceClass(): string
    {
        return AdminItalianVocabularyResource::class;
    }

    protected function requestClass(): string
    {
        return ItalianVocabularyRequest::class;
    }

    protected function sortable(): array
    {
        return [...parent::sortable(), 'lemma', 'level', 'category', 'sort_order'];
    }

    protected function filterRules(): array
    {
        return ['filter.level' => ['nullable', 'in:a0,a1,a2,b1,b2,c1'], 'filter.category' => ['nullable', 'string', 'max:30'], 'filter.reviewed' => ['nullable', 'boolean']];
    }

    protected function applyFilters(Builder $query, Request $request): void
    {
        foreach (['level', 'category'] as $f) {
            if ($v = $request->input("filter.$f")) {
                $query->where($f, $v);
            }
        }
        if ($request->has('filter.reviewed')) {
            $request->boolean('filter.reviewed') ? $query->whereNotNull('reviewed_by_teacher_at') : $query->whereNull('reviewed_by_teacher_at');
        }
    }
}
