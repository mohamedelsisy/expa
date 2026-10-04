<?php

namespace App\Http\Controllers\Api\V1;

use App\Domains\Geo\Models\City;
use App\Domains\Geo\Models\Region;
use App\Domains\Government\Enums\OfficeType;
use App\Domains\Government\Enums\ServiceDomain;
use App\Domains\Government\Models\GovernmentOffice;
use App\Domains\Government\Models\GovernmentService;
use App\Http\Controllers\Controller;
use App\Http\Resources\GovernmentOfficeResource;
use App\Http\Resources\GovernmentServiceResource;
use App\Support\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class GovernmentController extends Controller
{
    public function services(Request $request)
    {
        $request->validate([
            'domain' => ['nullable', Rule::enum(ServiceDomain::class)],
            'city' => ['nullable', 'string', 'max:80'],
            'region' => ['nullable', 'string', 'max:60'],
            'q' => ['nullable', 'string', 'max:100'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:50'],
        ]);

        [$city, $region, $unknownPlace] = $this->place($request);
        if ($unknownPlace) {
            return $this->empty();
        }

        $q = GovernmentService::published()->with(['translations', 'region.translations', 'city.translations']);
        if ($d = $request->query('domain')) {
            $q->where('domain', $d);
        }
        if ($city || $region) {
            // same scoping as guides: national + region + city
            $q->where(function ($w) use ($city, $region) {
                $region ??= $city?->region;
                $w->where(fn ($n) => $n->whereNull('region_id')->whereNull('city_id'));
                if ($region) {
                    $w->orWhere(fn ($r) => $r->where('region_id', $region->id)->whereNull('city_id'));
                }
                if ($city) {
                    $w->orWhere('city_id', $city->id);
                }
            });
        }
        if ($term = $request->query('q')) {
            $like = '%'.addcslashes($term, '%_\\').'%';
            $q->where(fn ($w) => $w->where('italian_term', 'like', $like)
                ->orWhereHas('translations', fn ($t) => $t->where('name', 'like', $like)->orWhere('summary', 'like', $like)));
        }

        $page = $q->orderBy('sort_order')->orderBy('id')->paginate((int) $request->query('per_page', 20));

        return ApiResponse::paginated($page, GovernmentServiceResource::class)->header('Cache-Control', 'public, max-age=300');
    }

    public function service(Request $request, string $slug)
    {
        $service = GovernmentService::published()->with(['translations', 'region.translations', 'city.translations', 'guide.translations'])
            ->where('slug', $slug)->firstOrFail();

        [$city, $region] = $this->place($request);
        $offices = $service->offices()->published()->with(['translations', 'region.translations', 'city.translations'])
            ->when($city || $region, fn ($q) => $q->serving($city, $region))
            ->orderBy('sort_order')->orderBy('id')->get();

        return ApiResponse::data(new GovernmentServiceResource($service, full: true, offices: $offices))->header('Cache-Control', 'public, max-age=300');
    }

    public function offices(Request $request)
    {
        $request->validate([
            'type' => ['nullable', Rule::enum(OfficeType::class)],
            'city' => ['nullable', 'string', 'max:80'],
            'region' => ['nullable', 'string', 'max:60'],
            'q' => ['nullable', 'string', 'max:100'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:50'],
        ]);

        [$city, $region, $unknownPlace] = $this->place($request);
        if ($unknownPlace) {
            return $this->empty();
        }

        $q = GovernmentOffice::published()->with(['translations', 'region.translations', 'city.translations']);
        if ($t = $request->query('type')) {
            $q->where('office_type', $t);
        }
        if ($city || $region) {
            $q->serving($city, $region);
        }
        if ($term = $request->query('q')) {
            $like = '%'.addcslashes($term, '%_\\').'%';
            $q->where(fn ($w) => $w->where('address', 'like', $like)->orWhereHas('translations', fn ($t) => $t->where('name', 'like', $like)));
        }

        $page = $q->orderBy('sort_order')->orderBy('id')->paginate((int) $request->query('per_page', 20));

        return ApiResponse::paginated($page, GovernmentOfficeResource::class)->header('Cache-Control', 'public, max-age=300');
    }

    public function office(string $slug)
    {
        $office = GovernmentOffice::published()->with(['translations', 'region.translations', 'city.translations'])->where('slug', $slug)->firstOrFail();

        return ApiResponse::data(new GovernmentOfficeResource($office))->header('Cache-Control', 'public, max-age=300');
    }

    /** @return array{0:?City,1:?Region,2:bool} city, region, whether a requested place does not exist */
    private function place(Request $request): array
    {
        $city = $request->filled('city') ? City::with('region')->where('slug', $request->query('city'))->first() : null;
        $region = $request->filled('region') ? Region::where('slug', $request->query('region'))->orWhere('code', $request->query('region'))->first() : null;

        return [$city, $region, ($request->filled('city') && ! $city) || ($request->filled('region') && ! $region)];
    }

    private function empty()
    {
        return ApiResponse::data([], ['page' => 1, 'per_page' => 20, 'total' => 0, 'last_page' => 1]);
    }
}
