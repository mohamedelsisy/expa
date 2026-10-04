<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Domains\Appointments\Models\AppointmentGuide;
use App\Domains\Government\Enums\OfficeType;
use App\Http\Requests\AppointmentGuideRequest;
use App\Http\Resources\AdminAppointmentGuideResource;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class AppointmentGuideAdminController extends ContentAdminController
{
    protected function modelClass(): string
    {
        return AppointmentGuide::class;
    }

    protected function resourceClass(): string
    {
        return AdminAppointmentGuideResource::class;
    }

    protected function requestClass(): string
    {
        return AppointmentGuideRequest::class;
    }

    protected function filterRules(): array
    {
        return ['filter.office_type' => ['nullable', Rule::enum(OfficeType::class)]];
    }

    protected function applyFilters(Builder $query, Request $request): void
    {
        if ($t = $request->input('filter.office_type')) {
            $query->where('office_type', $t);
        }
    }
}
