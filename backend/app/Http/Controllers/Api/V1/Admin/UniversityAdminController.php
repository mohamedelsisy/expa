<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Domains\Study\Models\University;
use App\Http\Requests\UniversityRequest;
use App\Http\Resources\AdminUniversityResource;

class UniversityAdminController extends ContentAdminController
{
    protected function modelClass(): string
    {
        return University::class;
    }

    protected function resourceClass(): string
    {
        return AdminUniversityResource::class;
    }

    protected function requestClass(): string
    {
        return UniversityRequest::class;
    }
}
