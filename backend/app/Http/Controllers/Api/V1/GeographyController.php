<?php

namespace App\Http\Controllers\Api\V1;

use App\Domains\Geo\Models\City;
use App\Domains\Geo\Models\Region;
use App\Http\Controllers\Controller;
use App\Support\ApiResponse;
use Illuminate\Http\Request;

class GeographyController extends Controller
{
    public function regions()
    {
        $regions = Region::withTranslations()->orderBy('code')->get();

        return ApiResponse::data($regions->map(fn (Region $r) => [
            'id' => $r->id,
            'code' => $r->code,
            'slug' => $r->slug,
            'name' => $r->localized('name'),
        ])->sortBy('name', SORT_NATURAL | SORT_FLAG_CASE)->values());
    }

    public function cities(Request $request)
    {
        $request->validate(['region' => ['nullable', 'string', 'max:60'], 'q' => ['nullable', 'string', 'max:80']]);

        $query = City::withTranslations()->with('region.translations');
        if ($region = $request->query('region')) {
            $query->whereHas('region', fn ($q) => $q->where('slug', $region)->orWhere('code', $region));
        }
        if ($q = $request->query('q')) {
            $like = '%'.addcslashes($q, '%_\\').'%';
            $query->whereHas('translations', fn ($t) => $t->where('name', 'like', $like));
        }

        $cities = $query->get()->map(fn (City $c) => [
            'id' => $c->id,
            'slug' => $c->slug,
            'name' => $c->localized('name'),
            'region' => ['id' => $c->region->id, 'slug' => $c->region->slug, 'name' => $c->region->localized('name')],
        ])->sortBy('name', SORT_NATURAL | SORT_FLAG_CASE)->values();

        return ApiResponse::data($cities);
    }
}
