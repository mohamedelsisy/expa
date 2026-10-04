<?php

namespace Tests\Feature\Billing;

use App\Domains\Access\Services\AccessSynchronizer;
use App\Domains\Audit\Models\AuditLog;
use App\Domains\Billing\Contracts\PaymentProvider;
use App\Domains\Billing\Models\Invoice;
use App\Domains\Billing\Models\Payment;
use App\Domains\Billing\Models\PaymentMethod;
use App\Domains\Billing\Models\Plan;
use App\Domains\Billing\Models\Subscription;
use App\Domains\Billing\Services\CheckoutSession;
use App\Domains\Billing\Services\FakePaymentProvider;
use App\Domains\Billing\Services\SubscriptionService;
use App\Models\User;
use Database\Seeders\PlanSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Tests\TestCase;

class BillingTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(PlanSeeder::class);
        app(AccessSynchronizer::class)->sync();
        config(['billing.provider' => 'fake']);
    }

    private function user(): User
    {
        $u = User::factory()->create();
        $this->actingAs($u, 'sanctum');

        return $u;
    }

    private function staff(string $role): User
    {
        $u = User::factory()->create();
        $u->syncRoleKeys([$role]);
        $this->actingAs($u, 'sanctum');

        return $u;
    }

    private function hook(array $event, ?string $signature = null, string $provider = 'fake')
    {
        $body = json_encode($event);

        return $this->call('POST', "/api/v1/billing/webhook/$provider", [], [], [], [
            'CONTENT_TYPE' => 'application/json', 'HTTP_ACCEPT' => 'application/json', 'HTTP_X_FAKE_SIGNATURE' => $signature ?? FakePaymentProvider::sign($body),
        ], $body);
    }

    private function subscribe(User $u, string $plan = 'plus', string $ref = 'sub_1'): void
    {
        $this->hook(['id' => 'evt_'.$ref.$plan, 'type' => 'checkout.completed', 'user_id' => $u->id, 'plan' => $plan, 'subscription_ref' => $ref,
            'period_start' => now()->toIso8601String(), 'period_end' => now()->addMonth()->toIso8601String()])->assertOk();
    }

    // ---- catalogue ----------------------------------------------------------------------------

    public function test_plan_seeder_creates_the_catalogue_once_and_never_overwrites_edits(): void
    {
        $this->assertSame(['free', 'plus', 'pro'], Plan::orderBy('sort_order')->pluck('key')->all());
        Plan::where('key', 'plus')->update(['price_minor' => 799]);
        $this->seed(PlanSeeder::class);

        $this->assertSame(3, Plan::count());
        $this->assertSame(799, Plan::where('key', 'plus')->value('price_minor'), 'edited price must survive re-seeding');
        foreach (Plan::with('translations')->get() as $p) {
            $this->assertSame([], $p->missingLocales(), $p->key);
        }
    }

    public function test_public_plans_are_localized_active_only_and_carry_configurable_prices(): void
    {
        Plan::where('key', 'pro')->update(['active' => false]);
        Plan::where('key', 'plus')->update(['price_minor' => 650]);

        $res = $this->getJson('/api/v1/billing/plans', ['Accept-Language' => 'ar'])->assertOk();
        $this->assertSame(['free', 'plus'], array_column($res->json('data'), 'key'));
        $plus = $res->json('data.1');
        $this->assertSame(['amount_minor' => 650, 'currency' => 'EUR', 'interval' => 'month'], $plus['price']);
        $this->assertSame('بلس', $plus['name']);
        $this->assertSame(100, $plus['features']['ai_daily_limit']);
        $this->assertSame('Gratuito', $this->getJson('/api/v1/billing/plans', ['Accept-Language' => 'it'])->json('data.0.name'));
        $this->assertStringContainsString('max-age=300', $this->getJson('/api/v1/billing/plans')->headers->get('Cache-Control'));
    }

    public function test_no_price_is_hard_coded_in_code_paths(): void
    {
        $src = '';
        foreach (new \RecursiveIteratorIterator(new \RecursiveDirectoryIterator(app_path('Domains/Billing'))) as $f) {
            $src .= $f->isFile() ? file_get_contents($f->getPathname()) : '';
        }
        $this->assertDoesNotMatchRegularExpression('/\b(599|1499)\b/', $src);
    }

    // ---- checkout & subscription state --------------------------------------------------------

    public function test_subscription_endpoint_defaults_to_free(): void
    {
        $this->user();
        $this->getJson('/api/v1/billing/subscription', ['Accept-Language' => 'en'])->assertOk()
            ->assertJsonPath('data.plan.key', 'free')->assertJsonPath('data.status', 'free')->assertJsonPath('data.billing_available', true);
        config(['billing.provider' => 'none']);
        $this->getJson('/api/v1/billing/subscription')->assertJsonPath('data.billing_available', false);
    }

    public function test_checkout_requires_auth_and_a_configured_provider(): void
    {
        $this->postJson('/api/v1/billing/checkout', ['plan' => 'plus'])->assertUnauthorized();
        $this->user();
        config(['billing.provider' => 'none']);
        $this->postJson('/api/v1/billing/checkout', ['plan' => 'plus'], ['Accept-Language' => 'en'])
            ->assertStatus(503)->assertJsonPath('error.code', 'billing_unavailable');
    }

    public function test_checkout_returns_a_provider_url_and_uses_server_side_redirects_only(): void
    {
        config(['expa.frontend_url' => 'https://app.expa.test']);
        $spy = new class extends FakePaymentProvider
        {
            public array $urls = [];

            public function createCheckout(User $user, Plan $plan, string $successUrl, string $cancelUrl): CheckoutSession
            {
                $this->urls = [$successUrl, $cancelUrl];

                return parent::createCheckout($user, $plan, $successUrl, $cancelUrl);
            }
        };
        $this->app->instance(PaymentProvider::class, $spy);
        $this->user();

        $res = $this->postJson('/api/v1/billing/checkout', ['plan' => 'plus', 'success_url' => 'https://evil.test/x', 'cancel_url' => 'https://evil.test/y'], ['Accept-Language' => 'ar'])->assertOk();
        $this->assertStringStartsWith('https://pay.fake.test/checkout/', $res->json('data.checkout_url'));
        $this->assertSame(['https://app.expa.test/ar/billing/success', 'https://app.expa.test/ar/billing/cancelled'], $spy->urls);
    }

    public function test_checkout_validation(): void
    {
        $u = $this->user();
        $this->postJson('/api/v1/billing/checkout', [])->assertStatus(422);
        $this->postJson('/api/v1/billing/checkout', ['plan' => 'platinum'])->assertStatus(422);
        $this->postJson('/api/v1/billing/checkout', ['plan' => 'free'])->assertStatus(422)->assertJsonPath('error.code', 'plan_not_purchasable');
        Plan::where('key', 'pro')->update(['active' => false]);
        $this->postJson('/api/v1/billing/checkout', ['plan' => 'pro'])->assertStatus(422)->assertJsonPath('error.code', 'plan_not_purchasable');

        $this->subscribe($u);
        $this->postJson('/api/v1/billing/checkout', ['plan' => 'plus'])->assertStatus(409)->assertJsonPath('error.code', 'already_subscribed');
    }

    // ---- webhooks -----------------------------------------------------------------------------

    public function test_webhook_rejects_bad_signatures_wrong_providers_and_malformed_payloads(): void
    {
        $u = User::factory()->create();
        $event = ['id' => 'e1', 'type' => 'checkout.completed', 'user_id' => $u->id, 'plan' => 'plus', 'subscription_ref' => 's1'];

        $this->hook($event, 'deadbeef')->assertStatus(400)->assertJsonPath('error.code', 'invalid_webhook');
        $this->hook($event, '')->assertStatus(400);
        $this->hook($event, provider: 'stripe')->assertNotFound();
        $this->hook(['id' => 'e2', 'type' => 'checkout.completed'])->assertStatus(400); // signed but malformed
        $this->assertSame(0, Subscription::count());

        config(['billing.provider' => 'none']);
        $this->hook($event)->assertNotFound();
    }

    public function test_checkout_completed_activates_the_subscription_and_changes_entitlements(): void
    {
        $u = $this->user();
        $this->assertSame('free', app(SubscriptionService::class)->planKey($u));
        $this->subscribe($u, 'plus');

        $sub = Subscription::first();
        $this->assertSame(['active', 'fake', 'sub_1'], [$sub->status, $sub->provider, $sub->provider_ref]);
        $this->assertSame(599, $sub->items()->first()->unit_price_minor);
        $this->assertSame('plus', app(SubscriptionService::class)->planKey($u->fresh()));
        $this->getJson('/api/v1/billing/subscription')->assertJsonPath('data.plan.key', 'plus')->assertJsonPath('data.status', 'active');
    }

    public function test_replayed_events_are_processed_once(): void
    {
        $u = User::factory()->create();
        $this->subscribe($u);
        $pay = ['id' => 'pay_evt_1', 'type' => 'payment.succeeded', 'user_id' => $u->id, 'subscription_ref' => 'sub_1', 'payment_ref' => 'pi_1', 'amount_minor' => 599, 'currency' => 'EUR',
            'period_start' => now()->toIso8601String(), 'period_end' => now()->addMonth()->toIso8601String()];

        $this->hook($pay)->assertOk()->assertJsonPath('result', 'processed');
        $this->hook($pay)->assertOk()->assertJsonPath('result', 'duplicate');
        // same payment under a NEW event id (provider retry quirks) still yields exactly one payment + invoice
        $this->hook(['id' => 'pay_evt_2'] + $pay)->assertOk();

        $this->assertSame(1, Payment::count());
        $this->assertSame(1, Invoice::count());
        $this->assertSame(3, DB::table('billing_events')->count()); // checkout + two distinct payment event ids; the replay left no extra row
    }

    public function test_payment_succeeded_creates_numbered_invoice_and_extends_the_period(): void
    {
        $u = User::factory()->create();
        $this->subscribe($u);
        $end = now()->addMonths(2)->startOfSecond();

        $this->hook(['id' => 'p1', 'type' => 'payment.succeeded', 'user_id' => $u->id, 'subscription_ref' => 'sub_1', 'payment_ref' => 'pi_9', 'amount_minor' => 599, 'currency' => 'EUR', 'period_end' => $end->toIso8601String()])->assertOk();

        $inv = Invoice::first();
        $this->assertMatchesRegularExpression('/^EXPA-'.now()->format('Y').'-\d{6}$/', $inv->number);
        $this->assertSame([599, 'EUR', $u->id], [$inv->total_minor, $inv->currency, $inv->user_id]);
        $this->assertSame('succeeded', Payment::first()->status);
        $this->assertTrue(Subscription::first()->current_period_end->equalTo($end));

        $this->actingAs($u, 'sanctum');
        $list = $this->getJson('/api/v1/billing/invoices')->assertOk()->json('data');
        $this->assertSame([$inv->number], array_column($list, 'number'));
        $this->actingAs(User::factory()->create(), 'sanctum');
        $this->assertSame([], $this->getJson('/api/v1/billing/invoices')->json('data')); // invoices are private
    }

    public function test_failed_payment_marks_past_due_but_keeps_a_grace_access_and_recovers(): void
    {
        $u = User::factory()->create();
        $this->subscribe($u);
        $this->hook(['id' => 'f1', 'type' => 'payment.failed', 'user_id' => $u->id, 'subscription_ref' => 'sub_1', 'payment_ref' => 'pi_f', 'amount_minor' => 599, 'failure_code' => 'card_declined'])->assertOk();

        $this->assertSame('past_due', Subscription::first()->status);
        $this->assertSame(['failed', 'card_declined'], [Payment::first()->status, Payment::first()->failure_code]);
        $this->assertSame('plus', app(SubscriptionService::class)->planKey($u)); // grace period while the provider retries

        $this->hook(['id' => 'f2', 'type' => 'payment.succeeded', 'user_id' => $u->id, 'subscription_ref' => 'sub_1', 'payment_ref' => 'pi_ok', 'amount_minor' => 599, 'currency' => 'EUR'])->assertOk();
        $this->assertSame('active', Subscription::first()->status);
    }

    public function test_provider_cancellation_ends_access_and_plan_switch_replaces_the_old_subscription(): void
    {
        $u = User::factory()->create();
        $this->subscribe($u, 'plus', 'sub_a');
        $this->subscribe($u, 'pro', 'sub_b');

        $this->assertSame(['canceled', 'active'], Subscription::orderBy('id')->pluck('status')->all());
        $this->assertSame('pro', app(SubscriptionService::class)->planKey($u));

        $this->hook(['id' => 'c1', 'type' => 'subscription.canceled', 'user_id' => $u->id, 'subscription_ref' => 'sub_b'])->assertOk();
        $this->assertSame('free', app(SubscriptionService::class)->planKey($u->fresh()));
    }

    public function test_unknown_users_and_event_types_are_acknowledged_and_ignored(): void
    {
        $this->hook(['id' => 'x1', 'type' => 'checkout.completed', 'user_id' => 99999, 'plan' => 'plus', 'subscription_ref' => 's'])->assertOk()->assertJsonPath('result', 'ignored');
        $this->hook(['id' => 'x2', 'type' => 'invoice.finalized', 'user_id' => User::factory()->create()->id])->assertOk()->assertJsonPath('result', 'ignored');
        $this->assertSame(0, Subscription::count());
    }

    // ---- entitlements -------------------------------------------------------------------------

    public function test_ai_daily_limit_follows_the_plan(): void
    {
        $u = $this->user();
        $this->getJson('/api/v1/ai/usage')->assertJsonPath('data.limit', 10);
        $this->subscribe($u, 'plus');
        $this->getJson('/api/v1/ai/usage')->assertJsonPath('data.limit', 100);
        $this->subscribe($u, 'pro', 'sub_2');
        $this->getJson('/api/v1/ai/usage')->assertJsonPath('data.limit', 300);

        Plan::where('key', 'pro')->update(['features' => ['ai_daily_limit' => 7]]); // plan features are editable data
        $this->getJson('/api/v1/ai/usage')->assertJsonPath('data.limit', 7);
    }

    public function test_cancel_keeps_access_until_the_period_ends_then_the_command_expires_it(): void
    {
        $u = $this->user();
        $this->subscribe($u, 'plus');
        $provider = app(PaymentProvider::class);

        $this->postJson('/api/v1/billing/cancel')->assertOk()->assertJsonPath('data.cancel_at_period_end', true);
        $this->postJson('/api/v1/billing/cancel')->assertOk(); // idempotent
        $this->assertSame(['sub_1'], $provider->canceled);
        $this->assertSame('plus', app(SubscriptionService::class)->planKey($u)); // still entitled
        $this->getJson('/api/v1/billing/subscription')->assertJsonPath('data.cancel_at_period_end', true);

        $this->travel(32)->days();
        $this->assertSame('free', app(SubscriptionService::class)->planKey($u->fresh())); // period over: entitlement gone even before the command
        $this->artisan('expa:billing-expire')->expectsOutputToContain('Expired 1')->assertSuccessful();
        $this->assertSame('expired', Subscription::first()->status);
    }

    public function test_cancel_edge_cases(): void
    {
        $this->user();
        $this->postJson('/api/v1/billing/cancel')->assertStatus(404)->assertJsonPath('error.code', 'no_cancellable_subscription');
    }

    // ---- admin --------------------------------------------------------------------------------

    public function test_admin_access_and_manual_grants(): void
    {
        $customer = User::factory()->create();
        $this->actingAs($customer, 'sanctum')->getJson('/api/v1/admin/subscriptions')->assertForbidden();

        $this->staff('support_agent');
        $this->getJson('/api/v1/admin/subscriptions')->assertOk();
        $this->postJson('/api/v1/admin/subscriptions/grant', ['user_id' => $customer->id, 'plan' => 'plus', 'days' => 30])->assertForbidden(); // view ≠ manage

        $admin = $this->staff('admin');
        $this->postJson('/api/v1/admin/subscriptions/grant', ['user_id' => $customer->id, 'plan' => 'plus', 'days' => 30])->assertCreated();
        $this->assertSame('plus', app(SubscriptionService::class)->planKey($customer->fresh()));
        $log = AuditLog::firstWhere('action', 'admin.subscription.granted');
        $this->assertSame([$admin->id, 'plus', 30], [$log->actor_id, $log->changes['plan'], $log->changes['days']]);

        foreach ([['user_id' => 99999, 'plan' => 'plus', 'days' => 5], ['user_id' => $customer->id, 'plan' => 'gold', 'days' => 5], ['user_id' => $customer->id, 'plan' => 'plus', 'days' => 0], ['user_id' => $customer->id, 'plan' => 'plus', 'days' => 999]] as $bad) {
            $this->postJson('/api/v1/admin/subscriptions/grant', $bad)->assertStatus(422);
        }
    }

    public function test_admin_list_filters_and_cancel(): void
    {
        $u = User::factory()->create(['email' => 'cust@example.com']);
        $this->subscribe($u, 'plus');
        $this->staff('admin');

        $this->getJson('/api/v1/admin/subscriptions?filter[status]=active&filter[plan]=plus')->assertJsonPath('meta.total', 1)->assertJsonPath('data.0.user_email', 'cust@example.com');
        $this->getJson('/api/v1/admin/subscriptions?filter[plan]=pro')->assertJsonPath('meta.total', 0);
        $this->getJson('/api/v1/admin/subscriptions?filter[status]=bogus')->assertStatus(422);

        $this->postJson('/api/v1/admin/subscriptions/'.Subscription::first()->id.'/cancel')->assertOk();
        $this->assertSame('free', app(SubscriptionService::class)->planKey($u->fresh()));
        $this->postJson('/api/v1/admin/subscriptions/99999/cancel')->assertNotFound();
    }

    public function test_manual_grant_expires_and_cannot_be_user_cancelled(): void
    {
        $u = $this->user();
        app(SubscriptionService::class)->grant($u, Plan::where('key', 'pro')->first(), 10, $u);
        $this->assertSame('pro', app(SubscriptionService::class)->planKey($u->fresh()));
        $this->postJson('/api/v1/billing/cancel')->assertStatus(404);

        $this->travel(11)->days();
        $this->artisan('expa:billing-expire')->expectsOutputToContain('Expired 1');
        $this->assertSame('free', app(SubscriptionService::class)->planKey($u->fresh()));
    }

    // ---- privacy & PCI ------------------------------------------------------------------------

    public function test_payment_methods_store_metadata_only_never_card_numbers(): void
    {
        $cols = Schema::getColumnListing('payment_methods');
        foreach (['number', 'pan', 'card_number', 'cvc', 'cvv', 'security_code'] as $forbidden) {
            $this->assertNotContains($forbidden, $cols);
        }
        $this->assertContains('last4', $cols);
    }

    public function test_export_includes_billing_and_erasure_keeps_accounting_records_but_ends_subscriptions(): void
    {
        $u = User::factory()->create();
        $this->subscribe($u);
        $this->hook(['id' => 'p', 'type' => 'payment.succeeded', 'user_id' => $u->id, 'subscription_ref' => 'sub_1', 'payment_ref' => 'pi_1', 'amount_minor' => 599, 'currency' => 'EUR'])->assertOk();
        $m = new PaymentMethod(['provider' => 'fake', 'provider_ref' => 'pm_1', 'brand' => 'visa', 'last4' => '4242']);
        $m->user_id = $u->id;
        $m->save();

        $this->actingAs($u, 'sanctum');
        $export = $this->getJson('/api/v1/profile/export')->assertOk();
        $export->assertJsonPath('data.billing.subscriptions.0.plan', 'plus')->assertJsonPath('data.billing.payment_methods.0.last4', '4242');
        $this->assertStringNotContainsString('provider_ref', $export->getContent());

        $this->deleteJson('/api/v1/profile', ['password' => 'password'])->assertStatus(202);

        $this->assertSame(0, PaymentMethod::where('user_id', $u->id)->count());
        $this->assertSame('canceled', Subscription::first()->status);
        $this->assertSame(1, Payment::where('user_id', $u->id)->count());   // retained: accounting obligation
        $this->assertSame(1, Invoice::where('user_id', $u->id)->count());
        $this->assertTrue(User::withTrashed()->find($u->id)->trashed());    // …attached only to the anonymized stub
    }

    // ---- out-of-order delivery ----------------------------------------------------------------

    public function test_a_cancellation_delivered_before_the_checkout_event_is_honoured(): void
    {
        $u = User::factory()->create();
        $this->hook(['id' => 'c-first', 'type' => 'subscription.canceled', 'user_id' => $u->id, 'subscription_ref' => 'sub_x'])->assertOk();
        $this->hook(['id' => 'late-checkout', 'type' => 'checkout.completed', 'user_id' => $u->id, 'plan' => 'plus', 'subscription_ref' => 'sub_x',
            'period_end' => now()->addMonth()->toIso8601String()])->assertOk();

        $this->assertSame(0, Subscription::count(), 'a late "completed" must not resurrect an already-canceled subscription');
        $this->assertSame('free', app(SubscriptionService::class)->planKey($u));
    }

    public function test_a_late_payment_never_reactivates_a_canceled_subscription_but_is_still_recorded(): void
    {
        $u = User::factory()->create();
        $this->subscribe($u);
        $this->hook(['id' => 'c', 'type' => 'subscription.canceled', 'user_id' => $u->id, 'subscription_ref' => 'sub_1'])->assertOk();
        $this->hook(['id' => 'p-late', 'type' => 'payment.succeeded', 'user_id' => $u->id, 'subscription_ref' => 'sub_1', 'payment_ref' => 'pi_late', 'amount_minor' => 599, 'currency' => 'EUR',
            'period_end' => now()->addMonth()->toIso8601String()])->assertOk();

        $this->assertSame('canceled', Subscription::first()->status);
        $this->assertSame('free', app(SubscriptionService::class)->planKey($u->fresh()));
        $this->assertSame(1, Payment::count());   // money was received: payment and invoice exist
        $this->assertSame(1, Invoice::count());
    }

    public function test_a_payment_that_arrives_before_its_subscription_is_linked_later(): void
    {
        $u = User::factory()->create();
        $this->hook(['id' => 'p-early', 'type' => 'payment.succeeded', 'user_id' => $u->id, 'subscription_ref' => 'sub_e', 'payment_ref' => 'pi_e', 'amount_minor' => 599, 'currency' => 'EUR'])->assertOk();
        $this->assertNull(Payment::first()->subscription_id);

        $this->hook(['id' => 'checkout', 'type' => 'checkout.completed', 'user_id' => $u->id, 'plan' => 'plus', 'subscription_ref' => 'sub_e', 'period_end' => now()->addMonth()->toIso8601String()])->assertOk();
        $this->assertSame(Subscription::first()->id, Payment::first()->subscription_id);
    }

    public function test_a_late_failed_event_does_not_downgrade_a_succeeded_payment(): void
    {
        $u = User::factory()->create();
        $this->subscribe($u);
        $base = ['user_id' => $u->id, 'subscription_ref' => 'sub_1', 'payment_ref' => 'pi_z', 'amount_minor' => 599, 'currency' => 'EUR'];
        $this->hook(['id' => 'ok', 'type' => 'payment.succeeded'] + $base)->assertOk();
        $this->hook(['id' => 'late-fail', 'type' => 'payment.failed', 'failure_code' => 'card_declined'] + $base)->assertOk();

        $this->assertSame('succeeded', Payment::first()->status);
        $this->assertSame('active', Subscription::first()->status);
    }

    public function test_access_always_has_an_end_even_when_the_provider_omits_the_period(): void
    {
        $u = User::factory()->create();
        $this->hook(['id' => 'np', 'type' => 'checkout.completed', 'user_id' => $u->id, 'plan' => 'plus', 'subscription_ref' => 'sub_np'])->assertOk();

        $end = Subscription::first()->current_period_end;
        $this->assertNotNull($end);
        $this->assertTrue($end->between(now()->addDays(27), now()->addDays(32)));
    }

    public function test_a_failure_while_processing_does_not_burn_the_event_id(): void
    {
        $u = User::factory()->create();
        $event = ['id' => 'retry-me', 'type' => 'checkout.completed', 'user_id' => $u->id, 'plan' => 'plus', 'subscription_ref' => 'sub_r', 'period_end' => now()->addMonth()->toIso8601String()];

        Subscription::creating(fn () => throw new \RuntimeException('boom after the claim')); // force a processing error
        $this->withoutExceptionHandling();
        try {
            $this->hook($event);
            $this->fail('processing should have failed');
        } catch (\RuntimeException) {
            $this->assertSame(0, DB::table('billing_events')->where('event_id', 'retry-me')->count(), 'the claim must roll back so the provider retry is processed');
        } finally {
            Subscription::flushEventListeners();
        }
    }
}
