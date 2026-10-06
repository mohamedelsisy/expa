<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Domains\Legal\Models\LegalDocument;
use App\Http\Requests\LegalDocumentRequest;
use App\Http\Resources\AdminLegalDocumentResource;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;

class LegalDocumentAdminController extends ContentAdminController
{
    protected function modelClass(): string
    {
        return LegalDocument::class;
    }

    protected function resourceClass(): string
    {
        return AdminLegalDocumentResource::class;
    }

    protected function requestClass(): string
    {
        return LegalDocumentRequest::class;
    }

    protected function sortable(): array
    {
        return ['id', 'slug', 'version', 'status', 'updated_at', 'published_at'];
    }

    protected function filterRules(): array
    {
        return ['filter.slug' => ['nullable', 'string', 'max:40']];
    }

    protected function applyFilters(Builder $query, Request $request): void
    {
        if ($slug = $request->input('filter.slug')) {
            $query->where('slug', $slug);
        }
    }
}
