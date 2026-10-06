<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Domains\Audit\Services\AuditLogger;
use App\Domains\Geo\Models\City;
use App\Domains\Geo\Models\Region;
use App\Exceptions\ApiException;
use App\Http\Controllers\Controller;
use App\Support\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

/** Reference geography (MVP-15). Gated by the `cities.*` permissions: view lists, create/update/delete write. */
class GeographyAdminController extends Controller
{
    public function __construct(private AuditLogger $audit) {}

    public function regions()
    {
        return ApiResponse::data(Region::with('translations')->withCount('cities')->orderBy('code')->get()->map(fn (Region $r) => [
            'id' => $r->id, 'code' => $r->code, 'slug' => $r->slug, 'cities' => $r->cities_count,
            'translations' => $r->translations->mapWithKeys(fn ($t) => [$t->locale => $t->name]),
        ])->values());
    }

    public function cities(Request $request)
    {
        $request->validate(['per_page' => ['nullable', 'integer', 'min:1', 'max:100'], 'region_id' => ['nullable', 'integer'], 'q' => ['nullable', 'string', 'max:80']]);
        $q = City::with('translations')->orderBy('id');
        if ($rid = $request->input('region_id')) {
            $q->where('region_id', $rid);
        }
        if ($s = $request->input('q')) {
            $q->whereHas('translations', fn ($t) => $t->where('name', 'like', '%'.addcslashes($s, '%_\\').'%'));
        }
        $page = $q->paginate((int) $request->input('per_page', 50));

        return ApiResponse::data($page->getCollection()->map(fn (City $c) => $this->present($c))->values(), [
            'page' => $page->currentPage(), 'per_page' => $page->perPage(), 'total' => $page->total(), 'last_page' => $page->lastPage(),
        ]);
    }

    public function store(Request $request)
    {
        $data = $this->validated($request);
        $city = new City(['slug' => $data['slug']]);
        $city->region_id = $data['region_id'];
        $city->save();
        $city->setTranslations($data['translations']);
        $this->audit->log('admin.city.created', $city, ['slug' => $city->slug]);

        return ApiResponse::data($this->present($city->load('translations')), status: 201);
    }

    public function update(Request $request, int $id)
    {
        $city = City::findOrFail($id);
        $data = $this->validated($request, $city);
        $city->forceFill(['slug' => $data['slug'], 'region_id' => $data['region_id']])->save();
        $city->setTranslations($data['translations']);
        $this->audit->log('admin.city.updated', $city, ['slug' => $city->slug]);

        return ApiResponse::data($this->present($city->load('translations')));
    }

    public function destroy(int $id)
    {
        $city = City::findOrFail($id);
        // Cities are referenced by profiles (nullOnDelete), content, jobs and offices: refuse when content depends on it.
        foreach (['government_offices', 'guides', 'job_listings'] as $table) {
            if (Schema::hasColumn($table, 'city_id') && DB::table($table)->where('city_id', $city->id)->exists()) {
                throw new ApiException('city_in_use', __('errors.city_in_use'), 409);
            }
        }
        $this->audit->log('admin.city.deleted', $city, ['slug' => $city->slug]);
        $city->delete();

        return response()->noContent();
    }

    private function validated(Request $request, ?City $city = null): array
    {
        $data = $request->validate([
            'slug' => ['required', 'string', 'max:80', 'regex:/^[a-z0-9]+(-[a-z0-9]+)*$/', Rule::unique('cities', 'slug')->ignore($city?->id)],
            'region_id' => ['required', 'integer', Rule::exists('regions', 'id')],
            'translations' => ['required', 'array'],
            'translations.*' => ['array'],
            'translations.*.name' => ['required', 'string', 'max:120'],
        ]);
        if (array_diff(array_keys($data['translations']), array_keys(config('expa.locales'))) !== [] || ! isset($data['translations']['ar'])) {
            throw ValidationException::withMessages(['translations' => [__('validation.required', ['attribute' => 'translations.ar'])]]);
        }
        $data['translations'] = array_map(fn ($t) => ['name' => trim(strip_tags($t['name']))], $data['translations']);

        return $data;
    }

    private function present(City $c): array
    {
        return ['id' => $c->id, 'slug' => $c->slug, 'region_id' => $c->region_id, 'translations' => $c->translations->mapWithKeys(fn ($t) => [$t->locale => $t->name])];
    }
}
