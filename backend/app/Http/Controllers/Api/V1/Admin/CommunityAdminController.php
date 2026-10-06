<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Domains\Audit\Services\AuditLogger;
use App\Domains\Community\Models\Question;
use App\Domains\Community\Models\Restriction;
use App\Domains\Community\Services\CommunityService;
use App\Domains\Guides\Models\Guide;
use App\Domains\Moderation\Models\ContentReport;
use App\Domains\Moderation\Services\ReportService;
use App\Http\Controllers\Controller;
use App\Models\User;
use App\Support\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

/** Community moderation. Permissions (community.moderate / community.restrict_users) are enforced by the routes. */
class CommunityAdminController extends Controller
{
    private const TYPES = ['community_question', 'community_answer', 'community_comment'];

    public function __construct(private CommunityService $svc, private AuditLogger $audit) {}

    public function queue(Request $request)
    {
        $request->validate([
            'type' => ['nullable', Rule::in(['question', 'answer', 'comment'])],
            'status' => ['nullable', Rule::in(['pending', 'approved', 'hidden', 'removed'])],
            'flagged' => ['nullable', 'boolean'], 'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
        ]);
        $class = CommunityService::modelFor($request->query('type', 'question'));
        $q = $class::query()->where('status', $request->query('status', 'pending'))->orderBy('flagged', 'desc')->orderBy('id');
        if ($request->has('flagged')) {
            $q->where('flagged', $request->boolean('flagged'));
        }
        $page = $q->paginate((int) $request->query('per_page', 30));

        return ApiResponse::data($page->getCollection()->map(fn ($p) => $this->row($p))->values(), [
            'page' => $page->currentPage(), 'per_page' => $page->perPage(), 'total' => $page->total(), 'last_page' => $page->lastPage(),
        ]);
    }

    public function moderate(Request $request, int $id, string $type)
    {
        $d = $request->validate(['action' => ['required', Rule::in(['approve', 'hide', 'remove'])], 'reason' => ['required_if:action,hide,remove', 'nullable', 'string', 'max:255']]);
        $item = CommunityService::modelFor($type)::findOrFail($id);
        $this->svc->moderate($item, $request->user(), $d['action'], $d['reason'] ?? null);

        return ApiResponse::data($this->row($item->fresh()));
    }

    /** Pin (or clear) the official guide shown on a question: a moderator decision, validated against published guides only. */
    public function officialGuide(Request $request, int $id)
    {
        $d = $request->validate(['guide_slug' => ['present', 'nullable', 'string', 'max:120']]);
        $q = Question::findOrFail($id);
        $guide = $d['guide_slug'] ? Guide::published()->where('slug', $d['guide_slug'])->firstOrFail() : null;
        $q->forceFill(['official_guide_id' => $guide?->id])->save();
        $this->audit->log('community.official_guide_set', $q, ['guide' => $guide?->slug]);

        return ApiResponse::data($this->row($q->fresh()));
    }

    public function reports(Request $request)
    {
        $request->validate(['status' => ['nullable', Rule::in(['open', 'resolved', 'dismissed'])]]);
        $items = ContentReport::whereIn('reportable_type', self::TYPES)->where('status', $request->query('status', 'open'))->orderBy('id')->limit(200)->get();

        return ApiResponse::data($items->map(fn ($r) => [
            'id' => $r->id, 'type' => substr($r->reportable_type, 10), 'target_id' => $r->reportable_id, 'reason' => $r->reason, 'note' => $r->note,
            'status' => $r->status, 'created_at' => $r->created_at?->toIso8601String(),
        ])->values());
    }

    public function resolveReport(Request $request, int $id, ReportService $reports)
    {
        $d = $request->validate(['status' => ['required', Rule::in(['resolved', 'dismissed'])], 'action' => ['nullable', Rule::in(['hide', 'remove'])], 'reason' => ['required_with:action', 'nullable', 'string', 'max:255']]);
        $report = ContentReport::whereIn('reportable_type', self::TYPES)->findOrFail($id);
        if (! empty($d['action'])) {
            $item = CommunityService::modelFor(substr($report->reportable_type, 10))::find($report->reportable_id);
            $item && $this->svc->moderate($item, $request->user(), $d['action'], $d['reason']);
        }
        $reports->resolve($report, $request->user(), $d['status']);
        $this->audit->log('community.report_'.$d['status'], $report);

        return ApiResponse::data(['id' => $report->id, 'status' => $report->status]);
    }

    // ---- user restrictions (community.restrict_users) ----------------------------------------

    public function showRestriction(int $userId)
    {
        $r = Restriction::where('user_id', $userId)->first();

        return ApiResponse::data($r ? ['shadow_banned' => $r->shadow_banned, 'muted_until' => $r->muted_until?->toIso8601String(), 'reason' => $r->reason] : null);
    }

    public function restrict(Request $request, int $userId)
    {
        $d = $request->validate(['shadow_banned' => ['sometimes', 'boolean'], 'muted_until' => ['sometimes', 'nullable', 'date', 'after:now'], 'reason' => ['required', 'string', 'max:255']]);
        $user = User::findOrFail($userId);
        if ($user->hasPrivilegedRole() || $user->hasPermission('community.moderate') || $user->id === $request->user()->id) {
            abort(403); // moderators and staff cannot be restricted through this endpoint
        }
        $r = Restriction::firstOrNew(['user_id' => $user->id]);
        $r->fill(collect($d)->only(['shadow_banned', 'muted_until', 'reason'])->all());
        $r->user_id = $user->id;
        $r->set_by = $request->user()->id;
        $r->save();
        $this->audit->log('community.user_restricted', $user, ['shadow_banned' => $r->shadow_banned, 'muted_until' => $r->muted_until?->toIso8601String(), 'reason' => $d['reason']]);

        return ApiResponse::data(['shadow_banned' => $r->shadow_banned, 'muted_until' => $r->muted_until?->toIso8601String()]);
    }

    public function lift(Request $request, int $userId)
    {
        $user = User::findOrFail($userId);
        Restriction::where('user_id', $user->id)->delete();
        $this->audit->log('community.user_restriction_lifted', $user);

        return response()->noContent();
    }

    private function row($p): array
    {
        return [
            'id' => $p->id, 'type' => ['community_questions' => 'question', 'community_answers' => 'answer', 'community_comments' => 'comment'][$p->getTable()],
            'title' => $p->title ?? null, 'body' => $p->body, 'status' => $p->status, 'flagged' => $p->flagged, 'shadowed' => $p->shadowed,
            'author_id' => $p->user_id, // moderators may see the account; the public API never does
            'moderation_reason' => $p->moderation_reason, 'created_at' => $p->created_at?->toIso8601String(),
            'open_reports' => ContentReport::where('reportable_type', 'community_'.['community_questions' => 'question', 'community_answers' => 'answer', 'community_comments' => 'comment'][$p->getTable()])->where('reportable_id', $p->id)->where('status', 'open')->count(),
        ];
    }
}
