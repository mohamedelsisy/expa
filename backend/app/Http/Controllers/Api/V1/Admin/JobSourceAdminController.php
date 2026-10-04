<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Domains\Audit\Services\AuditLogger;
use App\Domains\Jobs\Models\JobImportRun;
use App\Domains\Jobs\Models\JobListing;
use App\Domains\Jobs\Models\JobSource;
use App\Domains\Jobs\Services\SafeHttp;
use App\Domains\Search\Services\SearchIndexer;
use App\Http\Controllers\Controller;
use App\Jobs\RunJobImport;
use App\Support\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use RuntimeException;

class JobSourceAdminController extends Controller
{
    public function __construct(private AuditLogger $audit) {}

    public function index()
    {
        return ApiResponse::data(JobSource::orderBy('name')->get()->map(fn ($s) => $this->present($s))->values());
    }

    public function show(int $id)
    {
        return ApiResponse::data($this->present(JobSource::findOrFail($id)) + ['recent_runs' => $this->runs($id, 5)]);
    }

    public function store(Request $request)
    {
        $data = $this->validated($request, creating: true);
        $source = new JobSource($data);
        $source->save();
        $this->audit->log('job_source.created', $source, ['active' => $source->active]);

        return ApiResponse::data($this->present($source), status: 201);
    }

    public function update(Request $request, int $id)
    {
        $source = JobSource::findOrFail($id);
        $data = $this->validated($request, creating: false, existing: $source);
        $old = ['active' => $source->active, 'schedule_hours' => $source->schedule_hours];

        if (isset($data['config'])) {
            // partial config updates merge: you cannot accidentally wipe the URL by sending only `map`
            $data['config'] = array_merge($source->config ?? [], $data['config']);
        }
        $source->fill($data)->save();
        if (($data['active'] ?? null) === true) {
            $source->forceFill(['consecutive_failures' => 0])->save();
        }
        $this->audit->log('job_source.updated', $source, ['active' => ['old' => $old['active'], 'new' => $source->active], 'schedule_hours' => ['old' => $old['schedule_hours'], 'new' => $source->schedule_hours]]);

        return ApiResponse::data($this->present($source));
    }

    public function destroy(int $id)
    {
        $source = JobSource::findOrFail($id);
        $this->audit->log('job_source.deleted', $source);
        $source->delete();
        app(SearchIndexer::class)->pruneJobs();

        return response()->noContent();
    }

    public function run(int $id)
    {
        $source = JobSource::findOrFail($id);
        abort_unless($source->active, 422, 'Source is not active.');
        RunJobImport::dispatch($source->id);

        return ApiResponse::data(['queued' => true], status: 202);
    }

    public function runsIndex(int $id)
    {
        JobSource::findOrFail($id);

        return ApiResponse::data($this->runs($id, 50));
    }

    public function jobs(Request $request)
    {
        $request->validate(['per_page' => ['nullable', 'integer', 'min:1', 'max:100'], 'filter.status' => ['nullable', Rule::in(['published', 'expired', 'hidden'])], 'filter.source_id' => ['nullable', 'integer'], 'filter.q' => ['nullable', 'string', 'max:100']]);
        $q = JobListing::query()->with('source');
        if ($s = $request->input('filter.status')) {
            $q->where('status', $s);
        }
        if ($s = $request->input('filter.source_id')) {
            $q->where('job_source_id', $s);
        }
        if ($t = $request->input('filter.q')) {
            $like = '%'.addcslashes($t, '%_\\').'%';
            $q->where(fn ($w) => $w->where('title', 'like', $like)->orWhere('company', 'like', $like));
        }
        $page = $q->latest('id')->paginate((int) $request->input('per_page', 25));

        return ApiResponse::data($page->getCollection()->map(fn ($j) => [
            'id' => $j->id, 'title' => $j->title, 'company' => $j->company, 'status' => $j->status, 'source' => $j->source?->name,
            'published_at' => $j->published_at?->toIso8601String(), 'apply_clicks' => $j->apply_clicks,
        ])->values(), ['page' => $page->currentPage(), 'per_page' => $page->perPage(), 'total' => $page->total(), 'last_page' => $page->lastPage()]);
    }

