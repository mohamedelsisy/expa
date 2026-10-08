<?php

namespace App\Http\Controllers\Api\V1;

use App\Domains\Articles\Models\Article;
use App\Domains\Geo\Enums\CityBlockKey;
use App\Domains\Geo\Models\City;
use App\Domains\Geo\Models\CityBlock;
use App\Domains\Geo\Models\CityProfile;
use App\Domains\Government\Models\GovernmentOffice;
use App\Domains\Guides\Models\Guide;
use App\Http\Controllers\Controller;
use App\Http\Resources\ArticleResource;
use App\Http\Resources\GuideResource;
use App\Support\ApiResponse;
use Illuminate\Http\Request;

/** Public city landing pages (profile + blocks) and the region/city-specific information hook used by guides. */
class CityProfileController extends Controller
{
    public function index(Request $request)
    {
        $request->validate(['region' => ['nullable', 'string', 'max:60'], 'per_page' => ['nullable', 'integer', 'min:1', 'max:50']]);
        $q = CityProfile::published()->with(['translations', 'city.translations', 'city.region.translations']);
        if ($r = $request->query('region')) {
            $q->whereHas('city.region', fn ($x) => $x->where('slug', $r)->orWhere('code', $r));
        }
        $page = $q->orderBy('sort_order')->orderBy('id')->paginate((int) $request->query('per_page', 20));

        return ApiResponse::data($page->getCollection()->map(fn (CityProfile $p) => $this->summary($p))->values(), [
            'page' => $page->currentPage(), 'per_page' => $page->perPage(), 'total' => $page->total(), 'last_page' => $page->lastPage(),
        ])->header('Cache-Control', 'public, max-age=300');
    }

    public function show(string $slug)
    {
        $profile = $this->find($slug);
        $city = $profile->city;

        $guides = Guide::published()->applicableTo($city)->with(['translations', 'region.translations', 'city.translations'])
            ->orderBy('sort_order')->orderBy('id')->limit(30)->get();
        $articles = Article::published()->where('city_id', $city->id)->with(['translations', 'city.translations', 'region.translations'])
            ->orderByDesc('published_at')->limit(6)->get();

        return ApiResponse::data($this->summary($profile) + [
            'blocks' => $profile->blocks()->with('translations')->get()->map(fn (CityBlock $b) => $this->block($b))->values(),
            'guides' => GuideResource::collection($guides)->resolve(),
            'articles' => ArticleResource::collection($articles)->resolve(),
            'offices_count' => GovernmentOffice::published()->where('city_id', $city->id)->count(),
            'disclaimer' => __('articles.city_disclaimer'),
        ])->header('Cache-Control', 'public, max-age=300');
    }

    /**
     * Region/city-specific hook for guides: the published city block that complements a guide's category
     * (e.g. a healthcare guide + `?city=milano` => Milan's healthcare block). Null block when there is none.
     */
    public function guideLocalInfo(Request $request, string $slug)
    {
        $request->validate(['city' => ['required', 'string', 'max:80']]);
        $guide = Guide::published()->where('slug', $slug)->firstOrFail();
        $key = CityBlockKey::forGuideCategory($guide->category);
        $profile = $this->find((string) $request->query('city'));
        $block = $key ? $profile->blocks()->with('translations')->where('block_key', $key->value)->first() : null;

        return ApiResponse::data([
            'guide' => $guide->slug, 'city' => $profile->city->slug,
            'block' => $block ? $this->block($block) : null,
        ])->header('Cache-Control', 'public, max-age=300');
    }

    private function find(string $citySlug): CityProfile
    {
        $city = City::where('slug', $citySlug)->firstOrFail();

        return CityProfile::published()->with(['translations', 'city.translations', 'city.region.translations'])->where('city_id', $city->id)->firstOrFail();
    }

    private function summary(CityProfile $p): array
    {
        return [
            'slug' => $p->city->slug, 'name' => $p->city->localized('name'),
            'region' => ['slug' => $p->city->region->slug, 'name' => $p->city->region->localized('name')],
            'headline' => $p->localized('headline'), 'summary' => $p->localized('summary'),
            'seo_description' => $p->localized('seo_description') ?: $p->localized('summary'),
            'status' => 'published', 'locale' => $p->resolveLocale(), 'fallback' => $p->usesFallback(), 'available_locales' => $p->translatedLocales(),
            'updated_at' => $p->updated_at?->toIso8601String(),
        ];
    }

    private function block(CityBlock $b): array
    {
        return [
            'key' => $b->block_key->value, 'label' => __('articles.blocks.'.$b->block_key->value),
            'title' => $b->localized('title'), 'body' => $b->localized('body'),
            'locale' => $b->resolveLocale(), 'fallback' => $b->usesFallback(),
            // Official claims carry their source; everything else is explicitly general guidance.
            'info_type' => $b->info_type,
            'info_label' => __('articles.info_types.'.$b->info_type),
            'source' => $b->source_url ? $b->sourcePayload() : null,
        ];
    }
}
