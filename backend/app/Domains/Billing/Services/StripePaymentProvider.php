<?php

namespace App\Domains\Billing\Services;

use App\Domains\Billing\Contracts\PaymentProvider;
use App\Domains\Billing\Models\Plan;
use App\Domains\Billing\Models\Subscription;
use App\Exceptions\ApiException;
use App\Models\User;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Client\PendingRequest;
use Illuminate\Http\Client\RequestException;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Http;
use InvalidArgumentException;

/**
 * Stripe over its REST API (no SDK, so every call is testable with Http::fake). Hosted Checkout only: card data never touches
 * EXPA. Credentials come from config/billing.php (env) and are never logged; error bodies from Stripe are never shown to users.
 * Enabled with BILLING_PROVIDER=stripe. Code complete and Http::fake-tested; live behaviour is UNTESTED until real
 * (test-mode) credentials exist (docs/EXTERNAL_SERVICES.md).
 */
class StripePaymentProvider implements PaymentProvider
{
    /** @param  array<string,mixed>  $config  config('billing.stripe') */
    public function __construct(private array $config) {}

    public function key(): string
    {
        return 'stripe';
    }

    public function createCheckout(User $user, Plan $plan, string $successUrl, string $cancelUrl): CheckoutSession
    {
        $priceId = $this->config['price_ids'][$plan->key] ?? null;
        $line = $priceId
            ? ['price' => $priceId, 'quantity' => 1]
            : ['quantity' => 1, 'price_data' => [
                'currency' => strtolower($plan->currency),
                'unit_amount' => $plan->price_minor,
                'recurring' => ['interval' => $plan->interval === 'year' ? 'year' : 'month'],
                'product_data' => ['name' => 'EXPA '.$plan->key],
            ]];

        $body = [
            'mode' => 'subscription',
            'line_items' => [$line],
            'success_url' => $successUrl,
            'cancel_url' => $cancelUrl,
            'client_reference_id' => (string) $user->id,
            'customer_email' => $user->email,
            'metadata' => ['user_id' => (string) $user->id, 'plan' => $plan->key],
            'subscription_data' => ['metadata' => ['user_id' => (string) $user->id, 'plan' => $plan->key]],
        ];

        // A double click within 5 minutes reuses the same session instead of creating a second one.
        $idempotency = 'checkout-'.sha1($user->id.'|'.$plan->key.'|'.intdiv(time(), 300));
        $res = $this->request()->withHeaders(['Idempotency-Key' => $idempotency])->post($this->url('/v1/checkout/sessions'), $body);
        $this->ensureOk($res);

        $url = $res->json('url');
        $id = $res->json('id');
        if (! is_string($url) || ! str_starts_with($url, 'https://') || ! is_string($id)) {
            throw $this->unavailable('Stripe returned no checkout url.');
        }

        return new CheckoutSession($url, $id);
    }

    public function cancelSubscription(Subscription $subscription, bool $atPeriodEnd = true): void
    {
        $ref = (string) $subscription->provider_ref;
        if ($ref === '' || ! preg_match('/^sub_[A-Za-z0-9]+$/', $ref)) {
            throw $this->unavailable('Subscription has no valid provider reference.');
        }
        $res = $atPeriodEnd
            ? $this->request()->post($this->url("/v1/subscriptions/$ref"), ['cancel_at_period_end' => 'true'])
            : $this->request()->delete($this->url("/v1/subscriptions/$ref"));
        // already cancelled at Stripe: the goal state is reached
        if ($res->status() === 404 || ($res->status() === 400 && str_contains((string) $res->body(), 'resource_missing'))) {
            return;
        }
        $this->ensureOk($res);
    }

    /**
     * Stripe-Signature scheme: header `t=<unix>,v1=<hmac>[,v1=<hmac>...]`, hmac = HMAC-SHA256(secret, "<t>.<raw body>").
     * Rejected when no v1 matches any configured secret (rotation) or the timestamp is outside the tolerance (replay).
     */
    public function parseWebhook(string $payload, array $headers): ?BillingEvent
    {
        $this->verifySignature($payload, (string) ($headers['stripe-signature'] ?? ''));

        $event = json_decode($payload, true);
        if (! is_array($event) || ! isset($event['id'], $event['type']) || ! is_array($event['data']['object'] ?? null)) {
            throw new InvalidArgumentException('Malformed webhook payload.');
        }
        $o = $event['data']['object'];
        $id = (string) $event['id'];

        return match ($event['type']) {
            'checkout.session.completed' => $this->checkoutCompleted($id, $o),
            'invoice.paid', 'invoice.payment_succeeded' => $this->invoicePaid($id, $o),
            'invoice.payment_failed' => $this->invoiceFailed($id, $o),
            'customer.subscription.deleted' => $this->subscriptionDeleted($id, $o),
            'charge.refunded' => $this->chargeRefunded($id, $o),
            default => null,
        };
    }

