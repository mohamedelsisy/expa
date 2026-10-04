<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Domains\Patente\Models\PatenteCategory;
use App\Http\Requests\PatenteCategoryRequest;
use App\Http\Resources\AdminPatenteResource;

class PatenteCategoryAdminController extends ContentAdminController
{
    protected function modelClass(): string
    {
        return PatenteCategory::class;
    }

    protected function resourceClass(): string
    {
        return AdminPatenteResource::class;
    }

    protected function requestClass(): string
    {
        return PatenteCategoryRequest::class;
    }
}
