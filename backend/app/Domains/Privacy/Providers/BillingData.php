<?php

namespace App\Domains\Privacy\Providers;

use App\Domains\Billing\Models\Invoice;
use App\Domains\Billing\Models\Payment;
use App\Domains\Billing\Models\PaymentMethod;
use App\Domains\Billing\Models\Subscription;
use App\Domains\Privacy\Contracts\PersonalDataProvider;
use App\Models\User;

class BillingData implements PersonalDataProvider
{
    public function key(): string
    {
        return 'billing';
    }

    public function export(User $user): array
    {
        return [
            'subscriptions' => Subscription::where('user_id', $user->id)->with('plan')->orderBy('id')->get()->map(fn ($s) => [
                'plan' => $s->plan->key, 'status' => $s->status, 'provider' => $s->provider,
                'period_end' => $s->current_period_end?->toIso8601String(), 'canceled_at' => $s->canceled_at?->toIso8601String(),
            ])->all(),
            'payments' => Payment::where('user_id', $user->id)->orderBy('id')->get(['amount_minor', 'currency', 'status', 'paid_at'])->map(fn ($p) => $p->toArray())->all(),
            'invoices' => Invoice::where('user_id', $user->id)->orderBy('id')->get(['number', 'total_minor', 'currency', 'issued_at'])->map(fn ($i) => $i->toArray())->all(),
            'payment_methods' => PaymentMethod::where('user_id', $user->id)->get(['brand', 'last4', 'exp_month', 'exp_year'])->map(fn ($m) => $m->toArray())->all(),
        ];
    }

    /**
     * Payment methods are deleted and live subscriptions are ended. Payments and invoices are KEPT: tax/accounting
     * law requires retaining them (GDPR Art. 17(3)(b)); after erasure they reference only the anonymized account stub.
     */
    public function erase(User $user): void
    {
        PaymentMethod::where('user_id', $user->id)->delete();
        Subscription::where('user_id', $user->id)->whereIn('status', ['active', 'trialing', 'past_due'])
            ->update(['status' => 'canceled', 'canceled_at' => now()]);
    }
}