    private function verifySignature(string $payload, string $header): void
    {
        $secrets = array_values(array_filter(array_map('trim', explode(',', (string) ($this->config['webhook_secret'] ?? '')))));
        if ($secrets === [] || $header === '') {
            throw new InvalidArgumentException('Webhook signature missing.');
        }
        $timestamp = null;
        $signatures = [];
        foreach (explode(',', $header) as $part) {
            [$k, $v] = array_pad(explode('=', trim($part), 2), 2, '');
            if ($k === 't') {
                $timestamp = $v;
            } elseif ($k === 'v1' && $v !== '') {
                $signatures[] = $v;
            }
        }
        if ($timestamp === null || ! ctype_digit($timestamp) || $signatures === []) {
            throw new InvalidArgumentException('Webhook signature malformed.');
        }
        if (abs(time() - (int) $timestamp) > (int) ($this->config['tolerance'] ?? 300)) {
            throw new InvalidArgumentException('Webhook timestamp outside tolerance.');
        }
        foreach ($secrets as $secret) {
            $expected = hash_hmac('sha256', $timestamp.'.'.$payload, $secret);
            foreach ($signatures as $sig) {
                if (hash_equals($expected, $sig)) {
                    return;
                }
            }
        }
        throw new InvalidArgumentException('Webhook signature mismatch.');
    }

    private function checkoutCompleted(string $id, array $o): ?BillingEvent
    {
        $userId = $o['client_reference_id'] ?? ($o['metadata']['user_id'] ?? null);
        if (($o['mode'] ?? null) !== 'subscription' || ! ctype_digit((string) $userId) || ! is_string($o['subscription'] ?? null)) {
            return null;
        }

        return new BillingEvent($id, 'checkout.completed', (int) $userId, $o['metadata']['plan'] ?? null, $o['subscription']);
    }

    private function invoicePaid(string $id, array $o): ?BillingEvent
    {
        [$userId, $subRef] = $this->invoiceSubject($o);
        $amount = (int) ($o['amount_paid'] ?? 0);
        if ($userId === null || $amount <= 0 || ! is_string($o['id'] ?? null)) {
            return null; // zero-amount (trial) invoices owe no payment record
        }
        $line = $o['lines']['data'][0]['period'] ?? [];

        return new BillingEvent($id, 'payment.succeeded', $userId, null, $subRef, $o['id'], $amount, strtoupper((string) ($o['currency'] ?? 'eur')),
            isset($line['start']) ? Carbon::createFromTimestamp((int) $line['start']) : null, isset($line['end']) ? Carbon::createFromTimestamp((int) $line['end']) : null);
    }

    private function invoiceFailed(string $id, array $o): ?BillingEvent
    {
        [$userId, $subRef] = $this->invoiceSubject($o);
        if ($userId === null || ! is_string($o['id'] ?? null)) {
            return null;
        }

        return new BillingEvent($id, 'payment.failed', $userId, null, $subRef, $o['id'], (int) ($o['amount_due'] ?? 0), strtoupper((string) ($o['currency'] ?? 'eur')), failureCode: 'payment_failed');
    }

    private function subscriptionDeleted(string $id, array $o): ?BillingEvent
    {
        $userId = $o['metadata']['user_id'] ?? null;
        if (! ctype_digit((string) $userId) || ! is_string($o['id'] ?? null)) {
            return null;
        }

        return new BillingEvent($id, 'subscription.canceled', (int) $userId, null, $o['id']);
    }

    private function chargeRefunded(string $id, array $o): ?BillingEvent
    {
        // Matched to our payment through the invoice id; the handler resolves the user from that payment.
        if (! is_string($o['invoice'] ?? null) || ! ($o['refunded'] ?? false)) {
            return null; // partial refunds / charges without an invoice are not modelled
        }

        return new BillingEvent($id, 'payment.refunded', 0, null, null, $o['invoice'], (int) ($o['amount_refunded'] ?? 0));
    }

    /** @return array{0:?int,1:?string} user id and subscription id of an invoice, across Stripe API versions */
    private function invoiceSubject(array $o): array
    {
        $details = $o['parent']['subscription_details'] ?? $o['subscription_details'] ?? [];
        $userId = $details['metadata']['user_id'] ?? $o['metadata']['user_id'] ?? $o['lines']['data'][0]['metadata']['user_id'] ?? null;
        $subRef = $details['subscription'] ?? (is_string($o['subscription'] ?? null) ? $o['subscription'] : null);

        return [ctype_digit((string) $userId) ? (int) $userId : null, is_string($subRef) ? $subRef : null];
    }

    private function request(): PendingRequest
    {
        $key = (string) ($this->config['secret_key'] ?? '');
        if ($key === '') {
            throw $this->unavailable('STRIPE_SECRET_KEY is not configured.');
        }
        $req = Http::withToken($key)->asForm()->acceptJson()->timeout((int) ($this->config['timeout'] ?? 15))
            ->retry(3, 300, fn ($e) => $e instanceof ConnectionException || ($e instanceof RequestException && $e->response->serverError()), throw: false);
        if (! empty($this->config['api_version'])) {
            $req = $req->withHeaders(['Stripe-Version' => $this->config['api_version']]);
        }

        return $req;
    }

    private function url(string $path): string
    {
        return rtrim((string) ($this->config['api_base'] ?? 'https://api.stripe.com'), '/').$path;
    }

    private function ensureOk($response): void
    {
        if (! $response->successful()) {
            // Never surface or log Stripe's body: it can echo request fields (email).
            throw $this->unavailable('Stripe responded with HTTP '.$response->status().'.');
        }
    }

    private function unavailable(string $internal): ApiException
    {
        report(new \RuntimeException($internal));

        return new ApiException('billing_unavailable', __('errors.billing_unavailable'), 503);
    }
}
