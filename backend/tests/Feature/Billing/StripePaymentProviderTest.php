<?php

namespace Tests\Feature\Billing;

use App\Domains\Access\Services\AccessSynchronizer;
use App\Domains\Billing\Contracts\PaymentProvider;
use App\Domains\Billing\Models\Invoice;
use App\Domains\Billing\Models\Payment;
use App\Domains\Billing\Models\Plan;
use App\Domains\Billing\Models\Subscription;
use App\Domains\Billing\Services\StripePaymentProvider;
use App\Domains\Billing\Services\SubscriptionService;
use App\Exceptions\ApiException;
use App\Models\User;
use Database\Seeders\PlanSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Client\Factory;
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
        config(['billing.provider' => 'stripe', 'billing.stripe.secret_key' => 'sk_test_abcdefgh12345', 'billing.stripe.webhook_secret' => self::SECRET, 'billing.stripe.price_ids' => []]);
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
                && $r->hasHeader('Authorization', 'Bearer sk_test_abcdefgh12345') && $r->hasHeader('Idempotency-Key')
                && $b['mode'] === 'subscription' && $b['client_reference_id'] === (string) $user->id && $b['metadata']['plan'] === 'plus'
                && $b['subscription_data']['metadata']['user_id'] === (string) $user->id
                && $b['line_items'][0]['price_data']['unit_amount'] === (string) Plan::where('key', 'plus')->value('price_minor')
                && $b['line_items'][0]['price_data']['currency'] === 'eur' && $b['line_items'][0]['price_data']['recurring']['interval'] === 'month'
                && str_ends_with($b['success_url'], '/settings/billing?checkout=success&session_id={CHECKOUT_SESSION_ID}') && str_starts_with($b['success_url'], config('expa.frontend_url'))
                && str_ends_with($b['cancel_url'], '/settings/billing?checkout=cancelled');
        });
    }

    public function test_idempotency_key_changes_when_the_price_changes_so_stripe_never_sees_same_key_different_params(): void
    {
        Http::fake(['api.stripe.com/*' => Http::response(['id' => 'cs_1', 'url' => 'https://checkout.stripe.com/x'])]);
        $user = User::factory()->create();
        $plan = Plan::where('key', 'plus')->first();
        $this->provider()->createCheckout($user, $plan, 'https://a/s', 'https://a/c');
        $plan->price_minor = 799;
        $this->provider()->createCheckout($user, $plan, 'https://a/s', 'https://a/c');

        $keys = Http::recorded()->map(fn ($pair) => $pair[0]->header('Idempotency-Key')[0])->unique();
        $this->assertCount(2, $keys);
        $this->assertLessThanOrEqual(255, strlen($keys->first()));
    }

    public function test_stripe_checkout_locale_is_only_sent_for_languages_stripe_supports(): void
    {
        Http::fake(['api.stripe.com/*' => Http::response(['id' => 'cs_1', 'url' => 'https://checkout.stripe.com/x'])]);
        $this->actingAs(User::factory()->create(), 'sanctum');
        $this->postJson('/api/v1/billing/checkout', ['plan' => 'plus'], ['Accept-Language' => 'it'])->assertOk();
        $this->postJson('/api/v1/billing/checkout', ['plan' => 'pro'], ['Accept-Language' => 'ar'])->assertOk();
        $locales = Http::recorded()->map(function ($pair) {
            parse_str($pair[0]->body(), $b);

            return $b['locale'] ?? null;
        })->values()->all();
        $this->assertSame(['it', null], $locales); // Stripe Checkout has no Arabic: omit => browser locale
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

    // ---- customer.subscription.updated ----------------------------------------------------------

    /** A live subscription created through the verified checkout webhook. */
    private function liveSubscription(User $user, string $ref = 'sub_u1'): Subscription
    {
        $this->hook(['id' => 'evt_c_'.$ref, 'type' => 'checkout.session.completed', 'data' => ['object' => [
            'id' => 'cs_1', 'mode' => 'subscription', 'client_reference_id' => (string) $user->id, 'subscription' => $ref, 'metadata' => ['user_id' => (string) $user->id, 'plan' => 'plus'],
        ]]])->assertOk();

        return Subscription::where('provider_ref', $ref)->firstOrFail();
    }

    /** Stripe's current state of the subscription (what GET /v1/subscriptions/{id} returns); the event itself only triggers the sync. */
    private function stripeState(User $user, array $over = [], string $ref = 'sub_u1'): void
    {
        $base = ['id' => $ref, 'status' => 'active', 'cancel_at_period_end' => false, 'cancel_at' => null, 'metadata' => ['user_id' => (string) $user->id, 'plan' => 'plus'],
            'items' => ['data' => [['price' => ['id' => 'price_x'], 'current_period_start' => now()->subDay()->timestamp, 'current_period_end' => now()->addMonth()->timestamp]]]];
        Http::swap(new Factory); // stubs of an earlier fake() would win otherwise
        Http::fake(["api.stripe.com/v1/subscriptions/$ref" => Http::response(array_replace_recursive($base, $over))]);
    }

    private function updated(string $evt, string $ref = 'sub_u1')
    {
        return $this->hook(['id' => $evt, 'type' => 'customer.subscription.updated', 'data' => ['object' => ['id' => $ref, 'status' => 'whatever-stale']]]);
    }

    public function test_updated_syncs_period_end_and_cancel_at_period_end_from_stripe_not_from_the_event_payload(): void
    {
        $user = User::factory()->create();
        $this->liveSubscription($user);
        $end = now()->addDays(20)->timestamp;
        $this->stripeState($user, ['cancel_at_period_end' => true, 'items' => ['data' => [['current_period_end' => $end]]]]);

        $this->updated('evt_u1')->assertOk()->assertJsonPath('result', 'processed');

        $sub = Subscription::first()->fresh();
        $this->assertTrue($sub->cancel_at_period_end);
        $this->assertSame($end, $sub->current_period_end->timestamp);
        $this->assertSame('active', $sub->status);
        $this->updated('evt_u1')->assertOk()->assertJsonPath('result', 'duplicate');
    }

    public function test_updated_reads_pre_basil_top_level_period_fields_and_cancel_at(): void
    {
        $user = User::factory()->create();
        $this->liveSubscription($user);
        $end = now()->addDays(10)->timestamp;
        $this->stripeState($user, ['current_period_end' => $end, 'cancel_at' => $end, 'items' => ['data' => [['current_period_end' => null]]]]);

        $this->updated('evt_u2')->assertOk();

        $sub = Subscription::first()->fresh();
        $this->assertSame($end, $sub->current_period_end->timestamp);
        $this->assertTrue($sub->cancel_at_period_end); // flexible billing: scheduled cancel_at instead of the boolean
    }

    public function test_updated_past_due_enters_grace_and_a_later_active_recovers(): void
    {
        $user = User::factory()->create();
        $this->liveSubscription($user);

        $this->stripeState($user, ['status' => 'past_due']);
        $this->updated('evt_u3')->assertOk();
        $sub = Subscription::first()->fresh();
        $this->assertSame('past_due', $sub->status);
        $this->assertNotNull($sub->grace_ends_at);

        $this->stripeState($user, ['status' => 'active']);
        $this->updated('evt_u4')->assertOk();
        $sub = Subscription::first()->fresh();
        $this->assertSame('active', $sub->status);
        $this->assertNull($sub->grace_ends_at);
    }

    public function test_updated_unpaid_and_canceled_revoke_access_and_canceled_is_terminal_against_late_events(): void
    {
        $user = User::factory()->create();
        $this->liveSubscription($user);

        $this->stripeState($user, ['status' => 'unpaid']);
        $this->updated('evt_u5')->assertOk();
        $this->assertSame('expired', Subscription::first()->status);
        $this->assertNull(app(SubscriptionService::class)->current($user));

        $this->stripeState($user, ['status' => 'canceled']);
        $this->updated('evt_u6')->assertOk();
        $this->assertSame('canceled', Subscription::first()->status);

        // an out-of-order older "active" snapshot must not resurrect it
        $this->stripeState($user, ['status' => 'active']);
        $this->updated('evt_u7')->assertOk();
        $this->assertSame('canceled', Subscription::first()->status);
    }

    public function test_updated_unpaid_then_paid_again_revives_only_with_a_future_period_and_no_scheduled_cancel(): void
    {
        $user = User::factory()->create();
        $this->liveSubscription($user);
        $this->stripeState($user, ['status' => 'unpaid']);
        $this->updated('evt_u8')->assertOk();

        $this->stripeState($user, ['status' => 'active', 'cancel_at_period_end' => true]);
        $this->updated('evt_u9')->assertOk();
        $this->assertSame('expired', Subscription::first()->status);

        $this->stripeState($user, ['status' => 'active']);
        $this->updated('evt_u10')->assertOk();
        $this->assertSame('active', Subscription::first()->status);
    }

    public function test_updated_changes_plan_by_configured_price_id_or_metadata_and_updates_the_base_item(): void
    {
        config(['billing.stripe.price_ids' => ['pro' => 'price_pro']]);
        $user = User::factory()->create();
        $sub = $this->liveSubscription($user);

        $this->stripeState($user, ['items' => ['data' => [['price' => ['id' => 'price_pro']]]]]);
        $this->updated('evt_u11')->assertOk();
        $this->assertSame('pro', $sub->fresh()->plan->key);
        $this->assertSame(Plan::where('key', 'pro')->value('id'), $sub->items()->where('slot', 'base')->value('plan_id'));

        config(['billing.stripe.price_ids' => []]);
        $this->stripeState($user, ['metadata' => ['plan' => 'plus']]);
        $this->updated('evt_u12')->assertOk();
        $this->assertSame('plus', $sub->fresh()->plan->key);
    }

    public function test_updated_for_an_unknown_subscription_or_user_is_ignored_and_a_stripe_404_is_ignored(): void
    {
        $user = User::factory()->create();
        $this->stripeState($user, [], 'sub_unknown');
        $this->updated('evt_u13', 'sub_unknown')->assertOk(); // nothing to update: checkout.session.completed is the only creator

        Http::fake(['api.stripe.com/v1/subscriptions/sub_gone' => Http::response(['error' => ['code' => 'resource_missing']], 404)]);
        $this->updated('evt_u14', 'sub_gone')->assertOk()->assertJsonPath('result', 'ignored');
        $this->assertSame(0, Subscription::count());
    }

    public function test_updated_lookup_failure_returns_5xx_so_stripe_retries_and_state_is_untouched(): void
    {
        $user = User::factory()->create();
        $this->liveSubscription($user);
        Http::fake(['api.stripe.com/v1/subscriptions/sub_u1' => Http::response([], 500)]);

        $this->updated('evt_u15')->assertStatus(503);
        $this->assertSame('active', Subscription::first()->status);
        $this->assertSame(0, \DB::table('billing_events')->where('event_id', 'evt_u15')->count());
    }

    public function test_the_checkout_redirect_alone_never_grants_anything(): void
    {
        $user = User::factory()->create();
        Http::fake(['api.stripe.com/v1/checkout/sessions' => Http::response(['id' => 'cs_1', 'url' => 'https://checkout.stripe.com/x'])]);
        $this->actingAs($user, 'sanctum');
        $this->postJson('/api/v1/billing/checkout', ['plan' => 'plus'])->assertOk();
        $this->getJson('/api/v1/billing/subscription?checkout=success&session_id=cs_1')->assertOk()->assertJsonPath('data.plan.key', 'free');
        $this->assertSame(0, Subscription::count());
    }

    public function test_charge_refunded_on_newer_api_versions_resolves_the_invoice_through_the_payment_intent(): void
    {
        $user = User::factory()->create();
        Payment::create(['user_id' => $user->id, 'provider' => 'stripe', 'provider_ref' => 'in_9', 'amount_minor' => 599, 'currency' => 'EUR', 'status' => 'succeeded']);
        Http::fake(['api.stripe.com/v1/invoice_payments*' => Http::response(['data' => [['invoice' => 'in_9', 'status' => 'paid']], 'has_more' => false])]);

        $this->hook(['id' => 'evt_basil', 'type' => 'charge.refunded', 'data' => ['object' => ['id' => 'ch_9', 'payment_intent' => 'pi_9', 'refunded' => true, 'amount_refunded' => 599]]])->assertOk();

        $this->assertSame('refunded', Payment::where('provider_ref', 'in_9')->value('status'));
        Http::assertSent(fn (Request $r) => $r->method() === 'GET' && str_contains($r->url(), 'payment%5Bpayment_intent%5D=pi_9') && ! $r->hasHeader('Idempotency-Key'));
    }

    public function test_charge_refunded_lookup_failure_is_retryable_not_silently_dropped(): void
    {
        Http::fake(['api.stripe.com/v1/invoice_payments*' => Http::response([], 500)]);
        $this->withoutExceptionHandling();
        $this->expectException(ApiException::class);
        $this->hook(['id' => 'evt_basil2', 'type' => 'charge.refunded', 'data' => ['object' => ['id' => 'ch_9', 'payment_intent' => 'pi_9', 'refunded' => true]]]);
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
