<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Domains\Government\Enums\ServiceDomain;
use App\Domains\Government\Models\GovernmentService;
use App\Http\Requests\GovernmentServiceRequest;
use App\Http\Resources\AdminGovernmentServiceResource;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class GovernmentServiceAdminController extends ContentAdminController
{
    protected function modelClass(): string
    {
        return GovernmentService::class;
    }

    protected function resourceClass(): string
    {
        return AdminGovernmentServiceResource::class;
    }

    protected function requestClass(): string
    {
        return GovernmentServiceRequest::class;
    }

    protected function with(): array
    {
        return ['translations', 'offices'];
    }

    protected function filterRules(): array
    {
        return ['filter.domain' => ['nullable', Rule::enum(ServiceDomain::class)]];
    }

    protected function applyFilters(Builder $query, Request $request): void
    {
        if ($d = $request->input('filter.domain')) {
            $query->where('domain', $d);
        }
    }
}
