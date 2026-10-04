<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Domains\Patente\Models\PatenteQuestion;
use App\Http\Requests\PatenteQuestionRequest;
use App\Http\Resources\AdminPatenteQuestionResource;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;

class PatenteQuestionAdminController extends ContentAdminController
{
    protected function modelClass(): string
    {
        return PatenteQuestion::class;
    }

    protected function resourceClass(): string
    {
        return AdminPatenteQuestionResource::class;
    }

    protected function requestClass(): string
    {
        return PatenteQuestionRequest::class;
    }

    protected function filterRules(): array
    {
        return ['filter.topic_id' => ['nullable', 'integer']];
    }

    protected function applyFilters(Builder $query, Request $request): void
    {
        if ($t = $request->input('filter.topic_id')) {
            $query->where('patente_topic_id', $t);
        }
    }
}
