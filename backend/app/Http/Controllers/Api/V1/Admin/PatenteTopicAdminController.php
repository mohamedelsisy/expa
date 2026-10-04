<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Domains\Patente\Models\PatenteTopic;
use App\Http\Requests\PatenteTopicRequest;
use App\Http\Resources\AdminPatenteResource;

class PatenteTopicAdminController extends ContentAdminController
{
    protected function modelClass(): string
    {
        return PatenteTopic::class;
    }

    protected function resourceClass(): string
    {
        return AdminPatenteResource::class;
    }

    protected function requestClass(): string
    {
        return PatenteTopicRequest::class;
    }
}
