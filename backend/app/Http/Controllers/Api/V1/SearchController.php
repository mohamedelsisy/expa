<?php

namespace App\Http\Controllers\Api\V1;

use App\Domains\Search\Services\SearchIndexer;
use App\Domains\Search\Services\SearchService;
use App\Http\Controllers\Controller;
use App\Support\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class SearchController extends Controller
{
    public function __construct(private SearchService $search) {}

    public function index(Request $request)
    {
        $data = $request->validate([
            'q' => ['required', 'string', 'min:2', 'max:100'],
            'types' => ['nullable', 'array', 'max:8'],
            'types.*' => [Rule::in(SearchIndexer::TYPES)],
            'page' => ['nullable', 'integer', 'min:1'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:50'],
        ]);

        $r = $this->search->search($data['q'], app()->getLocale(), $data['types'] ?? []);
        $perPage = (int) ($data['per_page'] ?? 20);
        $page = (int) ($data['page'] ?? 1);

        $items = $r['results']->forPage($page, $perPage)->map(fn ($x) => [
            'type' => $x['doc']->type,
            'type_label' => __('search.types.'.$x['doc']->type),
            'id' => $x['doc']->item_id,
            'slug' => $x['doc']->slug,
            'title' => $x['doc']->title,
            'snippet' => $this->search->snippet($x['doc'], []),
            'route' => $this->search->route($x['doc']),
            'locale' => $x['doc']->locale,
            'meta' => $x['doc']->meta ?: null,
        ])->values();

        return ApiResponse::data($items, [
            'page' => $page, 'per_page' => $perPage, 'total' => $r['total'], 'last_page' => max(1, (int) ceil($r['total'] / $perPage)),
            'facets' => collect($r['facets'])->map(fn ($n, $t) => ['type' => $t, 'label' => __("search.types.$t"), 'count' => $n])->values(),
        ]);
    }

    public function suggest(Request $request)
    {
        $data = $request->validate(['q' => ['required', 'string', 'min:2', 'max:60']]);

        return ApiResponse::data($this->search->suggest($data['q'], app()->getLocale()));
    }
}
