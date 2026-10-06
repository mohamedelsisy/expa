<?php

namespace App\Domains\Billing\Contracts;

use App\Domains\Billing\Models\Plan;
use App\Domains\Billing\Models\Subscription;
use App\Domains\Billing\Services\BillingEvent;
use App\Domains\Billing\Services\CheckoutSession;
use App\Models\User;

/** Implement for each payment processor. EXPA never handles card data: the provider hosts the payment page. */
interface PaymentProvider
{
    public function key(): string;

    public function createCheckout(User $user, Plan $plan, string $successUrl, string $cancelUrl): CheckoutSession;

    /**
     * Stop billing at the provider. `$atPeriodEnd = true` keeps access until the paid period ends (user cancel);
     * `false` terminates immediately (admin cancel / refund). MUST throw when the provider call fails, never swallow it.
     */
    public function cancelSubscription(Subscription $subscription, bool $atPeriodEnd = true): void;

    /**
     * Verify the signature and translate the payload. MUST throw InvalidArgumentException when the signature
     * is wrong; return null for event types EXPA does not care about.
     *
     * @param  array<string,string>  $headers  lower-cased header map
     */
    public function parseWebhook(string $payload, array $headers): ?BillingEvent;
}
