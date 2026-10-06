<?php

namespace App\Http\Controllers\Api\V1;

use App\Domains\Geo\Models\City;
use App\Domains\Geo\Models\Region;
use App\Http\Controllers\Controller;
use App\Support\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class GeographyController extends Controller
{
    /** ISO 3166-1 alpha-2 pseudo/reserved codes that ICU lists but that are not countries (XK = Kosovo, user-assigned, kept on purpose). */
    private const NOT_COUNTRIES = ['AC', 'CP', 'DG', 'EA', 'EU', 'EZ', 'IC', 'QO', 'TA', 'UN', 'XA', 'XB', 'ZZ'];

    /**
     * ISO 3166-1 alpha-2 codes with names in the request locale, from the ICU data bundled with PHP intl
     * (no names are written by hand). Used for the onboarding nationality select.
     */
    public function countries(Request $request)
    {
        $request->validate(['q' => ['nullable', 'string', 'max:80']]);
        abort_unless(class_exists(\ResourceBundle::class) && class_exists(\Collator::class), 503);

        $locale = app()->getLocale();
        $list = Cache::remember("countries.$locale", 86400, function () use ($locale) {
            $names = [];
            foreach ((\ResourceBundle::create('en', 'ICUDATA-region') ?: [])['Countries'] ?? [] as $code => $_) {
                if (preg_match('/^[A-Z]{2}$/', (string) $code) && ! in_array($code, self::NOT_COUNTRIES, true)) {
                    $names[$code] = \Locale::getDisplayRegion('-'.$code, $locale) ?: $code;
                }
            }
            $collator = new \Collator($locale);
            uasort($names, fn ($a, $b) => $collator->compare($a, $b));

            return collect($names)->map(fn ($name, $code) => ['code' => $code, 'name' => $name])->values()->all();
        });

        if ($term = mb_strtolower(trim((string) $request->query('q')))) {
            $list = array_values(array_filter($list, fn ($c) => str_contains(mb_strtolower($c['name']), $term) || strtolower($c['code']) === $term));
        }

        return ApiResponse::data($list)->header('Cache-Control', 'public, max-age=86400');
    }

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

        $cities = $query->limit((int) config('expa.limits.cities_max'))->get()->map(fn (City $c) => [
            'id' => $c->id,
            'slug' => $c->slug,
            'name' => $c->localized('name'),
            'region' => ['id' => $c->region->id, 'slug' => $c->region->slug, 'name' => $c->region->localized('name')],
        ])->sortBy('name', SORT_NATURAL | SORT_FLAG_CASE)->values();

        return ApiResponse::data($cities);
    }
}
