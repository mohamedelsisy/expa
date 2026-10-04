<?php

namespace App\Http\Controllers\Api\V1;

use App\Domains\Appointments\Models\AppointmentGuide;
use App\Domains\Geo\Models\City;
use App\Domains\Government\Enums\OfficeType;
use App\Domains\Government\Models\GovernmentOffice;
use App\Http\Controllers\Controller;
use App\Http\Resources\AppointmentGuideResource;
use App\Http\Resources\GovernmentOfficeResource;
use App\Support\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class AppointmentController extends Controller
{
    public function guides(Request $request)
    {
        $request->validate(['office_type' => ['nullable', Rule::enum(OfficeType::class)], 'per_page' => ['nullable', 'integer', 'min:1', 'max:50']]);

        $q = AppointmentGuide::published()->with('translations');
        if ($t = $request->query('office_type')) {
            $q->where('office_type', $t);
        }

        return ApiResponse::paginated($q->orderBy('sort_order')->orderBy('id')->paginate((int) $request->query('per_page', 20)), AppointmentGuideResource::class)
            ->header('Cache-Control', 'public, max-age=300');
    }

    public function guide(string $slug)
    {
        $guide = AppointmentGuide::published()->with('translations')->where('slug', $slug)->firstOrFail();

        return ApiResponse::data(new AppointmentGuideResource($guide, full: true))->header('Cache-Control', 'public, max-age=300');
    }

    /**
     * "How do I book X in city Y?": the how-to guide for that kind of office plus the offices that serve the city,
     * each with its official booking destination. Never a booking, always a pointer.
     */
    public function hub(Request $request)
    {
        $data = $request->validate([
            'type' => ['required', Rule::enum(OfficeType::class)],
            'city' => ['required', 'string', 'max:80'],
        ]);

        $city = City::with('region.translations', 'translations')->where('slug', $data['city'])->firstOrFail();

        $offices = GovernmentOffice::published()->with(['translations', 'region.translations', 'city.translations'])
            ->where('office_type', $data['type'])->serving($city)->orderBy('sort_order')->orderBy('id')->get();
        $guide = AppointmentGuide::published()->with('translations')->where('office_type', $data['type'])->orderBy('sort_order')->first();

        return ApiResponse::data([
            'city' => ['slug' => $city->slug, 'name' => $city->localized('name')],
            'office_type' => $data['type'],
            'office_type_label' => __('government.office_types.'.$data['type']),
            'guide' => $guide ? (new AppointmentGuideResource($guide, full: true))->toArray($request) : null,
            'offices' => $offices->map(fn ($o) => (new GovernmentOfficeResource($o))->toArray($request))->values(),
            'notice' => __('government.booking_notice'),
        ]);
    }
}
