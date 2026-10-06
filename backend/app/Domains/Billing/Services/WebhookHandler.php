<?php

namespace App\Domains\Billing\Services;

use App\Domains\Analytics\Analytics;
use App\Domains\Analytics\AnalyticsEvent;
use App\Domains\Billing\Models\Invoice;
use App\Domains\Billing\Models\Payment;
use App\Domains\Billing\Models\Plan;
use App\Domains\Billing\Models\Subscription;
use App\Models\User;
use Illuminate\Support\Carbon;
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
    public function __construct(private DunningService $dunning, private InvoiceNumberer $numbers, private TaxCalculator $tax) {}

    /** @return 'processed'|'duplicate'|'ignored' */
    public function handle(string $provider, BillingEvent $e): string
    {
        // A payment event without the provider's payment id cannot be matched to a row safely (BE-6): firstOrNew on a
        // NULL reference would adopt ANOTHER user's null-reference payment. Ignore it instead of guessing.
        if (str_starts_with($e->type, 'payment.') && blank($e->paymentRef)) {
            return 'ignored';
        }
        // A refund is attributed through the payment it refers to, not through a user id the provider may not send.
        $user = $e->type === 'payment.refunded'
            ? User::find(Payment::where('provider', $provider)->where('provider_ref', $e->paymentRef)->value('user_id'))
            : User::find($e->userId);
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
                'payment.refunded' => $this->paymentRefunded($provider, $e),
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
        $sub->current_period_start = $this->local($e->periodStart) ?? now();
        // Access must always end: when the provider omits the period end, fall back to one plan interval.
        $sub->current_period_end = $this->local($e->periodEnd) ?? ($plan->interval === 'year' ? now()->addYear() : now()->addMonth());
        $sub->cancel_at_period_end = false;
        $sub->save();
        $this->dunning->recover($sub);

        // Payments that arrived before the subscription existed.
        Payment::where('user_id', $user->id)->where('provider', $provider)->where('subscription_ref', $e->subscriptionRef)->whereNull('subscription_id')->update(['subscription_id' => $sub->id]);

        app(Analytics::class)->system(AnalyticsEvent::SubscriptionStarted);
        $sub->items()->firstOrCreate(['slot' => 'base'], ['kind' => 'base', 'plan_id' => $plan->id, 'quantity' => 1, 'unit_price_minor' => $plan->price_minor]);
    }

    private function paymentSucceeded(User $user, string $provider, BillingEvent $e): void
    {
        $sub = $this->subscription($user, $provider, $e);
        $payment = Payment::firstOrNew(['provider' => $provider, 'provider_ref' => $e->paymentRef]);
        // Never adopt a row that belongs to somebody else, and never move a refunded payment back to "succeeded".
        if ($payment->exists && ($payment->user_id !== $user->id || ! PaymentState::can($payment->status, PaymentState::SUCCEEDED))) {
            return;
        }
        $payment->fill(['amount_minor' => (int) $e->amountMinor, 'currency' => $e->currency ?? config('billing.currency'), 'status' => PaymentState::SUCCEEDED, 'paid_at' => now(), 'subscription_ref' => $e->subscriptionRef, 'failure_code' => null]);
        $payment->user_id = $user->id;
        $payment->subscription_id = $sub?->id;
        $payment->save();

        // Money was received either way (an invoice is owed), but only a live subscription is extended: a late payment
        // event must not bring a canceled subscription back to life.
        if ($sub && ! SubscriptionState::isTerminal($sub->status)) {
            $sub->forceFill(['status' => SubscriptionState::ACTIVE, 'current_period_start' => $this->local($e->periodStart) ?? $sub->current_period_start, 'current_period_end' => $this->local($e->periodEnd) ?? $sub->current_period_end])->save();
            $this->dunning->recover($sub);
        }

        if (! Invoice::where('payment_id', $payment->id)->exists()) {
            $tax = $this->tax->breakdown($sub?->plan, $payment->amount_minor);
            $inv = new Invoice(['total_minor' => $payment->amount_minor, 'currency' => $payment->currency,
                'description' => 'EXPA '.($sub?->plan?->key ?? 'subscription'), 'issued_at' => now(), 'number' => $this->numbers->next(),
                'net_minor' => $tax['net_minor'] ?? null, 'tax_minor' => $tax['tax_minor'] ?? null, 'tax_rate' => $tax['rate'] ?? null, 'tax_country' => $tax['country'] ?? null]);
            $inv->user_id = $user->id;
            $inv->payment_id = $payment->id;
            $inv->save();
        }
    }

    private function paymentFailed(User $user, string $provider, BillingEvent $e): void
    {
        $sub = $this->subscription($user, $provider, $e);
        $payment = Payment::firstOrNew(['provider' => $provider, 'provider_ref' => $e->paymentRef]);
        // never downgrade a payment that already succeeded/refunded because its "failed" event arrived late, never adopt another user's row
        if ($payment->exists && ($payment->user_id !== $user->id || ! PaymentState::can($payment->status, PaymentState::FAILED))) {
            return;
        }
        $payment->fill(['amount_minor' => (int) $e->amountMinor, 'currency' => $e->currency ?? config('billing.currency'), 'status' => PaymentState::FAILED, 'failure_code' => $e->failureCode, 'subscription_ref' => $e->subscriptionRef]);
        $payment->user_id = $user->id;
        $payment->subscription_id = $sub?->id;
        $payment->save();
        if ($sub && in_array($sub->status, [SubscriptionState::ACTIVE, SubscriptionState::TRIALING], true)) {
            $this->dunning->enterGrace($sub);
        }
    }

    private function paymentRefunded(string $provider, BillingEvent $e): void
    {
        $payment = Payment::where('provider', $provider)->where('provider_ref', $e->paymentRef)->first();
        if ($payment && PaymentState::can($payment->status, PaymentState::REFUNDED)) {
            $payment->forceFill(['status' => PaymentState::REFUNDED, 'refunded_at' => now()])->save();
        }
    }

    private function canceled(User $user, BillingEvent $e): void
    {
        // Even when no row matches yet, the claimed billing_events row (with subject_ref) remembers the cancellation.
        Subscription::where('user_id', $user->id)->where('provider_ref', $e->subscriptionRef)->update(['status' => 'canceled', 'canceled_at' => now()]);
    }

    /** Provider timestamps arrive in UTC/offset form; the DB stores the app-timezone clock, so normalise before saving. */
    private function local(?\DateTimeInterface $d): ?Carbon
    {
        return $d ? Carbon::instance($d)->setTimezone(config('app.timezone')) : null;
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
