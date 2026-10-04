<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Domains\Content\Services\ContentService;
use App\Enums\ContentStatus;
use App\Exceptions\ApiException;
use App\Http\Controllers\Controller;
use App\Http\Requests\ContentRequest;
use App\Http\Resources\AdminContentResource;
use App\Support\ApiResponse;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\Rule;

/**
 * Admin CRUD + workflow for one content model. A module only declares its model, resource, request and filters;
 * authorization comes from that model's ContentPolicy.
 */
abstract class ContentAdminController extends Controller
{
    /** @return class-string<Model> */
    abstract protected function modelClass(): string;

    /** @return class-string<AdminContentResource> */
    abstract protected function resourceClass(): string;

    /** @return class-string<ContentRequest> */
    abstract protected function requestClass(): string;

    /** @return list<string> columns the list may be sorted by */
    protected function sortable(): array
    {
        return ['id', 'slug', 'status', 'updated_at', 'last_verified_at'];
    }

    /** @return array<string,mixed> extra validation rules for `filter.*` / query params */
    protected function filterRules(): array
    {
        return [];
    }

    protected function applyFilters(Builder $query, Request $request): void {}

    /** Relations eager-loaded for list and detail. */
    protected function with(): array
    {
        return ['translations'];
    }

    public function __construct(protected ContentService $content) {}

    public function index(Request $request)
    {
        $class = $this->modelClass();
        Gate::authorize('viewAny', $class);
        $request->validate([
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
            'filter.status' => ['nullable', Rule::enum(ContentStatus::class)],
            'filter.q' => ['nullable', 'string', 'max:100'],
            'filter.stale' => ['nullable', 'boolean'],
        ] + $this->filterRules());

        $q = $class::query()->with($this->with());
        if ($s = $request->input('filter.status')) {
            $q->where('status', $s);
        }
        if ($term = $request->input('filter.q')) {
            $q->where(fn ($w) => $w->where('slug', 'like', '%'.addcslashes($term, '%_\\').'%')->orWhereHas('translations', fn ($t) => $t->where($this->primaryColumn(), 'like', '%'.addcslashes($term, '%_\\').'%')));
        }
        if ($request->boolean('filter.stale')) {
            $q->where(fn ($w) => $w->whereNull('last_verified_at')
                ->orWhere('last_verified_at', '<', now()->subDays(config('content.freshness.stale_after_days'))));
        }
        $this->applyFilters($q, $request);

        $sort = (string) $request->input('sort', '-updated_at');
        $col = ltrim($sort, '-');
        $q->orderBy(in_array($col, $this->sortable(), true) ? $col : 'updated_at', str_starts_with($sort, '-') ? 'desc' : 'asc')->orderBy('id');

        return ApiResponse::paginated($q->paginate((int) $request->input('per_page', 20)), $this->resourceClass());
    }

    public function show(int $id)
    {
        Gate::authorize('viewAny', $this->modelClass());
        $resource = $this->resourceClass();

        return ApiResponse::data(new $resource($this->find($id), full: true));
    }

    public function store()
    {
        Gate::authorize('create', $this->modelClass()); // authorization first: no validation feedback for people who may not write
        $request = app($this->requestClass());

        $item = $this->content->create($this->modelClass(), $request->validated(), $request->user());
        $resource = $this->resourceClass();

        return ApiResponse::data(new $resource($item->load($this->with()), full: true), status: 201);
    }

    public function update(int $id)
    {
        $item = $this->find($id);
        Gate::authorize('update', $item);
        $this->assertNotLocked(request(), $item);
        $request = app($this->requestClass());

        $item = $this->content->update($item, $request->validated(), $request->user());
        $resource = $this->resourceClass();

        return ApiResponse::data(new $resource($item->load($this->with()), full: true));
    }

    public function destroy(int $id)
    {
        $item = $this->find($id);
        Gate::authorize('delete', $item);
        $this->content->delete($item);

        return response()->noContent();
    }

    public function transition(Request $request, int $id)
    {
        $item = $this->find($id);
        Gate::authorize('viewAny', $this->modelClass()); // coarse check before input is even looked at
        $data = $request->validate(['to' => ['required', Rule::enum(ContentStatus::class)]]);
        $to = ContentStatus::from($data['to']);

        Gate::authorize('transition', [$item, $to]);
        $item->transitionTo($to);
        $resource = $this->resourceClass();

        return ApiResponse::data(new $resource($item->load($this->with()), full: true));
    }

    public function schedule(Request $request, int $id)
    {
        $item = $this->find($id);
        Gate::authorize('viewAny', $this->modelClass());
        $data = $request->validate(['publish_at' => ['required', 'date']]);
        Gate::authorize('transition', [$item, ContentStatus::Published]);

        $item->schedule(new \DateTimeImmutable($data['publish_at']));
        $resource = $this->resourceClass();

        return ApiResponse::data(new $resource($item->load($this->with()), full: true));
    }

    protected function find(int $id): Model
    {
        return $this->modelClass()::with($this->with())->findOrFail($id);
    }

    protected function primaryColumn(): string
    {
        return (new ($this->resourceClass())(null))->primaryField();
    }

    private function assertNotLocked(Request $request, Model $item): void
    {
        $policy = Gate::getPolicyFor($item);
        if ($policy->isLockedFor($request->user(), $item)) {
            throw new ApiException('content_locked', __('errors.content_locked'), 403);
        }
    }
}
