<?php

namespace App\Http\Controllers\Api\V1;

use App\Domains\Articles\Enums\ArticleCategory;
use App\Domains\Articles\Models\Article;
use App\Domains\Geo\Models\City;
use App\Domains\Geo\Models\Region;
use App\Domains\Guides\Models\Guide;
use App\Http\Controllers\Controller;
use App\Http\Resources\ArticleResource;
use App\Http\Resources\GuideResource;
use App\Support\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class ArticleController extends Controller
{
    private const SORTS = ['-published_at', 'published_at', 'title'];

    public function categories()
    {
        return ApiResponse::data(collect(ArticleCategory::cases())->map(fn ($c) => [
            'value' => $c->value, 'label' => __('articles.categories.'.$c->value),
        ])->all())->header('Cache-Control', 'public, max-age=300');
    }

    public function index(Request $request)
    {
        $request->validate([
            'category' => ['nullable', Rule::enum(ArticleCategory::class)],
            'city' => ['nullable', 'string', 'max:80'], 'region' => ['nullable', 'string', 'max:60'],
            'tag' => ['nullable', 'string', 'max:40'], 'guide' => ['nullable', 'string', 'max:120'],
            'q' => ['nullable', 'string', 'max:100'],
            'sort' => ['nullable', Rule::in(self::SORTS)],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:50'],
        ]);

        $q = Article::published()->with(['translations', 'city.translations', 'region.translations']);
        if ($c = $request->query('category')) {
            $q->where('category', $c);
        }
        if ($slug = $request->query('city')) {
            $q->where('city_id', City::where('slug', $slug)->value('id') ?? 0);
        }
        if ($slug = $request->query('region')) {
            $q->where('region_id', Region::where('slug', $slug)->orWhere('code', $slug)->value('id') ?? 0);
        }
        if ($tag = $request->query('tag')) {
            $q->whereIn('articles.id', DB::table('article_tags')->where('tag', $tag)->select('article_id'));
        }
        if ($slug = $request->query('guide')) {
            $q->whereIn('articles.id', DB::table('article_guide')->join('guides', 'guides.id', '=', 'article_guide.guide_id')->where('guides.slug', $slug)->select('article_guide.article_id'));
        }
        if ($term = $request->query('q')) {
            $like = '%'.addcslashes($term, '%_\\').'%';
            $q->whereHas('translations', fn ($t) => $t->where('title', 'like', $like)->orWhere('excerpt', 'like', $like));
        }

        $sort = (string) $request->query('sort', '-published_at');
        if ($sort === 'title') {
            // Titles live per locale: sort by the requested locale's title.
            $locale = app()->getLocale();
            $q->orderBy(DB::table('article_translations')->select('title')->whereColumn('article_id', 'articles.id')->where('locale', $locale)->limit(1));
        } else {
            $q->orderBy('published_at', $sort === 'published_at' ? 'asc' : 'desc');
        }
        $q->orderBy('articles.id');

        return ApiResponse::paginated($q->paginate((int) $request->query('per_page', 20)), ArticleResource::class)
            ->header('Cache-Control', 'public, max-age=300');
    }

    public function show(string $slug)
    {
        $a = Article::published()->with(['translations', 'city.translations', 'region.translations', 'guides' => fn ($g) => $g->published()->with(['translations', 'region.translations', 'city.translations'])])
            ->where('slug', $slug)->firstOrFail();

        $related = Article::published()->with(['translations', 'city.translations', 'region.translations'])
            ->where('id', '!=', $a->id)->where('category', $a->category)->orderByDesc('published_at')->limit(4)->get();

        return ApiResponse::data((new ArticleResource($a, full: true))->resolve() + [
            'related_guides' => $a->guides->map(fn (Guide $g) => (new GuideResource($g))->resolve())->values(),
            'related_articles' => ArticleResource::collection($related)->resolve(),
        ])->header('Cache-Control', 'public, max-age=300');
    }
}
