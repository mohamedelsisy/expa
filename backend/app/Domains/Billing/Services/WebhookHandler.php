<?php

namespace App\Domains\Billing\Services;

use App\Domains\Analytics\Analytics;
use App\Domains\Analytics\AnalyticsEvent;
use App\Domains\Billing\Models\BillingEvent as BillingEventRow;
use App\Domains\Billing\Models\Invoice;
use App\Domains\Billing\Models\Payment;
use App\Domains\Billing\Models\Plan;
use App\Domains\Billing\Models\Subscription;
use App\Models\User;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Support\Facades\DB;

class WebhookHandler
{
    /** @return 'processed'|'duplicate'|'ignored' */
    public function handle(string $provider, BillingEvent $e): string
    {
        $user = User::find($e->userId);
        if (! $user) {
            return 'ignored';
        }

        try {
            return DB::transaction(function () use ($provider, $e, $user) {
                // Claim the event first: a replay of the same event id hits the unique key and is dropped.
                BillingEventRow::create(['provider' => $provider, 'event_id' => $e->id, 'type' => $e->type, 'processed_at' => now()]);

                match ($e->type) {
                    'checkout.completed' => $this->activate($user, $provider, $e),
                    'payment.succeeded' => $this->paymentSucceeded($user, $provider, $e),
                    'payment.failed' => $this->paymentFailed($user, $provider, $e),
                    'subscription.canceled' => $this->canceled($user, $e),
                };

                return 'processed';
            });
        } catch (UniqueConstraintViolationException) {
            return 'duplicate';
        }
    }

    private function activate(User $user, string $provider, BillingEvent $e): void
    {
        $plan = Plan::where('key', $e->planKey)->where('active', true)->first();
        if (! $plan) {
            return;
        }
        // Switching plans: the new subscription replaces any other live one from this provider.
        Subscription::where('user_id', $user->id)->where('provider', $provider)->whereIn('status', ['active', 'trialing', 'past_due'])
            ->where('provider_ref', '!=', $e->subscriptionRef)->update(['status' => 'canceled', 'canceled_at' => now()]);

        $sub = Subscription::firstOrNew(['user_id' => $user->id, 'provider' => $provider, 'provider_ref' => $e->subscriptionRef]);
        $sub->user_id = $user->id;
        $sub->plan_id = $plan->id;
        $sub->status = 'active';
        $sub->current_period_start = $e->periodStart ?? now();
        $sub->current_period_end = $e->periodEnd;
        $sub->cancel_at_period_end = false;
        $sub->save();
        app(Analytics::class)->system(AnalyticsEvent::SubscriptionStarted);
        $sub->items()->firstOrCreate(['kind' => 'base'], ['plan_id' => $plan->id, 'quantity' => 1, 'unit_price_minor' => $plan->price_minor]);
    }

    private function paymentSucceeded(User $user, string $provider, BillingEvent $e): void
    {
        $sub = $this->subscription($user, $provider, $e);
        $payment = Payment::firstOrNew(['provider' => $provider, 'provider_ref' => $e->paymentRef]);
        $payment->fill(['amount_minor' => (int) $e->amountMinor, 'currency' => $e->currency ?? config('billing.currency'), 'status' => 'succeeded', 'paid_at' => now()]);
        $payment->user_id = $user->id;
        $payment->subscription_id = $sub?->id;
        $payment->save();

        if ($sub) {
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
        $payment->fill(['amount_minor' => (int) $e->amountMinor, 'currency' => $e->currency ?? config('billing.currency'), 'status' => 'failed', 'failure_code' => $e->failureCode]);
        $payment->user_id = $user->id;
        $payment->subscription_id = $sub?->id;
        $payment->save();
        $sub?->forceFill(['status' => 'past_due'])->save();
    }

    private function canceled(User $user, BillingEvent $e): void
    {
        Subscription::where('user_id', $user->id)->where('provider_ref', $e->subscriptionRef)
            ->update(['status' => 'canceled', 'canceled_at' => now()]);
    }

    private function subscription(User $user, string $provider, BillingEvent $e): ?Subscription
    {
        return Subscription::where('user_id', $user->id)->where('provider', $provider)->where('provider_ref', $e->subscriptionRef)->with('plan')->first();
    }
}
