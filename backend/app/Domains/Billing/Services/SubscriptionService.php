<?php

namespace App\Domains\Billing\Services;

use App\Domains\Audit\Services\AuditLogger;
use App\Domains\Billing\Contracts\PaymentProvider;
use App\Domains\Billing\Models\Plan;
use App\Domains\Billing\Models\Subscription;
use App\Exceptions\ApiException;
use App\Models\User;

class SubscriptionService
{
    public function __construct(private AuditLogger $audit) {}

    public function current(User $user): ?Subscription
    {
        return Subscription::where('user_id', $user->id)->with('plan')->latest('id')->get()
            ->filter(fn (Subscription $s) => $s->grantsAccess())
            ->sortByDesc(fn (Subscription $s) => $s->plan->sort_order)->first();
    }

    public function planKey(User $user): string
    {
        return $this->current($user)?->plan->key ?? 'free';
    }

    /** Feature value for the user's plan; falls back to the config catalogue when plans were never seeded. */
    public function feature(User $user, string $key, mixed $default = null): mixed
    {
        $plan = $this->current($user)?->plan ?? Plan::where('key', 'free')->first();
        if ($plan) {
            return $plan->feature($key, $default);
        }

        return $default ?? config("billing.plans.free.features.$key");
    }

    public function checkout(User $user, string $planKey, string $locale): CheckoutSession
    {
        $provider = $this->provider();
        $plan = Plan::where('key', $planKey)->where('active', true)->first();
        if (! $plan || $plan->price_minor <= 0) {
            throw new ApiException('plan_not_purchasable', __('errors.plan_not_purchasable'), 422);
        }
        if ($this->current($user)?->plan_id === $plan->id) {
            throw new ApiException('already_subscribed', __('errors.already_subscribed'), 409);
        }

        // Redirect targets are fixed server-side (never client-supplied) so checkout cannot become an open redirect.
        $base = rtrim(config('expa.frontend_url'), '/')."/$locale/billing";

        return $provider->createCheckout($user, $plan, "$base/success", "$base/cancelled");
    }

    /** User-initiated: keeps access until the paid period ends. */
    public function cancel(User $user): Subscription
    {
        $sub = $this->current($user);
        if (! $sub || $sub->provider === 'manual') {
            throw new ApiException('no_cancellable_subscription', __('errors.no_cancellable_subscription'), 404);
        }
        if (! $sub->cancel_at_period_end) {
            $this->provider()->cancelSubscription($sub);
            $sub->forceFill(['cancel_at_period_end' => true, 'canceled_at' => now()])->save();
            $this->audit->log('billing.subscription_cancel_requested', $sub, actor: $user);
        }

        return $sub;
    }

    /** Support/admin: complimentary access without a payment. */
    public function grant(User $user, Plan $plan, int $days, User $actor): Subscription
    {
        $sub = new Subscription(['plan_id' => $plan->id, 'status' => 'active', 'provider' => 'manual',
            'current_period_start' => now(), 'current_period_end' => now()->addDays($days)]);
        $sub->user_id = $user->id;
        $sub->save();
        $this->audit->log('admin.subscription.granted', $sub, ['plan' => $plan->key, 'days' => $days, 'user_id' => $user->id], $actor);

        return $sub;
    }

    /**
     * Support/admin cancel (BE-5): for a provider-backed subscription the provider is told FIRST, so the customer stops
     * being billed. If the provider call fails nothing changes locally and the admin gets an error to retry.
     */
    public function adminCancel(Subscription $sub, User $actor): void
    {
        if ($sub->provider !== 'manual' && ! SubscriptionState::isTerminal($sub->status)) {
            try {
                $this->provider()->cancelSubscription($sub, atPeriodEnd: false);
            } catch (ApiException $e) {
                throw $e;
            } catch (\Throwable $e) {
                report($e);
                throw new ApiException('billing_unavailable', __('errors.billing_unavailable'), 503);
            }
        }
        $sub->forceFill(['status' => 'canceled', 'canceled_at' => now()])->save();
        $this->audit->log('admin.subscription.canceled', $sub, actor: $actor);
    }

    public function provider(): PaymentProvider
    {
        if (config('billing.provider') === 'none') {
            throw new ApiException('billing_unavailable', __('errors.billing_unavailable'), 503);
        }

        return app(PaymentProvider::class);
    }
}
