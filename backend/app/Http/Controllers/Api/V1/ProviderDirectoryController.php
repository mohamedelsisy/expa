<?php

namespace App\Http\Controllers\Api\V1;

use App\Domains\Geo\Models\City;
use App\Domains\Geo\Models\Region;
use App\Domains\Marketplace\Enums\ProviderCategory;
use App\Domains\Marketplace\Models\ProviderLead;
use App\Domains\Marketplace\Models\ProviderReview;
use App\Domains\Marketplace\Models\ServiceProvider;
use App\Domains\Marketplace\Services\LeadService;
use App\Domains\Marketplace\Services\ReviewService;
use App\Domains\Moderation\Services\ReportService;
use App\Http\Controllers\Controller;
use App\Http\Resources\ProviderResource;
use App\Http\Resources\ProviderReviewResource;
use App\Support\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

/** Public directory + the signed-in user's reviews, contact requests and reports. */
class ProviderDirectoryController extends Controller
{
    private const SORTS = ['relevance', 'rating', '-rating', 'name'];

    public function meta()
    {
        return ApiResponse::data([
            'categories' => collect(ProviderCategory::cases())->map(fn ($c) => ['value' => $c->value, 'label' => __('marketplace.categories.'.$c->value)])->all(),
            'notice' => __('marketplace.notice'),
            'list_unverified' => (bool) config('marketplace.list_unverified'),
            'sorts' => self::SORTS,
        ])->header('Cache-Control', 'public, max-age=300');
    }

    public function index(Request $request)
    {
        $request->validate([
            'category' => ['nullable', Rule::enum(ProviderCategory::class)],
            'city' => ['nullable', 'string', 'max:80'], 'region' => ['nullable', 'string', 'max:60'],
            'language' => ['nullable', 'string', 'regex:/^[a-z]{2}$/'], 'verified' => ['nullable', 'boolean'],
            'online' => ['nullable', 'boolean'], 'q' => ['nullable', 'string', 'max:100'],
            'sort' => ['nullable', Rule::in(self::SORTS)], 'per_page' => ['nullable', 'integer', 'min:1', 'max:50'],
        ]);

        $q = ServiceProvider::listable()->with(['translations', 'city.translations', 'region.translations']);
        if ($c = $request->query('category')) {
            $q->where('category', $c);
        }
        if ($slug = $request->query('city')) {
            $city = City::where('slug', $slug)->first();
            $q->where(fn ($w) => $this->coverage($w, $city, $city?->region_id, $request->boolean('online')));
        } elseif ($slug = $request->query('region')) {
            $rid = Region::where('slug', $slug)->orWhere('code', $slug)->value('id');
            $q->where(fn ($w) => $this->coverage($w, null, $rid, $request->boolean('online')));
        }
        if ($l = $request->query('language')) {
            $q->where('languages', 'like', '%"'.$l.'"%');
        }
        if ($request->boolean('verified')) {
            $q->where('verification_status', 'verified')->where(fn ($w) => $w->whereNull('verification_expires_at')->orWhere('verification_expires_at', '>', now()));
        }
        if ($term = $request->query('q')) {
            $like = '%'.addcslashes($term, '%_\\').'%';
            $q->where(fn ($w) => $w->where('display_name', 'like', $like)->orWhereHas('translations', fn ($t) => $t->where('headline', 'like', $like)));
        }

        match ($request->query('sort', 'relevance')) {
            'rating' => $q->orderByRaw('rating_avg is null')->orderBy('rating_avg'),
            '-rating' => $q->orderByRaw('rating_avg is null')->orderByDesc('rating_avg'),
            'name' => $q->orderBy('display_name'),
            // verified first, then by rating, then admin ordering
            default => $q->orderByRaw("case when verification_status = 'verified' then 0 else 1 end")->orderByRaw('rating_avg is null')->orderByDesc('rating_avg')->orderBy('sort_order'),
        };
        $q->orderBy('service_providers.id');

        return ApiResponse::paginated($q->paginate((int) $request->query('per_page', 20)), ProviderResource::class)->header('Cache-Control', 'public, max-age=120');
    }

    public function show(string $slug)
    {
        $p = $this->find($slug, ['areas', 'services.translations']);

        return ApiResponse::data(new ProviderResource($p, full: true))->header('Cache-Control', 'public, max-age=120');
    }

    public function reviews(Request $request, string $slug)
    {
        $request->validate(['per_page' => ['nullable', 'integer', 'min:1', 'max:50']]);
        $p = $this->find($slug);
        $page = ProviderReview::where('service_provider_id', $p->id)->where('status', 'approved')->orderByDesc('created_at')->orderByDesc('id')->paginate((int) $request->query('per_page', 20));

        return ApiResponse::paginated($page, ProviderReviewResource::class);
    }

