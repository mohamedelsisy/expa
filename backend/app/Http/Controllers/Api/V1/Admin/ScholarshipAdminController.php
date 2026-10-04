<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Domains\Study\Models\Scholarship;
use App\Http\Requests\ScholarshipRequest;
use App\Http\Resources\AdminScholarshipResource;

class ScholarshipAdminController extends ContentAdminController
{
    protected function modelClass(): string
    {
        return Scholarship::class;
    }

    protected function resourceClass(): string
    {
        return AdminScholarshipResource::class;
    }

    protected function requestClass(): string
    {
        return ScholarshipRequest::class;
    }
}
