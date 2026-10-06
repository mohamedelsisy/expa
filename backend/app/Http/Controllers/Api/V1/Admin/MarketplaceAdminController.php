<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Domains\Audit\Services\AuditLogger;
use App\Domains\Content\Services\PublishGuard;
use App\Domains\Marketplace\Enums\VerificationStatus;
use App\Domains\Marketplace\Models\ProviderReview;
use App\Domains\Marketplace\Models\ServiceProvider;
use App\Domains\Marketplace\Services\EvidenceStore;
use App\Domains\Marketplace\Services\ReviewService;
use App\Domains\Marketplace\Services\VerificationService;
use App\Domains\Moderation\Models\ContentReport;
use App\Domains\Moderation\Services\ReportService;
use App\Exceptions\ApiException;
use App\Http\Controllers\Controller;
use App\Http\Resources\AdminProviderResource;
use App\Support\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

/** Marketplace back office: verification queue, evidence, owner-change approvals, review moderation, reports. Permissions are on the routes. */
class MarketplaceAdminController extends Controller
{
    public function __construct(private AuditLogger $audit) {}

    // ---- verification (providers.verify) -----------------------------------------------------

    public function verificationQueue()
    {
        $pending = ServiceProvider::where('verification_status', VerificationStatus::Pending->value)->with('translations')->orderBy('verification_requested_at')->get();
        $expiring = ServiceProvider::where('verification_status', VerificationStatus::Verified->value)
            ->where('verification_expires_at', '<=', now()->addDays(30))->with('translations')->orderBy('verification_expires_at')->get();

        return ApiResponse::data([
            'pending' => AdminProviderResource::collection($pending)->resolve(),
            'expiring' => AdminProviderResource::collection($expiring)->resolve(),
        ]);
    }

    public function verify(Request $request, int $id, VerificationService $verification)
    {
        $p = ServiceProvider::with('translations')->findOrFail($id);
        $data = $request->validate([
            'action' => ['required', Rule::in(['approve', 'reject'])],
            'basis' => ['required_if:action,approve', 'nullable', 'string', 'min:10', 'max:2000'],
            'expires_at' => ['nullable', 'date', 'after:today'],
            'reason' => ['required_if:action,reject', 'nullable', 'string', 'max:255'],
        ]);
        if ($p->user_id === $request->user()->id) {
            throw new ApiException('cannot_verify_own_listing', __('marketplace.cannot_verify_own_listing'), 403);
        }
        if ($data['action'] === 'approve') {
            $verification->approve($p, $request->user(), strip_tags($data['basis']), isset($data['expires_at']) ? new \DateTimeImmutable($data['expires_at']) : null);
        } else {
            $verification->reject($p, $request->user(), $data['reason']);
        }

        return ApiResponse::data((new AdminProviderResource($p->fresh('translations'), true))->resolve());
    }

    public function evidence(int $id)
    {
        $p = ServiceProvider::findOrFail($id);
        $this->audit->log('marketplace.evidence_listed', $p);

        return ApiResponse::data($p->evidence()->get(['id', 'original_name', 'mime', 'size', 'sha256', 'created_at']));
    }

    public function downloadEvidence(int $id, int $docId, EvidenceStore $store)
    {
        $p = ServiceProvider::findOrFail($id);
        $doc = $p->evidence()->findOrFail($docId);
        $this->audit->log('marketplace.evidence_downloaded', $p, ['document' => $doc->id]);

        return response($store->read($doc), 200, [
            'Content-Type' => $doc->mime,
            'Content-Disposition' => 'attachment; filename="evidence-'.$doc->id.'"',
            'X-Content-Type-Options' => 'nosniff', 'Cache-Control' => 'no-store, private',
        ]);
    }

    // ---- owner edits to live listings (providers.publish) ------------------------------------

    public function pendingChanges(Request $request, int $id)
    {
        $p = ServiceProvider::with('translations')->findOrFail($id);
        $data = $request->validate(['action' => ['required', Rule::in(['approve', 'reject'])]]);
        if ($p->pending_changes === null) {
            throw new ApiException('no_pending_changes', __('marketplace.no_pending_changes'), 404);
        }
        if ($data['action'] === 'approve') {
            DB::transaction(function () use ($p) {
                $p->applyData($p->pending_changes, ServiceProvider::ownerAttributes());
                $bad = app(PublishGuard::class)->problems($p->fresh('translations'));
                if ($bad) {
                    throw new ApiException('content_not_publishable', __('errors.content_not_publishable'), 422, ['problems' => $bad]); // rolls the edit back
                }
            });
            $this->audit->log('marketplace.changes_approved', $p);
        } else {
            $this->audit->log('marketplace.changes_rejected', $p);
        }
        $p->forceFill(['pending_changes' => null, 'pending_changes_at' => null])->save();

        return ApiResponse::data((new AdminProviderResource($p->fresh('translations'), true))->resolve());
    }

