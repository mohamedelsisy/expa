<?php

namespace App\Http\Controllers\Api\V1;

use App\Domains\Geo\Models\City;
use App\Domains\Profile\Enums\ConsentPurpose;
use App\Domains\Profile\Services\ConsentService;
use App\Domains\Study\Enums\DegreeLevel;
use App\Domains\Study\Enums\StudyField;
use App\Domains\Study\Models\Scholarship;
use App\Domains\Study\Models\StudyProgram;
use App\Domains\Study\Models\University;
use App\Domains\Study\Services\ProgramFinder;
use App\Http\Controllers\Controller;
use App\Http\Resources\StudyProgramResource;
use App\Support\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class StudyController extends Controller
{
    private const LEVELS = ['a0', 'a1', 'a2', 'b1', 'b2', 'c1', 'c2'];

    public function meta()
    {
        $label = fn (string $g, array $cases) => collect($cases)->map(fn ($c) => ['value' => $c->value, 'label' => __("study.$g.{$c->value}")])->all();

        return ApiResponse::data([
            'degree_levels' => $label('degree_levels', DegreeLevel::cases()),
            'fields' => $label('fields', StudyField::cases()),
            'languages' => collect(['en', 'it', 'both'])->map(fn ($l) => ['value' => $l, 'label' => __("study.languages.$l")])->all(),
            'verify_notice' => __('study.verify_notice'),
        ])->header('Cache-Control', 'public, max-age=300');
    }

    // ---- universities -------------------------------------------------------------------------

    public function universities(Request $request)
    {
        $request->validate(['city' => ['nullable', 'string', 'max:80'], 'q' => ['nullable', 'string', 'max:100'], 'per_page' => ['nullable', 'integer', 'min:1', 'max:50']]);
        $q = University::published()->with(['translations', 'city.translations']);
        if ($slug = $request->query('city')) {
            $q->where('city_id', City::where('slug', $slug)->value('id') ?? 0);
        }
        if ($term = $request->query('q')) {
            $like = '%'.addcslashes($term, '%_\\').'%';
            $q->whereHas('translations', fn ($t) => $t->where('name', 'like', $like));
        }
        $page = $q->orderBy('sort_order')->orderBy('id')->paginate((int) $request->query('per_page', 20));

        return ApiResponse::data($page->getCollection()->map(fn ($u) => $this->university($u))->values(), $this->meta2($page))->header('Cache-Control', 'public, max-age=300');
    }

    public function university(string|University $slug)
    {
        if ($slug instanceof University) {
            $u = $slug;

            return [
                'slug' => $u->slug, 'name' => $u->localized('name'), 'summary' => $u->localized('summary'), 'kind' => $u->kind,
                'kind_label' => __('study.kinds.'.$u->kind), 'website' => $u->website,
                'city' => $u->city ? ['slug' => $u->city->slug, 'name' => $u->city->localized('name')] : null,
                'locale' => $u->resolveLocale(), 'fallback' => $u->usesFallback(), 'source' => $u->sourcePayload(),
                'updated_at' => $u->updated_at?->toIso8601String(),
            ];
        }

        $u = University::published()->with(['translations', 'city.translations'])->where('slug', $slug)->firstOrFail();
        $programs = StudyProgram::published()->where('university_id', $u->id)->with(['translations', 'university.translations', 'university.city.translations'])->orderBy('sort_order')->get();

        return ApiResponse::data($this->university($u) + [
            'notes' => $u->localized('notes'),
            'programs' => $programs->map(fn ($p) => (new StudyProgramResource($p))->toArray(request()))->values(),
        ])->header('Cache-Control', 'public, max-age=300');
    }

    // ---- programs & finder --------------------------------------------------------------------

    public function programs(Request $request)
    {
        $c = $this->criteria($request);
        $q = StudyProgram::published()->whereHas('university', fn ($u) => $u->published())->with(['translations', 'university.translations', 'university.city.translations']);

        foreach (['field', 'degree' => 'degree_level'] as $param => $col) {
            $param = is_int($param) ? $col : $param;
            if (isset($c[$param])) {
                $q->where($col, $c[$param]);
            }
        }
        if (isset($c['language'])) {
            $q->whereIn('instruction_language', [$c['language'], 'both']);
        }
        if (isset($c['city'])) {
            $q->whereHas('university', fn ($u) => $u->where('city_id', City::where('slug', $c['city'])->value('id') ?? 0));
        }
        if ($term = $request->query('q')) {
            $like = '%'.addcslashes($term, '%_\\').'%';
            $q->whereHas('translations', fn ($t) => $t->where('title', 'like', $like)->orWhere('summary', 'like', $like));
        }

        $page = $q->orderBy('sort_order')->orderBy('id')->paginate((int) $request->query('per_page', 20));

        return ApiResponse::data($page->getCollection()->map(fn ($p) => (new StudyProgramResource($p))->toArray($request))->values(), $this->meta2($page))
            ->header('Cache-Control', 'public, max-age=300');
    }

    public function program(string $slug)
    {
        $p = StudyProgram::published()->whereHas('university', fn ($u) => $u->published())->with(['translations', 'university.translations', 'university.city.translations'])->where('slug', $slug)->firstOrFail();

        return ApiResponse::data(new StudyProgramResource($p, full: true))->header('Cache-Control', 'public, max-age=300');
    }

    /**
     * The Study Finder: field, degree, language, budget, city and language levels in → ranked programs out,
     * each with an explanation. With `use_profile=1` (signed-in, personalization consent) missing levels/city
     * come from the profile.
     */
    public function finder(Request $request, ProgramFinder $finder, ConsentService $consents)
    {
        $c = $this->criteria($request);

        if ($request->boolean('use_profile') && ($user = $request->user('sanctum')) && $consents->has($user, ConsentPurpose::ProfilePersonalization)) {
            $p = $user->profile;
            $c['italian_level'] ??= $p?->italian_level?->value;
            $c['english_level'] ??= $p?->english_level?->value;
            if (! isset($c['city']) && $p?->city_id) {
                $c['city'] = City::whereKey($p->city_id)->value('slug');
            }
        }

        $results = $finder->find($c);
        $perPage = 20;
        $page = max(1, (int) $request->query('page', 1));

        return ApiResponse::data(
            $results->forPage($page, $perPage)->map(fn ($r) => (new StudyProgramResource($r['program'], match: $r))->toArray($request))->values(),
            ['page' => $page, 'per_page' => $perPage, 'total' => $results->count(), 'last_page' => max(1, (int) ceil($results->count() / $perPage)), 'criteria' => $c, 'verify_notice' => __('study.verify_notice')],
        );
    }

    // ---- scholarships -------------------------------------------------------------------------

    public function scholarships(Request $request)
    {
        $request->validate(['degree' => ['nullable', Rule::enum(DegreeLevel::class)], 'open_only' => ['nullable', 'boolean'], 'per_page' => ['nullable', 'integer', 'min:1', 'max:50']]);
        $q = Scholarship::published()->with('translations');
        if ($d = $request->query('degree')) {
            $q->where(fn ($w) => $w->whereNull('degree_levels')->orWhere('degree_levels', 'like', '%"'.$d.'"%'));
        }
        if ($request->boolean('open_only')) {
            $q->where(fn ($w) => $w->whereNull('deadline')->orWhere('deadline', '>=', now()->toDateString()));
        }
        $page = $q->orderBy('sort_order')->orderBy('id')->paginate((int) $request->query('per_page', 20));

        return ApiResponse::data($page->getCollection()->map(fn ($s) => $this->scholarship($s))->values(), $this->meta2($page))->header('Cache-Control', 'public, max-age=300');
    }

    public function scholarship(string|Scholarship $slug)
    {
        if ($slug instanceof Scholarship) {
            $s = $slug;

            return [
                'slug' => $s->slug, 'name' => $s->localized('name'), 'summary' => $s->localized('summary'), 'degree_levels' => $s->degree_levels ?? [],
                'deadline' => ['date' => $s->deadline?->toDateString(), 'status' => ! $s->deadline ? 'not_stated' : ($s->deadline->isFuture() || $s->deadline->isToday() ? 'upcoming' : 'passed')],
                'verify_notice' => __('study.verify_notice'), 'updated_at' => $s->updated_at?->toIso8601String(), 'locale' => $s->resolveLocale(), 'fallback' => $s->usesFallback(), 'source' => $s->sourcePayload(),
            ];
        }

        $s = Scholarship::published()->with('translations')->where('slug', $slug)->firstOrFail();

        return ApiResponse::data($this->scholarship($s) + ['eligibility' => $s->localized('eligibility'), 'how_to_apply' => $s->localized('how_to_apply'), 'apply_url' => $s->apply_url])
            ->header('Cache-Control', 'public, max-age=300');
    }

    // ---- helpers ------------------------------------------------------------------------------

    /** Validated, normalized finder/list criteria (only supplied keys are present). */
    private function criteria(Request $request): array
    {
        $d = $request->validate([
            'field' => ['nullable', Rule::enum(StudyField::class)],
            'degree' => ['nullable', Rule::enum(DegreeLevel::class)],
            'language' => ['nullable', Rule::in(['en', 'it', 'any'])],
            'budget' => ['nullable', 'integer', 'min:0', 'max:200000'],
            'city' => ['nullable', 'string', 'max:80'],
            'italian_level' => ['nullable', Rule::in(self::LEVELS)],
            'english_level' => ['nullable', Rule::in(self::LEVELS)],
            'q' => ['nullable', 'string', 'max:100'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:50'],
            'page' => ['nullable', 'integer', 'min:1'],
        ]);

        $c = array_filter(array_intersect_key($d, array_flip(['field', 'degree', 'language', 'budget', 'city', 'italian_level', 'english_level'])), fn ($v) => $v !== null && $v !== '');
        if (isset($c['budget'])) {
            $c['budget'] = (int) $c['budget'];
        }

        return $c;
    }

    private function meta2($page): array
    {
        return ['page' => $page->currentPage(), 'per_page' => $page->perPage(), 'total' => $page->total(), 'last_page' => $page->lastPage()];
    }
}
