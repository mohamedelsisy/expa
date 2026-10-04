<?php

namespace App\Http\Controllers\Api\V1;

use App\Domains\Analytics\Analytics;
use App\Domains\Analytics\AnalyticsEvent;
use App\Domains\Geo\Models\City;
use App\Domains\Jobs\Enums\EmploymentType;
use App\Domains\Jobs\Enums\RemoteMode;
use App\Domains\Jobs\Models\JobListing;
use App\Domains\Jobs\Models\JobProfile;
use App\Domains\Jobs\Services\CandidateProfile;
use App\Domains\Jobs\Services\MatchScorer;
use App\Domains\Profile\Enums\ConsentPurpose;
use App\Domains\Profile\Services\ConsentService;
use App\Http\Controllers\Controller;
use App\Http\Resources\JobResource;
use App\Support\ApiResponse;
use App\Support\Text\TextNormalizer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class JobController extends Controller
{
    private const LEVELS = ['a0', 'a1', 'a2', 'b1', 'b2', 'c1', 'c2'];

    public function __construct(private MatchScorer $scorer, private CandidateProfile $candidate) {}

    public function meta()
    {
        $label = fn (string $g, array $cases) => collect($cases)->map(fn ($c) => ['value' => $c->value, 'label' => __("jobs.$g.{$c->value}")])->all();

        return ApiResponse::data([
            'remote_modes' => $label('remote', RemoteMode::cases()),
            'employment_types' => $label('employment', EmploymentType::cases()),
            'categories' => collect(array_keys(config('jobs.categories')))->push('other')->map(fn ($c) => ['value' => $c, 'label' => __("jobs.categories.$c")])->all(),
            'apply_notice' => __('jobs.apply_notice'),
        ]);
    }

    public function index(Request $request)
    {
        $request->validate([
            'q' => ['nullable', 'string', 'max:100'],
            'city' => ['nullable', 'string', 'max:80'],
            'remote' => ['nullable', Rule::enum(RemoteMode::class)],
            'type' => ['nullable', Rule::enum(EmploymentType::class)],
            'category' => ['nullable', 'string', 'max:20'],
            'italian_max' => ['nullable', Rule::in(self::LEVELS)],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:50'],
        ]);

        $q = JobListing::listed()->with(['city.translations', 'source']);
        if ($term = $request->query('q')) {
            $like = '%'.addcslashes($term, '%_\\').'%';
            $q->where(fn ($w) => $w->where('title', 'like', $like)->orWhere('company', 'like', $like)->orWhere('description', 'like', $like));
        }
        if ($slug = $request->query('city')) {
            $city = City::where('slug', $slug)->first();
            $q->where('city_id', $city?->id ?? 0);
        }
        foreach (['remote' => 'remote_mode', 'type' => 'employment_type', 'category' => 'category'] as $param => $col) {
            if ($v = $request->query($param)) {
                $q->where($col, $v);
            }
        }
        if ($max = $request->query('italian_max')) {
            // jobs that require at most this level, or do not state a requirement
            $allowed = array_slice(self::LEVELS, 0, array_search($max, self::LEVELS, true) + 1);
            $q->where(fn ($w) => $w->whereNull('italian_level')->orWhereIn('italian_level', $allowed));
        }

        $page = $q->orderByDesc('published_at')->orderByDesc('id')->paginate((int) $request->query('per_page', 20));
        $saved = $this->savedIds($request, $page->getCollection()->pluck('id'));
        $user = $request->user('sanctum');
        [$jp, $facts] = $user ? $this->candidate->for($user) : [null, []];

        return ApiResponse::data(
            $page->getCollection()->map(fn ($j) => (new JobResource($j, saved: $saved->contains($j->id), match: $user ? $this->scorer->score($j, $jp, $facts) : null))->toArray($request))->values(),
            ['page' => $page->currentPage(), 'per_page' => $page->perPage(), 'total' => $page->total(), 'last_page' => $page->lastPage()],
        );
    }

    public function show(Request $request, int $id)
    {
        $job = JobListing::listed()->with(['city.translations', 'source'])->findOrFail($id);
        $user = $request->user('sanctum');
        $match = null;
        if ($user) {
            [$jp, $facts] = $this->candidate->for($user);
            $match = $this->scorer->score($job, $jp, $facts);
        }

        return ApiResponse::data(new JobResource($job, full: true, match: $match, saved: $this->savedIds($request, collect([$id]))->contains($id)));
    }

    public function recommended(Request $request)
    {
        $user = $request->user();
        [$jp, $facts] = $this->candidate->for($user);

        $scored = JobListing::listed()->with(['city.translations', 'source'])->orderByDesc('published_at')->limit(300)->get()
            ->map(fn ($j) => ['job' => $j, 'match' => $this->scorer->score($j, $jp, $facts)])
            ->filter(fn ($r) => $r['match']['score'] !== null && $r['match']['score'] >= config('jobs.recommend_min_score') && $r['match']['confidence'] >= 20)
            ->sortByDesc(fn ($r) => [$r['match']['score'], $r['job']->published_at->timestamp])->take(20)->values();

        $saved = $this->savedIds($request, $scored->pluck('job.id'));

        return ApiResponse::data(
            $scored->map(fn ($r) => (new JobResource($r['job'], match: $r['match'], saved: $saved->contains($r['job']->id)))->toArray($request))->values(),
            ['personalized' => $jp !== null || $facts['italian_level'] !== null],
        );
    }

    public function saved(Request $request)
    {
        $ids = DB::table('job_saves')->where('user_id', $request->user()->id)->orderByDesc('id')->pluck('job_id');
        $jobs = JobListing::whereIn('id', $ids)->with(['city.translations', 'source'])->get()->sortBy(fn ($j) => $ids->search($j->id))->values();

        return ApiResponse::data($jobs->map(fn ($j) => (new JobResource($j, saved: true))->toArray($request))->values());
    }

    public function save(Request $request, int $id)
    {
        JobListing::listed()->findOrFail($id);
        DB::table('job_saves')->insertOrIgnore(['user_id' => $request->user()->id, 'job_id' => $id, 'created_at' => now()]);

        return response()->noContent();
    }

    public function unsave(Request $request, int $id)
    {
        DB::table('job_saves')->where('user_id', $request->user()->id)->where('job_id', $id)->delete();

        return response()->noContent();
    }

    /** Counts the click and hands back the original application page. EXPA never submits applications. */
    public function applyClick(Request $request, int $id)
    {
        $job = JobListing::listed()->findOrFail($id);
        $job->increment('apply_clicks');
        app(Analytics::class)->system(AnalyticsEvent::JobApplyClick);

        return ApiResponse::data(['apply_url' => $job->apply_url, 'submitted_by_expa' => false, 'notice' => __('jobs.apply_notice')]);
    }

    // ---- candidate preferences ----------------------------------------------------------------

    public function profile(Request $request)
    {
        return ApiResponse::data($this->profilePayload(JobProfile::where('user_id', $request->user()->id)->first()));
    }

    public function updateProfile(Request $request, ConsentService $consents)
    {
        $consents->require($request->user(), ConsentPurpose::ProfilePersonalization);
        $data = $request->validate([
            'skills' => ['sometimes', 'nullable', 'array', 'max:40'],
            'skills.*' => ['string', 'max:50'],
            'experience_years' => ['sometimes', 'nullable', 'integer', 'min:0', 'max:60'],
            'education' => ['sometimes', 'nullable', Rule::in(['none', 'school', 'vocational', 'bachelor', 'master', 'phd'])],
            'remote_preference' => ['sometimes', 'nullable', Rule::in(['any', 'remote_only', 'onsite_only'])],
            'employment_types' => ['sometimes', 'nullable', 'array', 'max:6'],
            'employment_types.*' => [Rule::enum(EmploymentType::class)],
            'salary_min_year' => ['sometimes', 'nullable', 'integer', 'min:0', 'max:1000000'],
            'city_id' => ['sometimes', 'nullable', 'integer', Rule::exists('cities', 'id')],
        ]);
        if (isset($data['skills'])) {
            $norm = app(TextNormalizer::class);
            $data['skills'] = array_values(array_unique(array_map(fn ($s) => $norm->normalize(strip_tags($s)), $data['skills'])));
        }

        $jp = JobProfile::firstOrNew(['user_id' => $request->user()->id]);
        $jp->user_id = $request->user()->id;
        $jp->fill($data)->save();

        return ApiResponse::data($this->profilePayload($jp));
    }

    private function profilePayload(?JobProfile $p): array
    {
        return [
            'skills' => $p?->skills ?? [], 'experience_years' => $p?->experience_years, 'education' => $p?->education,
            'remote_preference' => $p?->remote_preference, 'employment_types' => $p?->employment_types ?? [],
            'salary_min_year' => $p?->salary_min_year, 'city_id' => $p?->city_id,
        ];
    }

    private function savedIds(Request $request, $jobIds)
    {
        $user = $request->user('sanctum');

        return $user ? DB::table('job_saves')->where('user_id', $user->id)->whereIn('job_id', $jobIds)->pluck('job_id') : collect();
    }
}