    public function storeReview(Request $request, string $slug, ReviewService $reviews)
    {
        $data = $request->validate(['rating' => ['required', 'integer', 'between:1,5'], 'body' => ['nullable', 'string', 'max:5000']]);
        $review = $reviews->create($request->user(), $this->find($slug), $data['rating'], $data['body'] ?? null);

        return ApiResponse::data($this->mine($review), status: 201);
    }

    public function myReviews(Request $request)
    {
        $items = ProviderReview::where('user_id', $request->user()->id)->with('provider')->latest('id')->limit(100)->get();

        return ApiResponse::data($items->map(fn ($r) => $this->mine($r) + ['provider' => ['slug' => $r->provider->slug, 'display_name' => $r->provider->display_name]])->values());
    }

    public function destroyReview(Request $request, int $id, ReviewService $reviews)
    {
        $r = ProviderReview::where('user_id', $request->user()->id)->with('provider')->findOrFail($id); // other people's reviews are simply "not found"
        $reviews->delete($r);

        return response()->noContent();
    }

    public function reportReview(Request $request, int $id, ReportService $reports)
    {
        $data = $request->validate(['reason' => ['required', Rule::in(config('moderation.report_reasons'))], 'note' => ['nullable', 'string', 'max:500']]);
        $review = ProviderReview::where('status', 'approved')->findOrFail($id);
        $reports->report($request->user(), 'provider_review', $review->id, $data['reason'], $data['note'] ?? null);

        return ApiResponse::data(['message' => __('moderation.report_received')], status: 201);
    }

    public function storeLead(Request $request, string $slug, LeadService $leads)
    {
        $data = $request->validate([
            'message' => ['required', 'string', 'max:5000'],
            'request_type' => ['nullable', Rule::in(['contact', 'booking'])],
            'preferred_language' => ['nullable', 'string', 'regex:/^[a-z]{2}$/'],
            'contact_name' => ['nullable', 'string', 'max:120'], 'contact_email' => ['nullable', 'email:rfc', 'max:190'],
            'contact_phone' => ['nullable', 'string', 'regex:/^\+?[0-9 ()\-]{6,25}$/'],
            'consent_share_contact' => ['required', 'accepted'],
        ]);
        $lead = $leads->create($request->user(), $this->find($slug), $data);

        return ApiResponse::data($this->leadPayload($lead) + ['notice' => __('marketplace.lead_notice')], status: 201);
    }

    public function myLeads(Request $request)
    {
        $items = ProviderLead::where('user_id', $request->user()->id)->with('provider')->latest('id')->limit(100)->get();

        return ApiResponse::data($items->map(fn ($l) => $this->leadPayload($l) + ['provider' => ['slug' => $l->provider->slug, 'display_name' => $l->provider->display_name]])->values());
    }

    private function find(string $slug, array $with = []): ServiceProvider
    {
        return ServiceProvider::listable()->with(['translations', 'city.translations', 'region.translations', ...$with])->where('slug', $slug)->firstOrFail();
    }

    private function coverage($w, ?City $city, ?int $regionId, bool $online): void
    {
        $w->when($city, fn ($x) => $x->orWhere('city_id', $city->id))
            ->when($regionId, fn ($x) => $x->orWhere(fn ($r) => $r->where('region_id', $regionId)->whereNull('city_id')))
            ->orWhereIn('service_providers.id', DB::table('provider_areas')->where(function ($a) use ($city, $regionId) {
                $a->when($city, fn ($x) => $x->orWhere('city_id', $city->id))->when($regionId, fn ($x) => $x->orWhere(fn ($r) => $r->where('region_id', $regionId)->whereNull('city_id')));
                if (! $city && ! $regionId) {
                    $a->whereRaw('1 = 0');
                }
            })->select('service_provider_id'));
        if ($online) {
            $w->orWhere('serves_online', true);
        }
        if (! $city && ! $regionId && ! $online) {
            $w->orWhereRaw('1 = 0');
        }
    }

    private function mine(ProviderReview $r): array
    {
        return ['id' => $r->id, 'rating' => $r->rating, 'body' => $r->body, 'status' => $r->status, 'created_at' => $r->created_at?->toIso8601String(), 'moderation_reason' => $r->status === 'rejected' ? $r->moderation_reason : null];
    }

    private function leadPayload(ProviderLead $l): array
    {
        return ['id' => $l->id, 'status' => $l->status, 'request_type' => $l->request_type, 'created_at' => $l->created_at?->toIso8601String(), 'message' => $l->message];
    }
}
