<?php

namespace App\Http\Controllers\Api\V1;

use App\Domains\Analytics\Analytics;
use App\Domains\Analytics\AnalyticsEvent;
use App\Domains\Geo\Models\City;
use App\Domains\Geo\Models\Region;
use App\Domains\Guides\Enums\GuideCategory;
use App\Domains\Guides\Models\Guide;
use App\Http\Controllers\Controller;
use App\Http\Resources\GuideResource;
use App\Support\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class GuideController extends Controller
{
    public function categories()
    {
        return ApiResponse::data(collect(GuideCategory::cases())->map(fn ($c) => [
            'value' => $c->value,
            'label' => __('guides.categories.'.$c->value),
        ])->all());
    }

    public function index(Request $request)
    {
        $request->validate([
            'category' => ['nullable', Rule::enum(GuideCategory::class)],
            'city' => ['nullable', 'string', 'max:80'],
            'region' => ['nullable', 'string', 'max:60'],
            'q' => ['nullable', 'string', 'max:100'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:50'],
        ]);

        $query = Guide::published()->with(['translations', 'region.translations', 'city.translations']);

        if ($category = $request->query('category')) {
            $query->where('category', $category);
        }

        $city = $request->filled('city') ? City::with('region')->where('slug', $request->query('city'))->first() : null;
        $region = $request->filled('region') ? Region::where('slug', $request->query('region'))->orWhere('code', $request->query('region'))->first() : null;
        if (($request->filled('city') && ! $city) || ($request->filled('region') && ! $region)) {
            return ApiResponse::data([], ['page' => 1, 'per_page' => 20, 'total' => 0, 'last_page' => 1]);
        }
        if ($city || $region) {
            $query->applicableTo($city, $region);
        }

        if ($q = $request->query('q')) {
            $query->matching($q);
        }

        $page = $query->orderBy('sort_order')->orderBy('id')->paginate((int) $request->query('per_page', 20));

        return ApiResponse::paginated($page, GuideResource::class)->header('Cache-Control', 'public, max-age=300');
    }

    public function show(string $slug)
    {
        $guide = Guide::published()->with(['translations', 'region.translations', 'city.translations'])
            ->where('slug', $slug)->firstOrFail();

        // MVP-12: counted here when the caller consented (stored consent for a signed-in user, or the consent header sent by the
        // client's banner). Clients must not ALSO POST guide_view for the same view.
        app(Analytics::class)->client(AnalyticsEvent::GuideView, $guide->slug, request()->user('sanctum'), strtolower((string) request()->header('X-Analytics-Consent')) === 'granted');

        return ApiResponse::data(new GuideResource($guide, full: true))->header('Cache-Control', 'public, max-age=300');
    }
}
