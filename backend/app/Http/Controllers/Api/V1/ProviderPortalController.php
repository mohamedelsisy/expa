<?php

namespace App\Http\Controllers\Api\V1;

use App\Domains\Access\Models\Role;
use App\Domains\Access\Services\AccessSynchronizer;
use App\Domains\Audit\Services\AuditLogger;
use App\Domains\Content\Services\PublishGuard;
use App\Domains\Marketplace\Models\ProviderLead;
use App\Domains\Marketplace\Models\ProviderReview;
use App\Domains\Marketplace\Models\ServiceProvider;
use App\Domains\Marketplace\Services\EvidenceStore;
use App\Domains\Marketplace\Services\ReviewService;
use App\Domains\Marketplace\Services\VerificationService;
use App\Enums\ContentStatus;
use App\Exceptions\ApiException;
use App\Http\Controllers\Controller;
use App\Http\Requests\ProviderOwnerRequest;
use App\Http\Resources\AdminProviderResource;
use App\Support\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

/** A provider managing THEIR OWN listing. Every query is scoped to the listing owned by the authenticated user. */
class ProviderPortalController extends Controller
{
    public function __construct(private AuditLogger $audit) {}

    /** Any verified-email user may start a listing; it stays a private draft until an admin approves and publishes it. */
    public function apply(ProviderOwnerRequest $request)
    {
        $user = $request->user();
        if (ServiceProvider::withTrashed()->where('user_id', $user->id)->exists()) {
            throw new ApiException('provider_exists', __('marketplace.provider_exists'), 409);
        }
        $data = $request->validated();
        $p = new ServiceProvider;
        $p->slug = $this->slugFor($data['display_name']);
        $p->created_by = $user->id;
        $p->updated_by = $user->id;
        $p->user_id = $user->id;
        $p->applyData($data, ServiceProvider::ownerAttributes());
        app(AccessSynchronizer::class)->ensureRole('provider');
        $user->roles()->syncWithoutDetaching([Role::where('key', 'provider')->value('id')]);
        $this->audit->log('marketplace.provider_applied', $p);

        return ApiResponse::data($this->view($p->fresh()), status: 201);
    }

    public function show(Request $request)
    {
        return ApiResponse::data($this->view($request->attributes->get('provider')) + ['publish_problems' => app(PublishGuard::class)->problems($request->attributes->get('provider'))]);
    }

    public function update(ProviderOwnerRequest $request)
    {
        /** @var ServiceProvider $p */
        $p = $request->attributes->get('provider');
        $data = $request->validated();

        if ($p->status === ContentStatus::Published) {
            // Live listings change only after an admin approves the edit: keep the public version untouched.
            $p->forceFill(['pending_changes' => $data, 'pending_changes_at' => now()])->save();
            $this->audit->log('marketplace.changes_submitted', $p);
        } else {
            $p->updated_by = $request->user()->id;
            $p->applyData($data, ServiceProvider::ownerAttributes());
            if (in_array($p->status, [ContentStatus::Review, ContentStatus::Approved], true)) {
                $p->forceFill(['status' => ContentStatus::Draft, 'publish_at' => null])->save(); // content changed after review: resubmit
            }
        }

        return ApiResponse::data($this->view($p->fresh()), ['pending_admin_approval' => $p->status === ContentStatus::Published]);
    }

    /** Draft (or archived) -> review. Publication always needs an admin. */
    public function submit(Request $request)
    {
        /** @var ServiceProvider $p */
        $p = $request->attributes->get('provider');
        if ($p->status === ContentStatus::Archived) {
            $p->transitionTo(ContentStatus::Draft);
        }
        $problems = app(PublishGuard::class)->problems($p);
        if ($problems) {
            throw new ApiException('listing_incomplete', __('marketplace.listing_incomplete'), 422, ['problems' => $problems]);
        }
        $p->transitionTo(ContentStatus::Review);

        return ApiResponse::data($this->view($p->fresh()));
    }

    // ---- verification ------------------------------------------------------------------------

    public function evidence(Request $request)
    {
        return ApiResponse::data($request->attributes->get('provider')->evidence()->get(['id', 'original_name', 'mime', 'size', 'created_at']));
    }