    // ---- reviews (provider_reviews.moderate) --------------------------------------------------

    public function reviews(Request $request)
    {
        $request->validate(['status' => ['nullable', Rule::in(['pending', 'approved', 'rejected', 'reply_pending'])], 'per_page' => ['nullable', 'integer', 'min:1', 'max:100']]);
        $status = $request->query('status', 'pending');
        $q = ProviderReview::with('provider')->orderBy('created_at')->orderBy('id');
        $status === 'reply_pending' ? $q->where('provider_reply_status', 'pending') : $q->where('status', $status);
        $page = $q->paginate((int) $request->query('per_page', 30));

        return ApiResponse::data($page->getCollection()->map(fn (ProviderReview $r) => [
            'id' => $r->id, 'provider' => ['id' => $r->provider->id, 'display_name' => $r->provider->display_name],
            'rating' => $r->rating, 'body' => $r->body, 'locale' => $r->locale, 'status' => $r->status,
            'reply' => $r->provider_reply, 'reply_status' => $r->provider_reply_status,
            'moderation_reason' => $r->moderation_reason, 'created_at' => $r->created_at?->toIso8601String(),
            'open_reports' => ContentReport::where('reportable_type', 'provider_review')->where('reportable_id', $r->id)->where('status', 'open')->count(),
        ])->values(), ['page' => $page->currentPage(), 'per_page' => $page->perPage(), 'total' => $page->total(), 'last_page' => $page->lastPage()]);
    }

    public function moderateReview(Request $request, int $id, ReviewService $reviews)
    {
        $data = $request->validate(['decision' => ['required', Rule::in(['approved', 'rejected'])], 'reason' => ['required_if:decision,rejected', 'nullable', 'string', 'max:255']]);
        $r = $reviews->moderate(ProviderReview::with('provider')->findOrFail($id), $request->user(), $data['decision'], $data['reason'] ?? null);

        return ApiResponse::data(['id' => $r->id, 'status' => $r->status, 'provider_rating' => ['average' => $r->provider->rating_avg, 'count' => $r->provider->rating_count]]);
    }

    public function moderateReply(Request $request, int $id, ReviewService $reviews)
    {
        $data = $request->validate(['decision' => ['required', Rule::in(['approved', 'rejected'])]]);
        $r = ProviderReview::whereNotNull('provider_reply')->findOrFail($id);
        $reviews->moderateReply($r, $request->user(), $data['decision']);

        return ApiResponse::data(['id' => $r->id, 'reply_status' => $r->provider_reply_status]);
    }

    // ---- reports -----------------------------------------------------------------------------

    public function reports(Request $request)
    {
        $request->validate(['status' => ['nullable', Rule::in(['open', 'resolved', 'dismissed'])]]);
        $items = ContentReport::where('reportable_type', 'provider_review')->where('status', $request->query('status', 'open'))->orderBy('id')->limit(200)->get();

        return ApiResponse::data($items->map(fn ($r) => ['id' => $r->id, 'review_id' => $r->reportable_id, 'reason' => $r->reason, 'note' => $r->note, 'status' => $r->status, 'created_at' => $r->created_at?->toIso8601String()])->values());
    }

    public function resolveReport(Request $request, int $id, ReportService $reports, ReviewService $reviews)
    {
        $data = $request->validate(['status' => ['required', Rule::in(['resolved', 'dismissed'])], 'reject_review' => ['nullable', 'boolean'], 'reason' => ['nullable', 'string', 'max:255']]);
        $report = ContentReport::where('reportable_type', 'provider_review')->findOrFail($id);
        if ($request->boolean('reject_review')) {
            $review = ProviderReview::with('provider')->find($report->reportable_id);
            $review && $reviews->moderate($review, $request->user(), 'rejected', $data['reason'] ?? 'report upheld');
        }
        $reports->resolve($report, $request->user(), $data['status']);
        $this->audit->log('marketplace.report_'.$data['status'], $report);

        return ApiResponse::data(['id' => $report->id, 'status' => $report->status]);
    }
}