    public function setJobStatus(Request $request, int $id)
    {
        $data = $request->validate(['status' => ['required', Rule::in(['published', 'hidden'])]]);
        $job = JobListing::findOrFail($id);
        $old = $job->status;
        $job->forceFill($data)->save();
        app(SearchIndexer::class)->syncJob($job);
        $this->audit->log('job.status_changed', $job, ['status' => ['old' => $old, 'new' => $job->status]]);

        return ApiResponse::data(['id' => $job->id, 'status' => $job->status]);
    }

    // ---- helpers ------------------------------------------------------------------------------

    private function validated(Request $request, bool $creating, ?JobSource $existing = null): array
    {
        $req = $creating ? 'required' : 'sometimes';
        $data = $request->validate([
            'key' => [$req, 'string', 'max:60', 'regex:/^[a-z0-9]+(?:[-_][a-z0-9]+)*$/', Rule::unique('job_sources', 'key')->ignore($existing?->id)],
            'name' => [$req, 'string', 'max:200'],
            'driver' => [$req, Rule::in(['json_feed', 'rss'])],
            'config' => [$req, 'array'],
            'config.url' => [$creating ? 'required' : 'sometimes', 'string', 'max:2048', 'url:https'],
            'config.items_path' => ['sometimes', 'nullable', 'string', 'max:100'],
            'config.company_default' => ['sometimes', 'nullable', 'string', 'max:200'],
            'config.headers' => ['sometimes', 'array', 'max:10'],
            'config.headers.*' => ['string', 'max:500'],
            'config.map' => ['sometimes', 'array', 'max:30'],
            'config.map.*' => ['string', 'max:100'],
            'legal_basis' => ['sometimes', 'nullable', 'string', 'max:2000'],
            'active' => ['sometimes', 'boolean'],
            'schedule_hours' => ['sometimes', 'integer', 'min:1', 'max:168'],
        ]);

        // A source may only run with a documented permission for automated use of that source.
        $legal = array_key_exists('legal_basis', $data) ? $data['legal_basis'] : $existing?->legal_basis;
        $active = $data['active'] ?? $existing?->active ?? false;
        if ($active && strlen(trim((string) $legal)) < 20) {
            throw ValidationException::withMessages(['legal_basis' => [__('errors.legal_basis_required')]]);
        }

        if (isset($data['config']['url'])) {
            try {
                app(SafeHttp::class)->assertSafe($data['config']['url']);
            } catch (RuntimeException $e) {
                throw ValidationException::withMessages(['config.url' => [$e->getMessage()]]);
            }
        }

        return $data;
    }

    private function present(JobSource $s): array
    {
        $cfg = $s->config ?? [];

        return [
            'id' => $s->id, 'key' => $s->key, 'name' => $s->name, 'driver' => $s->driver, 'active' => $s->active,
            'schedule_hours' => $s->schedule_hours, 'legal_basis' => $s->legal_basis,
            // The URL/headers may carry tokens: only the host and the shape of the config are returned.
            'config_summary' => ['host' => parse_url($cfg['url'] ?? '', PHP_URL_HOST), 'has_headers' => ! empty($cfg['headers']), 'items_path' => $cfg['items_path'] ?? null, 'map' => $cfg['map'] ?? []],
            'last_run_at' => $s->last_run_at?->toIso8601String(), 'last_status' => $s->last_status, 'consecutive_failures' => $s->consecutive_failures,
        ];
    }

    private function runs(int $sourceId, int $limit): array
    {
        return JobImportRun::where('job_source_id', $sourceId)->latest('id')->limit($limit)->get()->map(fn ($r) => [
            'id' => $r->id, 'status' => $r->status, 'fetched' => $r->fetched, 'created' => $r->created, 'updated' => $r->updated,
            'unchanged' => $r->unchanged, 'duplicates' => $r->duplicates, 'invalid' => $r->invalid, 'error_samples' => $r->error_samples,
            'error_message' => $r->error_message, 'started_at' => $r->started_at?->toIso8601String(), 'finished_at' => $r->finished_at?->toIso8601String(),
        ])->all();
    }
}
