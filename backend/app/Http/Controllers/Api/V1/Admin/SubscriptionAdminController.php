<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Domains\Billing\Models\Plan;
use App\Domains\Billing\Models\Subscription;
use App\Domains\Billing\Services\SubscriptionService;
use App\Http\Controllers\Controller;
use App\Models\User;
use App\Support\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class SubscriptionAdminController extends Controller
{
    public function __construct(private SubscriptionService $subscriptions) {}

    public function index(Request $request)
    {
        $request->validate(['per_page' => ['nullable', 'integer', 'min:1', 'max:100'], 'filter.status' => ['nullable', Rule::in(['active', 'trialing', 'past_due', 'canceled', 'expired'])], 'filter.plan' => ['nullable', 'string', 'max:30']]);

        $q = Subscription::query()->with(['plan', 'user' => fn ($u) => $u->select('id', 'email')])->latest('id');
        if ($s = $request->input('filter.status')) {
            $q->where('status', $s);
        }
        if ($p = $request->input('filter.plan')) {
            $q->whereHas('plan', fn ($w) => $w->where('key', $p));
        }
        $page = $q->paginate((int) $request->input('per_page', 25));

        return ApiResponse::data($page->getCollection()->map(fn (Subscription $s) => [
            'id' => $s->id, 'user_id' => $s->user_id, 'user_email' => $s->user?->email, 'plan' => $s->plan->key, 'status' => $s->status, 'provider' => $s->provider,
            'current_period_end' => $s->current_period_end?->toIso8601String(), 'cancel_at_period_end' => $s->cancel_at_period_end,
        ])->values(), ['page' => $page->currentPage(), 'per_page' => $page->perPage(), 'total' => $page->total(), 'last_page' => $page->lastPage()]);
    }

    public function grant(Request $request)
    {
        $data = $request->validate([
            'user_id' => ['required', 'integer', Rule::exists('users', 'id')],
            'plan' => ['required', 'string', Rule::exists('plans', 'key')],
            'days' => ['required', 'integer', 'min:1', 'max:366'],
        ]);
        $sub = $this->subscriptions->grant(User::findOrFail($data['user_id']), Plan::where('key', $data['plan'])->firstOrFail(), $data['days'], $request->user());

        return ApiResponse::data(['id' => $sub->id, 'plan' => $data['plan'], 'current_period_end' => $sub->current_period_end->toIso8601String()], status: 201);
    }

    public function cancel(Request $request, int $id)
    {
        $sub = Subscription::findOrFail($id);
        $this->subscriptions->adminCancel($sub, $request->user());

        return ApiResponse::data(['id' => $sub->id, 'status' => 'canceled']);
    }
}
