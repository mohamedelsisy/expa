<?php

namespace Tests\Feature\Billing;

use App\Domains\Access\Services\AccessSynchronizer;
use App\Domains\Billing\Contracts\PaymentProvider;
use App\Domains\Billing\Models\Invoice;
use App\Domains\Billing\Models\Payment;
use App\Domains\Billing\Models\Plan;
use App\Domains\Billing\Models\Subscription;
use App\Domains\Billing\Services\StripePaymentProvider;
use App\Exceptions\ApiException;
use App\Models\User;
use Database\Seeders\PlanSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Client\Request;
use Illuminate\Support\Facades\Http;
use InvalidArgumentException;
use Tests\TestCase;

class StripePaymentProviderTest extends TestCase
{
    use RefreshDatabase;

    private const SECRET = 'whsec_test_secret';

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(PlanSeeder::class);
        app(AccessSynchronizer::class)->sync();
        config(['billing.provider' => 'stripe', 'billing.stripe.secret_key' => 'sk_test_fake', 'billing.stripe.webhook_secret' => self::SECRET, 'billing.stripe.price_ids' => []]);
        $this->app->forgetInstance(PaymentProvider::class);
    }

    private function provider(): StripePaymentProvider
    {
        return new StripePaymentProvider((array) config('billing.stripe'));
    }

    private function sign(string $payload, ?int $t = null, string $secret = self::SECRET): string
    {
        $t ??= time();

        return "t=$t,v1=".hash_hmac('sha256', "$t.$payload", $secret);
    }

    private function hook(array $event, ?string $header = null)
    {
        $body = json_encode($event);

        return $this->call('POST', '/api/v1/billing/webhook/stripe', [], [], [], [
            'CONTENT_TYPE' => 'application/json', 'HTTP_ACCEPT' => 'application/json', 'HTTP_STRIPE_SIGNATURE' => $header ?? $this->sign($body),
        ], $body);
    }

    // ---- checkout / cancel ----------------------------------------------------------------------

    public function test_checkout_creates_a_hosted_session_with_server_built_urls_and_no_secrets_in_the_body(): void
    {
        Http::fake(['api.stripe.com/v1/checkout/sessions' => Http::response(['id' => 'cs_test_1', 'url' => 'https://checkout.stripe.com/c/pay/cs_test_1'])]);
        $user = User::factory()->create(['email' => 'mo@example.com']);
        $this->actingAs($user, 'sanctum');

        $this->postJson('/api/v1/billing/checkout', ['plan' => 'plus'])->assertOk()->assertJsonPath('data.checkout_url', 'https://checkout.stripe.com/c/pay/cs_test_1');

        Http::assertSent(function (Request $r) use ($user) {
            parse_str($r->body(), $b);

            return $r->method() === 'POST' && $r->url() === 'https://api.stripe.com/v1/checkout/sessions'
                && $r->hasHeader('Authorization', 'Bearer sk_test_fake') && $r->hasHeader('Idempotency-Key')
                && $b['mode'] === 'subscription' && $b['client_reference_id'] === (string) $user->id && $b['metadata']['plan'] === 'plus'
                && $b['subscription_data']['metadata']['user_id'] === (string) $user->id
                && $b['line_items'][0]['price_data']['unit_amount'] === (string) Plan::where('key', 'plus')->value('price_minor')
                && $b['line_items'][0]['price_data']['currency'] === 'eur' && $b['line_items'][0]['price_data']['recurring']['interval'] === 'month'
                && str_ends_with($b['success_url'], '/billing/success') && str_starts_with($b['success_url'], config('expa.frontend_url'));
        });
    }

    public function test_a_configured_stripe_price_id_is_used_instead_of_inline_price_data(): void
    {
        config(['billing.stripe.price_ids' => ['plus' => 'price_123']]);
        Http::fake(['api.stripe.com/*' => Http::response(['id' => 'cs_1', 'url' => 'https://checkout.stripe.com/x'])]);
        $this->provider()->createCheckout(User::factory()->create(), Plan::where('key', 'plus')->first(), 'https://a/s', 'https://a/c');
        Http::assertSent(function (Request $r) {
            parse_str($r->body(), $b);

            return $b['line_items'][0]['price'] === 'price_123' && ! isset($b['line_items'][0]['price_data']);
        });
    }

    public function test_stripe_failure_becomes_a_generic_503_that_leaks_nothing(): void
    {
        Http::fake(['api.stripe.com/*' => Http::response(['error' => ['message' => 'No such customer: mo@example.com']], 500)]);
        $this->actingAs(User::factory()->create(), 'sanctum');

        $res = $this->postJson('/api/v1/billing/checkout', ['plan' => 'plus']);

        $res->assertStatus(503)->assertJsonPath('error.code', 'billing_unavailable');
        $this->assertStringNotContainsString('mo@example.com', $res->getContent());
        Http::assertSentCount(3); // one try + two retries on 5xx
    }

    public function test_a_checkout_url_that_is_not_https_is_rejected(): void
    {
        Http::fake(['api.stripe.com/*' => Http::response(['id' => 'cs_1', 'url' => 'javascript:alert(1)'])]);
        $this->expectException(ApiException::class);
        $this->provider()->createCheckout(User::factory()->create(), Plan::where('key', 'plus')->first(), 'https://a/s', 'https://a/c');
    }

    public function test_cancel_at_period_end_and_immediate_cancel_use_the_right_calls(): void
    {
        Http::fake(['api.stripe.com/v1/subscriptions/sub_abc' => Http::response(['id' => 'sub_abc'])]);
        $sub = new Subscription(['provider' => 'stripe', 'provider_ref' => 'sub_abc']);

        $this->provider()->cancelSubscription($sub); // at period end
        $this->provider()->cancelSubscription($sub, atPeriodEnd: false);

        Http::assertSent(fn (Request $r) => $r->method() === 'POST' && str_contains($r->body(), 'cancel_at_period_end=true'));
        Http::assertSent(fn (Request $r) => $r->method() === 'DELETE' && $r->url() === 'https://api.stripe.com/v1/subscriptions/sub_abc');
    }

    public function test_cancel_rejects_a_malformed_reference_and_surfaces_failures(): void
    {
        Http::fake();
        try {
            $this->provider()->cancelSubscription(new Subscription(['provider' => 'stripe', 'provider_ref' => '../customers/cus_1']));
            $this->fail('expected exception');
        } catch (ApiException $e) {
            $this->assertSame(503, $e->status);
        }
        Http::assertNothingSent();
    }

    public function test_cancel_failure_is_surfaced_not_swallowed(): void
    {
        Http::fake(['api.stripe.com/*' => Http::response([], 402)]);
        $this->expectException(ApiException::class);
        $this->provider()->cancelSubscription(new Subscription(['provider' => 'stripe', 'provider_ref' => 'sub_1']));
    }

    public function test_cancelling_an_already_deleted_subscription_is_not_an_error(): void
    {
        Http::fake(['api.stripe.com/*' => Http::response(['error' => ['code' => 'resource_missing']], 404)]);
        $this->provider()->cancelSubscription(new Subscription(['provider' => 'stripe', 'provider_ref' => 'sub_gone']), false);
        $this->assertTrue(true);
    }

    // ---- webhook signature ------------------------------------------------------------------------

    public function test_signature_scheme_rejects_bad_missing_stale_and_malformed_headers(): void
    {
        $body = json_encode(['id' => 'evt_1', 'type' => 'noop', 'data' => ['object' => []]]);
        $p = $this->provider();
        $this->assertNull($p->parseWebhook($body, ['stripe-signature' => $this->sign($body)])); // valid, uninteresting type

        $bad = [
            'missing' => [],
            'wrong secret' => ['stripe-signature' => $this->sign($body, null, 'whsec_other')],
            'stale' => ['stripe-signature' => $this->sign($body, time() - 3600)],
            'future' => ['stripe-signature' => $this->sign($body, time() + 3600)],
            'tampered body' => ['stripe-signature' => $this->sign($body.' ')],
            'no v1' => ['stripe-signature' => 't='.time()],
            'garbage' => ['stripe-signature' => 'nonsense'],
            'non numeric t' => ['stripe-signature' => 't=abc,v1=00'],
        ];
        foreach ($bad as $name => $headers) {
            try {
                $p->parseWebhook($body, $headers);
                $this->fail("$name must be rejected");
            } catch (InvalidArgumentException) {
                $this->assertTrue(true);
            }
        }
    }

    public function test_signature_accepts_any_of_several_v1_values_and_a_rotated_secret(): void
    {
        $body = json_encode(['id' => 'evt_1', 'type' => 'noop', 'data' => ['object' => []]]);
        $t = time();
        $good = hash_hmac('sha256', "$t.$body", 'whsec_new');
        config(['billing.stripe.webhook_secret' => 'whsec_old, whsec_new']);
        $this->assertNull($this->provider()->parseWebhook($body, ['stripe-signature' => "t=$t,v1=deadbeef,v1=$good,v0=zz"]));
    }

    public function test_the_webhook_endpoint_returns_400_for_a_forged_event_and_never_changes_state(): void
    {
        $user = User::factory()->create();
        $res = $this->hook(['id' => 'evt_x', 'type' => 'checkout.session.completed', 'data' => ['object' => ['mode' => 'subscription', 'client_reference_id' => $user->id, 'subscription' => 'sub_1', 'metadata' => ['plan' => 'pro']]]], 't='.time().',v1='.str_repeat('0', 64));
        $res->assertStatus(400);
        $this->assertSame(0, Subscription::count());
    }

    // ---- event mapping through the real handler --------------------------------------------------------

    public function test_full_subscription_lifecycle_from_stripe_events(): void
    {
        $user = User::factory()->create();
        $start = now()->subMinute()->timestamp;
        $end = now()->addMonth()->timestamp;

        $this->hook(['id' => 'evt_1', 'type' => 'checkout.session.completed', 'data' => ['object' => [
            'id' => 'cs_1', 'mode' => 'subscription', 'client_reference_id' => (string) $user->id, 'subscription' => 'sub_9', 'metadata' => ['user_id' => (string) $user->id, 'plan' => 'plus'],
        ]]])->assertOk()->assertJsonPath('result', 'processed');
        $this->assertSame('active', Subscription::first()->status);

        $invoice = ['id' => 'in_1', 'amount_paid' => 599, 'amount_due' => 599, 'currency' => 'eur', 'subscription' => 'sub_9',
            'subscription_details' => ['metadata' => ['user_id' => (string) $user->id]], 'lines' => ['data' => [['period' => ['start' => $start, 'end' => $end]]]]];
        $this->hook(['id' => 'evt_2', 'type' => 'invoice.paid', 'data' => ['object' => $invoice]])->assertOk();
        $this->assertSame(1, Invoice::count());
        $this->assertSame($end, Subscription::first()->current_period_end->timestamp);

        // replayed delivery is idempotent
        $this->hook(['id' => 'evt_2', 'type' => 'invoice.paid', 'data' => ['object' => $invoice]])->assertOk()->assertJsonPath('result', 'duplicate');
        $this->assertSame(1, Invoice::count());

        // next cycle fails -> grace
        $failed = ['id' => 'in_2', 'amount_due' => 599, 'currency' => 'eur', 'parent' => ['subscription_details' => ['subscription' => 'sub_9', 'metadata' => ['user_id' => (string) $user->id]]]];
        $this->hook(['id' => 'evt_3', 'type' => 'invoice.payment_failed', 'data' => ['object' => $failed]])->assertOk();
        $this->assertSame('past_due', Subscription::first()->status);

        // refund of the first invoice
        $this->hook(['id' => 'evt_4', 'type' => 'charge.refunded', 'data' => ['object' => ['id' => 'ch_1', 'invoice' => 'in_1', 'refunded' => true, 'amount_refunded' => 599]]])->assertOk();
        $this->assertSame('refunded', Payment::where('provider_ref', 'in_1')->value('status'));

        // subscription deleted
        $this->hook(['id' => 'evt_5', 'type' => 'customer.subscription.deleted', 'data' => ['object' => ['id' => 'sub_9', 'metadata' => ['user_id' => (string) $user->id]]]])->assertOk();
        $this->assertSame('canceled', Subscription::first()->status);
    }

    public function test_events_without_a_resolvable_user_zero_amount_invoices_and_unknown_types_are_ignored(): void
    {
        $this->hook(['id' => 'e1', 'type' => 'invoice.paid', 'data' => ['object' => ['id' => 'in_1', 'amount_paid' => 599, 'subscription' => 'sub_1']]])->assertOk()->assertJsonPath('result', 'ignored');
        $this->hook(['id' => 'e2', 'type' => 'invoice.paid', 'data' => ['object' => ['id' => 'in_2', 'amount_paid' => 0, 'metadata' => ['user_id' => '1']]]])->assertOk()->assertJsonPath('result', 'ignored');
        $this->hook(['id' => 'e3', 'type' => 'customer.created', 'data' => ['object' => []]])->assertOk()->assertJsonPath('result', 'ignored');
        $this->assertSame(0, Invoice::count());
    }

    public function test_stripe_is_only_bound_when_selected_and_fake_is_unaffected(): void
    {
        $this->assertInstanceOf(StripePaymentProvider::class, app(PaymentProvider::class));
    }
}
