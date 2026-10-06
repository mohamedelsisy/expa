<?php

namespace App\Http\Controllers\Api\V1;

use App\Domains\Billing\Models\Invoice;
use App\Domains\Billing\Models\Plan;
use App\Domains\Billing\Services\SubscriptionService;
use App\Domains\Billing\Services\WebhookHandler;
use App\Http\Controllers\Controller;
use App\Support\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use InvalidArgumentException;

class BillingController extends Controller
{
    public function __construct(private SubscriptionService $subscriptions) {}

    public function plans()
    {
        $plans = Plan::where('active', true)->with('translations')->orderBy('sort_order')->get();

        return ApiResponse::data($plans->map(fn (Plan $p) => $this->plan($p))->values(), ['billing_available' => config('billing.provider') !== 'none'])->header('Cache-Control', 'public, max-age=300');
    }

    public function subscription(Request $request)
    {
        $user = $request->user();
        $sub = $this->subscriptions->current($user);
        $plan = $sub?->plan ?? Plan::where('key', 'free')->with('translations')->first();

        return ApiResponse::data([
            'plan' => $plan ? $this->plan($plan->loadMissing('translations')) : ['key' => 'free'],
            'status' => $sub?->status ?? 'free',
            'provider' => $sub?->provider,
            'current_period_end' => $sub?->current_period_end?->toIso8601String(),
            'cancel_at_period_end' => (bool) $sub?->cancel_at_period_end,
            'billing_available' => config('billing.provider') !== 'none',
        ]);
    }

    public function checkout(Request $request)
    {
        $data = $request->validate(['plan' => ['required', 'string', Rule::exists('plans', 'key')]]);
        $session = $this->subscriptions->checkout($request->user(), $data['plan'], app()->getLocale());

        return ApiResponse::data(['checkout_url' => $session->url]);
    }

    public function cancel(Request $request)
    {
        $sub = $this->subscriptions->cancel($request->user());

        return ApiResponse::data(['cancel_at_period_end' => true, 'access_until' => $sub->current_period_end?->toIso8601String()]);
    }

    public function invoices(Request $request)
    {
        return ApiResponse::data(Invoice::where('user_id', $request->user()->id)->latest('issued_at')->latest('id')->limit(200)->get()->map(fn (Invoice $i) => [
            'number' => $i->number, 'total_minor' => $i->total_minor, 'currency' => $i->currency, 'description' => $i->description, 'issued_at' => $i->issued_at->toIso8601String(),
        ] + ($i->tax_minor !== null ? ['net_minor' => $i->net_minor, 'tax' => ['rate' => $i->tax_rate, 'amount_minor' => $i->tax_minor, 'country' => $i->tax_country]] : []))->values());
    }

    /** Provider → EXPA. No user auth: authenticity comes solely from the signature the provider adapter verifies. */
    public function webhook(Request $request, WebhookHandler $handler, string $provider)
    {
        if (config('billing.provider') === 'none' || $provider !== config('billing.provider')) {
            abort(404);
        }

        try {
            $event = $this->subscriptions->provider()->parseWebhook($request->getContent(), array_change_key_case(array_map(fn ($v) => $v[0] ?? '', $request->headers->all()), CASE_LOWER));
        } catch (InvalidArgumentException) {
            return ApiResponse::error('invalid_webhook', __('errors.invalid_webhook'), 400);
        }

        $result = $event ? $handler->handle($provider, $event) : 'ignored';

        return response()->json(['received' => true, 'result' => $result]);
    }

    private function plan(Plan $p): array
    {
        return [
            'key' => $p->key,
            'name' => $p->localized('name'),
            'description' => $p->localized('description'),
            'price' => ['amount_minor' => $p->price_minor, 'currency' => $p->currency, 'interval' => $p->interval],
            'features' => $p->features ?? [],
        ];
    }
}
