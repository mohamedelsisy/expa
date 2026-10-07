<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Domains\Travel\Models\TravelRequirement;
use App\Http\Requests\TravelRequirementRequest;
use App\Http\Resources\AdminTravelRequirementResource;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;

class TravelRequirementAdminController extends ContentAdminController
{
    protected function modelClass(): string
    {
        return TravelRequirement::class;
    }

    protected function resourceClass(): string
    {
        return AdminTravelRequirementResource::class;
    }

    protected function requestClass(): string
    {
        return TravelRequirementRequest::class;
    }

    protected function filterRules(): array
    {
        return ['filter.nationality' => ['nullable', 'string', 'max:2'], 'filter.destination' => ['nullable', 'string', 'max:2']];
    }

    protected function applyFilters(Builder $query, Request $request): void
    {
        foreach (['nationality', 'destination'] as $f) {
            if ($v = $request->input("filter.$f")) {
                $query->where($f, strtoupper($v));
            }
        }
    }
}