    public function uploadEvidence(Request $request, EvidenceStore $store)
    {
        $request->validate(['file' => ['required', 'file']]);
        $doc = $store->store($request->attributes->get('provider'), $request->file('file'));
        $this->audit->log('marketplace.evidence_uploaded', $request->attributes->get('provider'));

        return ApiResponse::data(['id' => $doc->id, 'original_name' => $doc->original_name, 'mime' => $doc->mime, 'size' => $doc->size], status: 201);
    }

    public function deleteEvidence(Request $request, int $id, EvidenceStore $store)
    {
        $p = $request->attributes->get('provider');
        $store->delete($p->evidence()->findOrFail($id));

        return response()->noContent();
    }

    public function requestVerification(Request $request, VerificationService $verification)
    {
        return ApiResponse::data($this->view($verification->request($request->attributes->get('provider'))->fresh()));
    }

    // ---- leads -------------------------------------------------------------------------------

    public function leads(Request $request)
    {
        $request->validate(['status' => ['nullable', Rule::in(['new', 'seen', 'closed'])], 'per_page' => ['nullable', 'integer', 'min:1', 'max:50']]);
        $q = ProviderLead::where('service_provider_id', $request->attributes->get('provider')->id)->latest('id');
        if ($s = $request->query('status')) {
            $q->where('status', $s);
        }
        $page = $q->paginate((int) $request->query('per_page', 20));

        return ApiResponse::data($page->getCollection()->map(fn ($l) => $this->lead($l))->values(), [
            'page' => $page->currentPage(), 'per_page' => $page->perPage(), 'total' => $page->total(), 'last_page' => $page->lastPage(),
        ]);
    }

    public function updateLead(Request $request, int $id)
    {
        $data = $request->validate(['status' => ['required', Rule::in(['seen', 'closed'])]]);
        $lead = ProviderLead::where('service_provider_id', $request->attributes->get('provider')->id)->findOrFail($id);
        $lead->status = $data['status'];
        if ($data['status'] === 'seen' && ! $lead->seen_at) {
            $lead->seen_at = now();
        }
        $lead->save();

        return ApiResponse::data($this->lead($lead));
    }

    // ---- reviews -----------------------------------------------------------------------------

    public function reviews(Request $request)
    {
        $items = ProviderReview::where('service_provider_id', $request->attributes->get('provider')->id)->where('status', 'approved')->latest('id')->limit(100)->get();

        return ApiResponse::data($items->map(fn ($r) => ['id' => $r->id, 'rating' => $r->rating, 'body' => $r->body, 'created_at' => $r->created_at?->toDateString(),
            'reply' => $r->provider_reply, 'reply_status' => $r->provider_reply_status])->values());
    }

    public function reply(Request $request, int $id, ReviewService $reviews)
    {
        $data = $request->validate(['body' => ['required', 'string', 'max:3000']]);
        $review = ProviderReview::where('service_provider_id', $request->attributes->get('provider')->id)->findOrFail($id);
        $reviews->reply($review, $data['body']);

        return ApiResponse::data(['id' => $review->id, 'reply_status' => 'pending']);
    }

    // ------------------------------------------------------------------------------------------

    private function view(ServiceProvider $p): array
    {
        $p->unsetRelations();
        $p->load('translations');

        // Admin-only fields (commission, verification basis/verifier, internal ids) are never shown to the provider.
        return Arr::except((new AdminProviderResource($p, true))->resolve(), ['commission_percent', 'commission_note', 'verification_basis', 'verified_by', 'owner_user_id', 'created_by']);
    }

    private function lead(ProviderLead $l): array
    {
        // Contact details are only ever disclosed to the addressed provider, and only because the user consented for this request.
        return [
            'id' => $l->id, 'status' => $l->status, 'request_type' => $l->request_type, 'message' => $l->message,
            'contact' => ['name' => $l->contact_name, 'email' => $l->contact_email, 'phone' => $l->contact_phone],
            'preferred_language' => $l->preferred_language, 'consent_given_at' => $l->consent_given_at?->toIso8601String(),
            'created_at' => $l->created_at?->toIso8601String(),
        ];
    }

    private function slugFor(string $name): string
    {
        $base = trim(preg_replace('/[^a-z0-9]+/', '-', strtolower(Str::ascii($name))) ?? '', '-') ?: 'provider';
        $base = mb_substr($base, 0, 80);
        $slug = $base;
        while (ServiceProvider::withTrashed()->where('slug', $slug)->exists()) {
            $slug = $base.'-'.Str::lower(Str::random(5));
        }

        return $slug;
    }
}
