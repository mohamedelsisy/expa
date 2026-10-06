<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Domains\Housing\Models\HousingRule;
use App\Domains\Housing\Services\HousingExtractor;
use App\Http\Requests\HousingRuleRequest;
use App\Http\Resources\AdminHousingRuleResource;
use App\Support\ApiResponse;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class HousingRuleAdminController extends ContentAdminController
{
    protected function modelClass(): string
    {
        return HousingRule::class;
    }

    protected function resourceClass(): string
    {
        return AdminHousingRuleResource::class;
    }

    protected function requestClass(): string
    {
        return HousingRuleRequest::class;
    }

    protected function filterRules(): array
    {
        return ['filter.kind' => ['nullable', 'string', 'max:12'], 'filter.signal' => ['nullable', 'string', 'max:40']];
    }

    protected function applyFilters(Builder $query, Request $request): void
    {
        foreach (['kind', 'signal'] as $f) {
            if ($v = $request->input("filter.$f")) {
                $query->where($f, $v);
            }
        }
    }

    /** Vocabulary the editor form needs: signals the extractor can produce and the allowed options. */
    public function meta()
    {
        Gate::authorize('viewAny', HousingRule::class);

        return ApiResponse::data([
            'signals' => ['boolean' => HousingExtractor::BOOL_SIGNALS, 'numeric' => HousingExtractor::NUMERIC_SIGNALS],
            'kinds' => HousingRule::KINDS, 'conditions' => HousingRule::CONDITIONS, 'severities' => HousingRule::SEVERITIES, 'bases' => HousingRule::BASES,
        ]);
    }
}
