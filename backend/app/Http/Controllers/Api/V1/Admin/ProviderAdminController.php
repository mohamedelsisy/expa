<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Domains\Marketplace\Models\ServiceProvider;
use App\Http\Requests\ProviderRequest;
use App\Http\Resources\AdminProviderResource;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;

/** Provider CRUD + lifecycle (standard content workflow). Verification, reviews and changes live in MarketplaceAdminController. */
class ProviderAdminController extends ContentAdminController
{
    protected function modelClass(): string
    {
        return ServiceProvider::class;
    }

    protected function resourceClass(): string
    {
        return AdminProviderResource::class;
    }

    protected function requestClass(): string
    {
        return ProviderRequest::class;
    }

    public function index(Request $request)
    {
        // Providers carry no content-source freshness (they have a verification expiry instead): ignore the generic stale filter.
        $filter = (array) $request->query('filter', []);
        unset($filter['stale']);
        $request->query->set('filter', $filter);

        return parent::index($request);
    }

    protected function sortable(): array
    {
        return ['id', 'slug', 'status', 'updated_at', 'verification_status', 'rating_avg'];
    }

    protected function filterRules(): array
    {
        return ['filter.category' => ['nullable', 'string', 'max:30'], 'filter.verification' => ['nullable', 'in:unverified,pending,verified']];
    }

    protected function applyFilters(Builder $query, Request $request): void
    {
        if ($c = $request->input('filter.category')) {
            $query->where('category', $c);
        }
        if ($v = $request->input('filter.verification')) {
            $query->where('verification_status', $v);
        }
    }
}
