<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Domains\Guides\Enums\GuideCategory;
use App\Domains\Guides\Models\Guide;
use App\Domains\Guides\Services\GuideService;
use App\Enums\ContentStatus;
use App\Exceptions\ApiException;
use App\Http\Controllers\Controller;
use App\Http\Requests\GuideRequest;
use App\Http\Resources\AdminGuideResource;
use App\Policies\GuidePolicy;
use App\Support\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\Rule;

class GuideAdminController extends Controller
{
    private const SORTABLE = ['id', 'slug', 'category', 'status', 'updated_at', 'last_verified_at'];

    public function __construct(private GuideService $guides) {}

    public function index(Request $request)
    {
        Gate::authorize('viewAny', Guide::class);
        $request->validate([
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
            'filter.status' => ['nullable', Rule::enum(ContentStatus::class)],
            'filter.category' => ['nullable', Rule::enum(GuideCategory::class)],
            'filter.q' => ['nullable', 'string', 'max:100'],
            'filter.stale' => ['nullable', 'boolean'],
        ]);

        $q = Guide::query()->with('translations');
        if ($s = $request->input('filter.status')) {
            $q->where('status', $s);
        }
        if ($c = $request->input('filter.category')) {
            $q->where('category', $c);
        }
        if ($term = $request->input('filter.q')) {
            $q->where(fn ($w) => $w->where('slug', 'like', '%'.addcslashes($term, '%_\\').'%')->orWhere(fn ($m) => $m->matching($term)));
        }
        if ($request->boolean('filter.stale')) {
            $q->where(fn ($w) => $w->whereNull('last_verified_at')
                ->orWhere('last_verified_at', '<', now()->subDays(config('content.freshness.stale_after_days'))));
        }

        $sort = (string) $request->input('sort', '-updated_at');
        $col = ltrim($sort, '-');
        $q->orderBy(in_array($col, self::SORTABLE, true) ? $col : 'updated_at', str_starts_with($sort, '-') ? 'desc' : 'asc')->orderBy('id');

        return ApiResponse::paginated($q->paginate((int) $request->input('per_page', 20)), AdminGuideResource::class);
    }

    public function show(Guide $guide)
    {
        Gate::authorize('viewAny', Guide::class);

        return ApiResponse::data(new AdminGuideResource($guide->load('translations'), full: true));
    }

    public function store(GuideRequest $request)
    {
        Gate::authorize('create', Guide::class);

        $guide = $this->guides->create($request->validated(), $request->user());

        return ApiResponse::data(new AdminGuideResource($guide, full: true), status: 201);
    }

    public function update(GuideRequest $request, Guide $guide)
    {
        Gate::authorize('update', $guide);
        $this->assertNotLocked($request, $guide);

        $guide = $this->guides->update($guide, $request->validated(), $request->user());

        return ApiResponse::data(new AdminGuideResource($guide, full: true));
    }

    public function destroy(Request $request, Guide $guide)
    {
        Gate::authorize('delete', $guide);
        $this->guides->delete($guide);

        return response()->noContent();
    }

    public function transition(Request $request, Guide $guide)
    {
        $data = $request->validate(['to' => ['required', Rule::enum(ContentStatus::class)]]);
        $to = ContentStatus::from($data['to']);

        Gate::authorize('transition', [$guide, $to]);
        $guide->transitionTo($to);

        return ApiResponse::data(new AdminGuideResource($guide->load('translations'), full: true));
    }

    public function schedule(Request $request, Guide $guide)
    {
        $data = $request->validate(['publish_at' => ['required', 'date']]);
        Gate::authorize('transition', [$guide, ContentStatus::Published]);

        $guide->schedule(new \DateTimeImmutable($data['publish_at']));

        return ApiResponse::data(new AdminGuideResource($guide->load('translations'), full: true));
    }

    private function assertNotLocked(Request $request, Guide $guide): void
    {
        if (app(GuidePolicy::class)->isLockedFor($request->user(), $guide)) {
            throw new ApiException('content_locked', __('errors.content_locked'), 403);
        }
    }
}
