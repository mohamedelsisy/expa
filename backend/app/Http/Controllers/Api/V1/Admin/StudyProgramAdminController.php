<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Domains\Study\Models\StudyProgram;
use App\Http\Requests\StudyProgramRequest;
use App\Http\Resources\AdminStudyProgramResource;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;

class StudyProgramAdminController extends ContentAdminController
{
    protected function modelClass(): string
    {
        return StudyProgram::class;
    }

    protected function resourceClass(): string
    {
        return AdminStudyProgramResource::class;
    }

    protected function requestClass(): string
    {
        return StudyProgramRequest::class;
    }

    protected function filterRules(): array
    {
        return ['filter.university_id' => ['nullable', 'integer'], 'filter.degree_level' => ['nullable', 'string', 'max:20']];
    }

    protected function applyFilters(Builder $query, Request $request): void
    {
        foreach (['university_id', 'degree_level'] as $f) {
            if ($v = $request->input("filter.$f")) {
                $query->where($f, $v);
            }
        }
    }
}
