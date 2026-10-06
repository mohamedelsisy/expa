<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Domains\Ai\Models\AiMessage;
use App\Domains\Billing\Models\Payment;
use App\Domains\Billing\Models\Subscription;
use App\Domains\Guides\Models\Guide;
use App\Domains\Jobs\Models\JobImportRun;
use App\Domains\Jobs\Models\JobListing;
use App\Domains\Jobs\Models\JobSource;
use App\Enums\ContentStatus;
use App\Http\Controllers\Controller;
use App\Models\User;
use App\Support\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class StatsController extends Controller
{
    /** Admin dashboard numbers: counts and health only, never personal data. */
    public function overview(Request $request)
    {
        $since = now()->subDays(30);

        return ApiResponse::data([
            'users' => [
                'total' => User::count(),
                'new_30d' => User::where('created_at', '>=', $since)->count(),
                'active_30d' => User::where('last_login_at', '>=', $since)->count(),
            ],
            'ai' => ['questions_30d' => AiMessage::where('role', 'user')->where('created_at', '>=', $since)->count()],
            'content' => [
                'published_guides' => Guide::published()->count(),
                'pending_review' => collect(config('content.models'))->sum(fn ($c) => $c::where('status', ContentStatus::Review->value)->count()),
                'stale_sources' => Guide::published()->where(fn ($q) => $q->whereNull('last_verified_at')->orWhere('last_verified_at', '<', now()->subDays(config('content.freshness.stale_after_days'))))->count(),
            ],
            'jobs' => [
                'listed' => JobListing::listed()->count(),
                'imported_30d' => (int) JobImportRun::where('started_at', '>=', $since)->sum('created'),
                'failing_sources' => JobSource::where('last_status', 'failed')->orWhere(fn ($q) => $q->where('active', false)->where('consecutive_failures', '>', 0))->count(),
            ],
            // Revenue and payment figures need `reports.finance`; content managers only hold `reports.view` (BE-19).
            'billing' => $request->user()->can('reports.finance') ? [
                'active_subscriptions' => Subscription::whereIn('status', ['active', 'trialing'])->count(),
                'currency' => config('billing.currency'),
                'revenue_30d_minor' => (int) Payment::where('status', 'succeeded')->where('paid_at', '>=', $since)->sum('amount_minor'),
                'failed_payments_30d' => Payment::where('status', 'failed')->where('created_at', '>=', $since)->count(),
            ] : null,
            'system' => [
                'failed_queue_jobs' => (int) DB::table('failed_jobs')->count(),
                'pending_queue_jobs' => (int) DB::table('jobs')->count(),
                // minute heartbeat written by the scheduler: a stale value means `schedule:run` / the worker stopped (BE-9)
                'scheduler_heartbeat_at' => Cache::get('scheduler:heartbeat'),
            ],
        ]);
    }

    public function analytics(Request $request)
    {
        $data = $request->validate(['from' => ['nullable', 'date'], 'to' => ['nullable', 'date', 'after_or_equal:from'], 'name' => ['nullable', 'string', 'max:40']]);
        $from = $data['from'] ?? now()->subDays(29)->toDateString();
        $to = $data['to'] ?? now()->toDateString();

        $q = DB::table('analytics_daily')->whereBetween('day', [$from, $to])->when($data['name'] ?? null, fn ($w, $n) => $w->where('name', $n));

        return ApiResponse::data([
            'totals' => (clone $q)->selectRaw('name, sum(count) as total')->groupBy('name')->orderByDesc('total')->get()->map(fn ($r) => ['name' => $r->name, 'total' => (int) $r->total])->all(),
            'daily' => (clone $q)->selectRaw('day, name, sum(count) as total')->groupBy('day', 'name')->orderBy('day')->get()->map(fn ($r) => ['day' => $r->day, 'name' => $r->name, 'total' => (int) $r->total])->all(),
            'daily_totals' => (clone $q)->selectRaw('day, sum(count) as total')->groupBy('day')->orderBy('day')->get()->map(fn ($r) => ['day' => $r->day, 'total' => (int) $r->total])->all(),
            'top_content' => (clone $q)->where('subject', '!=', '')->selectRaw('name, subject, sum(count) as total')->groupBy('name', 'subject')->orderByDesc('total')->limit(20)->get()
                ->map(fn ($r) => ['name' => $r->name, 'subject' => $r->subject, 'total' => (int) $r->total])->all(),
        ]);
    }
}
