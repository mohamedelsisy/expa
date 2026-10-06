<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Domains\Learning\Enums\ExerciseType;
use App\Domains\Learning\Models\ItalianExercise;
use App\Http\Controllers\Api\V1\Admin\Concerns\MarksTeacherReview;
use App\Http\Requests\ItalianExerciseRequest;
use App\Http\Resources\AdminItalianExerciseResource;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ItalianExerciseAdminController extends ContentAdminController
{
    use MarksTeacherReview;

    protected function modelClass(): string
    {
        return ItalianExercise::class;
    }

    protected function resourceClass(): string
    {
        return AdminItalianExerciseResource::class;
    }

    protected function requestClass(): string
    {
        return ItalianExerciseRequest::class;
    }

    protected function sortable(): array
    {
        return [...parent::sortable(), 'type', 'level', 'sort_order'];
    }

    protected function filterRules(): array
    {
        return ['filter.level' => ['nullable', 'in:a0,a1,a2,b1,b2,c1'], 'filter.type' => ['nullable', Rule::enum(ExerciseType::class)], 'filter.reviewed' => ['nullable', 'boolean']];
    }

    protected function applyFilters(Builder $query, Request $request): void
    {
        foreach (['level', 'type'] as $f) {
            if ($v = $request->input("filter.$f")) {
                $query->where($f, $v);
            }
        }
        if ($request->has('filter.reviewed')) {
            $request->boolean('filter.reviewed') ? $query->whereNotNull('reviewed_by_teacher_at') : $query->whereNull('reviewed_by_teacher_at');
        }
    }
}
