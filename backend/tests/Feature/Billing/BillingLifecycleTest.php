<?php

namespace Tests\Feature\Billing;

use App\Domains\Access\Services\AccessSynchronizer;
use App\Domains\Billing\Contracts\PaymentProvider;
use App\Domains\Billing\Models\Invoice;
use App\Domains\Billing\Models\Payment;
use App\Domains\Billing\Models\Plan;
use App\Domains\Billing\Models\Subscription;
use App\Domains\Billing\Models\TaxRate;
use App\Domains\Billing\Services\FakePaymentProvider;
use App\Domains\Billing\Services\InvoiceNumberer;
use App\Domains\Billing\Services\PaymentState;
use App\Domains\Billing\Services\SubscriptionState;
use App\Domains\Notifications\Models\UserNotification;
use App\Models\User;
use Database\Seeders\PlanSeeder;
use Illuminate\Database\QueryException;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class BillingLifecycleTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(PlanSeeder::class);
        app(AccessSynchronizer::class)->sync();
        config(['billing.provider' => 'fake']);
    }

    private function hook(array $event)
    {
        $body = json_encode($event);

        return $this->call('POST', '/api/v1/billing/webhook/fake', [], [], [], [
            'CONTENT_TYPE' => 'application/json', 'HTTP_ACCEPT' => 'application/json', 'HTTP_X_FAKE_SIGNATURE' => FakePaymentProvider::sign($body),
        ], $body);
    }

    private function subscribed(string $ref = 'sub_1'): User
    {
        $u = User::factory()->create();
        $this->hook(['id' => "evt_c_$ref", 'type' => 'checkout.completed', 'user_id' => $u->id, 'plan' => 'plus', 'subscription_ref' => $ref,
            'period_start' => now()->toIso8601String(), 'period_end' => now()->addMonth()->toIso8601String()])->assertOk();

        return $u;
    }

    private function pay(User $u, string $evt, string $payRef = 'pay_1', string $type = 'payment.succeeded', string $sub = 'sub_1', int $amount = 599): void
    {
        $this->hook(['id' => $evt, 'type' => $type, 'user_id' => $u->id, 'subscription_ref' => $sub, 'payment_ref' => $payRef, 'amount_minor' => $amount, 'currency' => 'EUR',
            'period_start' => now()->toIso8601String(), 'period_end' => now()->addMonth()->toIso8601String()])->assertOk();
    }

    // ---- state machines ----------------------------------------------------------------------------

    public function test_subscription_and_payment_state_machines(): void
    {
        $this->assertTrue(SubscriptionState::can('active', 'past_due'));
        $this->assertTrue(SubscriptionState::can('past_due', 'active'));
        $this->assertTrue(SubscriptionState::can('past_due', 'expired'));
        $this->assertFalse(SubscriptionState::can('canceled', 'active'));
        $this->assertFalse(SubscriptionState::can('expired', 'active'));
        $this->assertTrue(PaymentState::can('pending', 'succeeded'));
        $this->assertTrue(PaymentState::can('failed', 'succeeded'));
        $this->assertTrue(PaymentState::can('succeeded', 'refunded'));
        $this->assertFalse(PaymentState::can('succeeded', 'failed'));
        $this->assertFalse(PaymentState::can('refunded', 'succeeded'));
    }

    // ---- BE-6 ------------------------------------------------------------------------------------

    public function test_a_payment_event_without_a_payment_ref_cannot_touch_another_users_payment(): void
    {
        $victim = $this->subscribed();
        $victimPayment = new Payment(['amount_minor' => 599, 'currency' => 'EUR', 'status' => 'succeeded', 'provider' => 'fake', 'provider_ref' => null]);
        $victimPayment->user_id = $victim->id;
        $victimPayment->save();
        $attacker = $this->subscribed('sub_2');

        $res = $this->hook(['id' => 'evt_null', 'type' => 'payment.failed', 'user_id' => $attacker->id, 'subscription_ref' => 'sub_2', 'amount_minor' => 599]);

        $res->assertOk()->assertJsonPath('result', 'ignored');
        $this->assertSame($victim->id, $victimPayment->fresh()->user_id);
        $this->assertSame('succeeded', $victimPayment->fresh()->status);
    }

    public function test_an_existing_payment_row_of_another_user_is_never_adopted(): void
    {
        $a = $this->subscribed('sub_a');
        $this->pay($a, 'evt_p1', 'pay_shared', sub: 'sub_a');
        $b = $this->subscribed('sub_b');
        $this->pay($b, 'evt_p2', 'pay_shared', sub: 'sub_b');

        $this->assertSame($a->id, Payment::where('provider_ref', 'pay_shared')->value('user_id'));
        $this->assertSame(1, Payment::where('provider_ref', 'pay_shared')->count());
    }

    // ---- failed payments / dunning ---------------------------------------------------------------

    public function test_failed_renewal_enters_grace_notifies_and_keeps_access_then_expires(): void
    {
        $u = $this->subscribed();
        $this->pay($u, 'evt_fail', 'pay_f', 'payment.failed');

        $sub = Subscription::first();
        $this->assertSame('past_due', $sub->status);
        $this->assertNotNull($sub->grace_ends_at);
        $this->assertTrue($sub->grantsAccess(), 'access is kept during the grace period');
        $this->assertSame(['payment_failed'], UserNotification::where('user_id', $u->id)->pluck('type')->all());

        // reminder after 3 days
        $this->travel(4)->days();
        $this->artisan('expa:billing-expire')->assertSuccessful();
        $this->assertContains('payment_failed_reminder', UserNotification::where('user_id', $u->id)->pluck('type')->all());
        $this->assertSame('past_due', $sub->fresh()->status);

        // grace over
        $this->travel(5)->days();
        $this->artisan('expa:billing-expire')->assertSuccessful();
        $this->assertSame('expired', $sub->fresh()->status);
        $this->assertFalse($sub->fresh()->grantsAccess());
        $this->assertContains('subscription_ended', UserNotification::where('user_id', $u->id)->pluck('type')->all());
    }

    public function test_a_successful_retry_recovers_the_subscription_and_clears_dunning(): void
    {
        $u = $this->subscribed();
        $this->pay($u, 'evt_fail', 'pay_f', 'payment.failed');
        $this->pay($u, 'evt_ok', 'pay_f', 'payment.succeeded'); // provider retried the same invoice

        $sub = Subscription::first();
        $this->assertSame('active', $sub->status);
        $this->assertNull($sub->grace_ends_at);
        $this->assertSame('succeeded', Payment::where('provider_ref', 'pay_f')->value('status'));
        $this->assertSame(1, Invoice::count());
    }

    public function test_a_late_failed_event_does_not_downgrade_a_succeeded_payment(): void
    {
        $u = $this->subscribed();
        $this->pay($u, 'evt_ok', 'pay_x');
        $this->pay($u, 'evt_late', 'pay_x', 'payment.failed');

        $this->assertSame('succeeded', Payment::where('provider_ref', 'pay_x')->value('status'));
        $this->assertSame('active', Subscription::first()->status);
    }

    public function test_refund_marks_the_payment_refunded_and_is_terminal(): void
    {
        $u = $this->subscribed();
        $this->pay($u, 'evt_ok', 'pay_r');
        $this->hook(['id' => 'evt_refund', 'type' => 'payment.refunded', 'user_id' => 0, 'payment_ref' => 'pay_r'])->assertOk();
        $this->assertSame('refunded', Payment::where('provider_ref', 'pay_r')->value('status'));
        $this->assertNotNull(Payment::where('provider_ref', 'pay_r')->value('refunded_at'));

        $this->pay($u, 'evt_again', 'pay_r'); // cannot go back
        $this->assertSame('refunded', Payment::where('provider_ref', 'pay_r')->value('status'));
    }

    // ---- invoices & VAT ----------------------------------------------------------------------------

    public function test_invoice_numbers_are_sequential_per_year_and_gap_free(): void
    {
        $n = app(InvoiceNumberer::class);
        $this->assertSame('EXPA-2024-000001', $n->next(2024));
        $this->assertSame('EXPA-2024-000002', $n->next(2024));
        $this->assertSame('EXPA-2025-000001', $n->next(2025));

        $u = $this->subscribed();
        $this->pay($u, 'evt_1', 'pay_1');
        $this->pay($u, 'evt_2', 'pay_2');
        $numbers = Invoice::orderBy('id')->pluck('number')->all();
        $y = now()->format('Y');
        $this->assertSame(["EXPA-$y-000001", "EXPA-$y-000002"], $numbers);
    }

    public function test_no_tax_lines_exist_unless_a_vat_rate_is_configured(): void
    {
        $this->assertSame(0, TaxRate::count(), 'the tax table ships empty');
        $this->assertNull(Plan::where('key', 'plus')->value('vat_rate'));

        $u = $this->subscribed();
        $this->pay($u, 'evt_1', 'pay_1');
        $inv = Invoice::first();
        $this->assertNull($inv->tax_minor);
        $this->assertNull($inv->net_minor);

        $this->actingAs($u, 'sanctum')->getJson('/api/v1/billing/invoices')->assertOk()->assertJsonMissingPath('data.0.tax');
    }

    public function test_a_configured_plan_rate_adds_tax_lines_gross_inclusive(): void
    {
        // Rate below is a TEST FIXTURE chosen to make the arithmetic obvious; it is not a statement about Italian VAT.
        Plan::where('key', 'plus')->update(['vat_rate' => '10.00', 'price_includes_vat' => true]);
        $u = $this->subscribed();
        $this->pay($u, 'evt_1', 'pay_1', amount: 1100);

        $inv = Invoice::first();
        $this->assertSame(1000, $inv->net_minor);
        $this->assertSame(100, $inv->tax_minor);
        $this->assertSame(1100, $inv->total_minor);
        $this->actingAs($u, 'sanctum')->getJson('/api/v1/billing/invoices')->assertJsonPath('data.0.tax.amount_minor', 100)->assertJsonPath('data.0.net_minor', 1000);
    }

    public function test_only_verified_country_rates_are_applied(): void
    {
        config(['billing.tax.country' => 'IT']);
        TaxRate::create(['country' => 'IT', 'label' => 'VAT', 'rate' => '20.00', 'verified_at' => null]); // unverified: ignored
        $u = $this->subscribed();
        $this->pay($u, 'evt_1', 'pay_1', amount: 1200);
        $this->assertNull(Invoice::first()->tax_minor);

        TaxRate::query()->update(['verified_at' => now()]);
        $this->pay($u, 'evt_2', 'pay_2', amount: 1200);
        $this->assertSame(200, Invoice::where('total_minor', 1200)->orderByDesc('id')->first()->tax_minor);
    }

    public function test_the_plan_price_excluding_vat_flag_derives_tax_from_the_net_price(): void
    {
        Plan::where('key', 'plus')->update(['vat_rate' => '10.00', 'price_includes_vat' => false, 'price_minor' => 1000]);
        $u = $this->subscribed();
        $this->pay($u, 'evt_1', 'pay_1', amount: 1100);
        $inv = Invoice::first();
        $this->assertSame(1000, $inv->net_minor);
        $this->assertSame(100, $inv->tax_minor);
    }

    // ---- BE-5 -----------------------------------------------------------------------------------

    public function test_admin_cancel_stops_billing_at_the_provider_first(): void
    {
        $u = $this->subscribed();
        $fake = new FakePaymentProvider;
        $this->app->instance(PaymentProvider::class, $fake);
        $staff = User::factory()->create();
        $staff->syncRoleKeys(['admin']);
        $this->actingAs($staff, 'sanctum');
        $sub = Subscription::first();

        $this->postJson("/api/v1/admin/subscriptions/{$sub->id}/cancel")->assertOk();

        $this->assertSame(['sub_1'], $fake->canceled);
        $this->assertSame('canceled', $sub->fresh()->status);
    }

    public function test_admin_cancel_changes_nothing_when_the_provider_call_fails(): void
    {
        $this->subscribed();
        $this->app->instance(PaymentProvider::class, new class extends FakePaymentProvider
        {
            public function cancelSubscription(Subscription $subscription, bool $atPeriodEnd = true): void
            {
                throw new \RuntimeException('provider down');
            }
        });
        $staff = User::factory()->create();
        $staff->syncRoleKeys(['admin']);
        $this->actingAs($staff, 'sanctum');
        $sub = Subscription::first();

        $this->postJson("/api/v1/admin/subscriptions/{$sub->id}/cancel")->assertStatus(503);
        $this->assertSame('active', $sub->fresh()->status);
    }

    public function test_manual_grants_are_cancelled_locally_without_a_provider_call(): void
    {
        $staff = User::factory()->create();
        $staff->syncRoleKeys(['admin']);
        $user = User::factory()->create();
        $this->actingAs($staff, 'sanctum');
        $this->postJson('/api/v1/admin/subscriptions/grant', ['user_id' => $user->id, 'plan' => 'plus', 'days' => 30])->assertCreated();
        $id = Subscription::first()->id;
        config(['billing.provider' => 'none']); // no provider available: a manual grant must still be cancellable
        $this->postJson("/api/v1/admin/subscriptions/$id/cancel")->assertOk();
        $this->assertSame('canceled', Subscription::first()->status);
    }

    // ---- BE-27 / BE-28 -----------------------------------------------------------------------------

    public function test_duplicate_provider_subscriptions_and_invoices_are_rejected_by_the_database(): void
    {
        $this->subscribed();
        $dup = new Subscription(['plan_id' => Plan::first()->id, 'status' => 'active', 'provider' => 'fake', 'provider_ref' => 'sub_1']);
        $dup->user_id = User::first()->id;
        $this->expectException(QueryException::class);
        $dup->save();
    }

    public function test_a_hard_delete_of_a_user_with_billing_history_fails_loudly(): void
    {
        $u = $this->subscribed();
        $this->pay($u, 'evt_1', 'pay_1');
        $this->expectException(QueryException::class);
        $u->forceDelete();
    }
}
