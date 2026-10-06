<?php

namespace App\Domains\Billing\Services;

use App\Domains\Billing\Contracts\PaymentProvider;
use App\Domains\Billing\Models\Plan;
use App\Domains\Billing\Models\Subscription;
use App\Models\User;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;
use InvalidArgumentException;

/** Deterministic provider for local development and tests (BILLING_PROVIDER=fake). Never use in production. */
class FakePaymentProvider implements PaymentProvider
{
    /** @var list<string> */
    public array $canceled = [];

    public function key(): string
    {
        return 'fake';
    }

    public function createCheckout(User $user, Plan $plan, string $successUrl, string $cancelUrl): CheckoutSession
    {
        $ref = 'fake_cs_'.Str::lower(Str::random(12));

        return new CheckoutSession("https://pay.fake.test/checkout/$ref", $ref);
    }

    public function cancelSubscription(Subscription $subscription, bool $atPeriodEnd = true): void
    {
        $this->canceled[] = (string) $subscription->provider_ref;
    }

    public static function sign(string $payload): string
    {
        return hash_hmac('sha256', $payload, config('billing.fake_webhook_secret'));
    }

    public function parseWebhook(string $payload, array $headers): ?BillingEvent
    {
        $sig = $headers['x-fake-signature'] ?? '';
        if (! hash_equals(self::sign($payload), $sig)) {
            throw new InvalidArgumentException('Invalid webhook signature.');
        }
        $d = json_decode($payload, true);
        if (! is_array($d) || ! isset($d['id'], $d['type'], $d['user_id'])) {
            throw new InvalidArgumentException('Malformed webhook payload.');
        }
        if (! in_array($d['type'], ['checkout.completed', 'payment.succeeded', 'payment.failed', 'payment.refunded', 'subscription.canceled'], true)) {
            return null;
        }

        return new BillingEvent(
            $d['id'], $d['type'], (int) $d['user_id'], $d['plan'] ?? null, $d['subscription_ref'] ?? null, $d['payment_ref'] ?? null,
            isset($d['amount_minor']) ? (int) $d['amount_minor'] : null, $d['currency'] ?? null,
            isset($d['period_start']) ? Carbon::parse($d['period_start']) : null, isset($d['period_end']) ? Carbon::parse($d['period_end']) : null,
            $d['failure_code'] ?? null,
        );
    }
}
