<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Domains\Government\Enums\OfficeType;
use App\Domains\Government\Models\GovernmentOffice;
use App\Http\Requests\GovernmentOfficeRequest;
use App\Http\Resources\AdminGovernmentOfficeResource;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class GovernmentOfficeAdminController extends ContentAdminController
{
    protected function modelClass(): string
    {
        return GovernmentOffice::class;
    }

    protected function resourceClass(): string
    {
        return AdminGovernmentOfficeResource::class;
    }

    protected function requestClass(): string
    {
        return GovernmentOfficeRequest::class;
    }

    protected function filterRules(): array
    {
        return ['filter.office_type' => ['nullable', Rule::enum(OfficeType::class)], 'filter.city_id' => ['nullable', 'integer']];
    }

    protected function applyFilters(Builder $query, Request $request): void
    {
        if ($t = $request->input('filter.office_type')) {
            $query->where('office_type', $t);
        }
        if ($c = $request->input('filter.city_id')) {
            $query->where('city_id', $c);
        }
    }
}
