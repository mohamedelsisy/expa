<?php

namespace App\Domains\Billing\Services;

use App\Domains\Analytics\Analytics;
use App\Domains\Analytics\AnalyticsEvent;
use App\Domains\Billing\Models\Invoice;
use App\Domains\Billing\Models\Payment;
use App\Domains\Billing\Models\Plan;
use App\Domains\Billing\Models\Subscription;
use App\Models\User;
use Illuminate\Support\Facades\DB;

/**
 * Applies provider events idempotently and tolerates out-of-order delivery:
 *  - an event id is claimed with INSERT-IGNORE inside the transaction (replays are dropped; if processing fails the claim
 *    rolls back so the provider's retry is processed, instead of the event being lost)
 *  - a cancellation is remembered even when it arrives before the subscription exists, and a later activation honours it
 *  - a canceled/expired subscription is never reactivated by a late payment; the payment is still recorded
 *  - payments that arrive before their subscription are linked once it exists
 */
class WebhookHandler
{
    /** @return 'processed'|'duplicate'|'ignored' */
    public function handle(string $provider, BillingEvent $e): string
    {
        $user = User::find($e->userId);
        if (! $user) {
            return 'ignored';
        }

        return DB::transaction(function () use ($provider, $e, $user) {
            $claimed = DB::table('billing_events')->insertOrIgnore([
                'provider' => $provider, 'event_id' => $e->id, 'type' => $e->type, 'subject_ref' => $e->subscriptionRef, 'processed_at' => now(),
            ]);
            if ($claimed === 0) {
                return 'duplicate';
            }

            match ($e->type) {
                'checkout.completed' => $this->activate($user, $provider, $e),
                'payment.succeeded' => $this->paymentSucceeded($user, $provider, $e),
                'payment.failed' => $this->paymentFailed($user, $provider, $e),
                'subscription.canceled' => $this->canceled($user, $e),
            };

            return 'processed';
        });
    }

    private function activate(User $user, string $provider, BillingEvent $e): void
    {
        $plan = Plan::where('key', $e->planKey)->where('active', true)->first();
        if (! $plan || ! $e->subscriptionRef) {
            return;
        }
        $existing = Subscription::where('user_id', $user->id)->where('provider', $provider)->where('provider_ref', $e->subscriptionRef)->first();

        // A cancellation that was delivered first (or a terminal state) wins over a late "completed".
        if (($existing && in_array($existing->status, ['canceled', 'expired'], true)) || $this->wasCanceled($provider, $e->subscriptionRef)) {
            return;
        }

        // Switching plans: the new subscription replaces any other live one from this provider.
        Subscription::where('user_id', $user->id)->where('provider', $provider)->whereIn('status', ['active', 'trialing', 'past_due'])
            ->where('provider_ref', '!=', $e->subscriptionRef)->update(['status' => 'canceled', 'canceled_at' => now()]);

        $sub = $existing ?? new Subscription(['provider' => $provider, 'provider_ref' => $e->subscriptionRef]);
        $sub->user_id = $user->id;
        $sub->plan_id = $plan->id;
        $sub->status = 'active';
        $sub->current_period_start = $e->periodStart ?? now();
        // Access must always end: when the provider omits the period end, fall back to one plan interval.
        $sub->current_period_end = $e->periodEnd ?? ($plan->interval === 'year' ? now()->addYear() : now()->addMonth());
        $sub->cancel_at_period_end = false;
        $sub->save();

        // Payments that arrived before the subscription existed.
        Payment::where('user_id', $user->id)->where('provider', $provider)->where('subscription_ref', $e->subscriptionRef)->whereNull('subscription_id')->update(['subscription_id' => $sub->id]);

        app(Analytics::class)->system(AnalyticsEvent::SubscriptionStarted);
        $sub->items()->firstOrCreate(['kind' => 'base'], ['plan_id' => $plan->id, 'quantity' => 1, 'unit_price_minor' => $plan->price_minor]);
    }

    private function paymentSucceeded(User $user, string $provider, BillingEvent $e): void
    {
        $sub = $this->subscription($user, $provider, $e);
        $payment = Payment::firstOrNew(['provider' => $provider, 'provider_ref' => $e->paymentRef]);
        $payment->fill(['amount_minor' => (int) $e->amountMinor, 'currency' => $e->currency ?? config('billing.currency'), 'status' => 'succeeded', 'paid_at' => now(), 'subscription_ref' => $e->subscriptionRef]);
        $payment->user_id = $user->id;
        $payment->subscription_id = $sub?->id;
        $payment->save();

        // Money was received either way (an invoice is owed), but only a live subscription is extended: a late payment
        // event must not bring a canceled subscription back to life.
        if ($sub && ! in_array($sub->status, ['canceled', 'expired'], true)) {
            $sub->forceFill(['status' => 'active', 'current_period_start' => $e->periodStart ?? $sub->current_period_start, 'current_period_end' => $e->periodEnd ?? $sub->current_period_end])->save();
        }

        if (! Invoice::where('payment_id', $payment->id)->exists()) {
            $inv = new Invoice(['total_minor' => $payment->amount_minor, 'currency' => $payment->currency,
                'description' => 'EXPA '.($sub?->plan?->key ?? 'subscription'), 'issued_at' => now(), 'number' => 'pending-'.$payment->id]);
            $inv->user_id = $user->id;
            $inv->payment_id = $payment->id;
            $inv->save();
            $inv->forceFill(['number' => sprintf('%s-%s-%06d', config('billing.invoice_prefix'), now()->format('Y'), $inv->id)])->save();
        }
    }

    private function paymentFailed(User $user, string $provider, BillingEvent $e): void
    {
        $sub = $this->subscription($user, $provider, $e);
        $payment = Payment::firstOrNew(['provider' => $provider, 'provider_ref' => $e->paymentRef]);
        // never downgrade a payment that already succeeded because its "failed" event arrived late
        if ($payment->exists && $payment->status === 'succeeded') {
            return;
        }
        $payment->fill(['amount_minor' => (int) $e->amountMinor, 'currency' => $e->currency ?? config('billing.currency'), 'status' => 'failed', 'failure_code' => $e->failureCode, 'subscription_ref' => $e->subscriptionRef]);
        $payment->user_id = $user->id;
        $payment->subscription_id = $sub?->id;
        $payment->save();
        if ($sub && $sub->status === 'active') {
            $sub->forceFill(['status' => 'past_due'])->save();
        }
    }

    private function canceled(User $user, BillingEvent $e): void
    {
        // Even when no row matches yet, the claimed billing_events row (with subject_ref) remembers the cancellation.
        Subscription::where('user_id', $user->id)->where('provider_ref', $e->subscriptionRef)->update(['status' => 'canceled', 'canceled_at' => now()]);
    }

    private function wasCanceled(string $provider, ?string $ref): bool
    {
        return $ref !== null && DB::table('billing_events')->where('provider', $provider)->where('type', 'subscription.canceled')->where('subject_ref', $ref)->exists();
    }

    private function subscription(User $user, string $provider, BillingEvent $e): ?Subscription
    {
        return Subscription::where('user_id', $user->id)->where('provider', $provider)->where('provider_ref', $e->subscriptionRef)->with('plan')->first();
    }
}
