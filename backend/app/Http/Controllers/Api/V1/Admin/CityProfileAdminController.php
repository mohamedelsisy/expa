<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Domains\Geo\Models\CityProfile;
use App\Http\Requests\CityProfileRequest;
use App\Http\Resources\AdminCityProfileResource;

class CityProfileAdminController extends ContentAdminController
{
    protected function modelClass(): string
    {
        return CityProfile::class;
    }

    protected function resourceClass(): string
    {
        return AdminCityProfileResource::class;
    }

    protected function requestClass(): string
    {
        return CityProfileRequest::class;
    }
}
