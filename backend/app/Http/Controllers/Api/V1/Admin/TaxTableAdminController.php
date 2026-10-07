<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Domains\Money\Models\TaxTable;
use App\Http\Requests\TaxTableRequest;
use App\Http\Resources\AdminTaxTableResource;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;

class TaxTableAdminController extends ContentAdminController
{
    protected function modelClass(): string
    {
        return TaxTable::class;
    }

    protected function resourceClass(): string
    {
        return AdminTaxTableResource::class;
    }

    protected function requestClass(): string
    {
        return TaxTableRequest::class;
    }

    protected function filterRules(): array
    {
        return ['filter.tax_year' => ['nullable', 'integer']];
    }

    protected function applyFilters(Builder $query, Request $request): void
    {
        if ($y = $request->input('filter.tax_year')) {
            $query->where('tax_year', $y);
        }
    }
}
