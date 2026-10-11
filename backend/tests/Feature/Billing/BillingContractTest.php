<?php

namespace Tests\Feature\Billing;

use App\Domains\Access\Services\AccessSynchronizer;
use App\Domains\Billing\Contracts\PaymentProvider;
use App\Domains\Billing\Models\Plan;
use App\Domains\Billing\Models\Subscription;
use App\Models\User;
use Database\Seeders\PlanSeeder;
use Illuminate\Contracts\Debug\ExceptionHandler;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Client\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Route;
use Tests\TestCase;

/** The contract the web/mobile clients rely on + the Stripe security review assertions (docs/SECURITY.md "Stripe billing review"). */
class BillingContractTest extends TestCase
{
    use RefreshDatabase;

    private const KEY = 'sk_test_abcdefgh12345';

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(PlanSeeder::class);
        app(AccessSynchronizer::class)->sync();
        config(['billing.provider' => 'stripe', 'billing.stripe.secret_key' => self::KEY, 'billing.stripe.webhook_secret' => 'whsec_x', 'billing.stripe.price_ids' => []]);
        $this->app->forgetInstance(PaymentProvider::class);
    }

    public function test_public_plans_contract(): void
    {
        $res = $this->getJson('/api/v1/billing/plans')->assertOk()->assertJsonPath('meta.billing_available', true);
        $plus = collect($res->json('data'))->firstWhere('key', 'plus');
        $this->assertSame(['key', 'name', 'description', 'price', 'features'], array_keys($plus));
        $this->assertSame(['amount_minor' => 599, 'currency' => 'EUR', 'interval' => 'month'], $plus['price']);
        $this->assertIsInt($plus['price']['amount_minor']);
        $this->assertSame(0, collect($res->json('data'))->firstWhere('key', 'free')['price']['amount_minor']);
        $this->assertStringContainsString('public', $res->headers->get('Cache-Control'));

        config(['billing.provider' => 'none']);
        $this->getJson('/api/v1/billing/plans')->assertJsonPath('meta.billing_available', false);
    }

    public function test_checkout_contract_and_server_side_return_urls(): void
    {
        Http::fake(['api.stripe.com/v1/checkout/sessions' => Http::response(['id' => 'cs_1', 'url' => 'https://checkout.stripe.com/c/pay/cs_1'])]);
        config(['expa.frontend_url' => 'https://app.expa.test']);
        $this->postJson('/api/v1/billing/checkout', ['plan' => 'plus'])->assertUnauthorized();
        $this->actingAs(User::factory()->create(), 'sanctum');

        $this->postJson('/api/v1/billing/checkout', ['plan' => 'plus', 'success_url' => 'https://evil.test', 'cancel_url' => 'https://evil.test', 'amount_minor' => 1], ['Accept-Language' => 'en'])
            ->assertOk()->assertJsonPath('data.checkout_url', 'https://checkout.stripe.com/c/pay/cs_1');

        Http::assertSent(function (Request $r) {
            parse_str($r->body(), $b);

            return $b['success_url'] === 'https://app.expa.test/en/settings/billing?checkout=success&session_id={CHECKOUT_SESSION_ID}'
                && $b['cancel_url'] === 'https://app.expa.test/en/settings/billing?checkout=cancelled'
                && $b['line_items'][0]['price_data']['unit_amount'] === '599' && ! str_contains($r->body(), 'evil.test');
        });
    }

    public function test_plan_key_is_validated_against_the_db_and_inactive_or_free_plans_are_not_purchasable(): void
    {
        Http::fake();
        $this->actingAs(User::factory()->create(), 'sanctum');
        $this->postJson('/api/v1/billing/checkout', ['plan' => 'enterprise'])->assertStatus(422);
        $this->postJson('/api/v1/billing/checkout', ['plan' => 'free'])->assertStatus(422)->assertJsonPath('error.code', 'plan_not_purchasable');
        Plan::where('key', 'pro')->update(['active' => false]);
        $this->postJson('/api/v1/billing/checkout', ['plan' => 'pro'])->assertStatus(422)->assertJsonPath('error.code', 'plan_not_purchasable');
        $this->postJson('/api/v1/billing/checkout', ['plan' => ['x']])->assertStatus(422);
        Http::assertNothingSent();
    }

    public function test_cancel_only_ever_touches_the_callers_own_subscription(): void
    {
        Http::fake(['api.stripe.com/*' => Http::response(['id' => 'sub_a'])]);
        $owner = User::factory()->create();
        $sub = new Subscription(['plan_id' => Plan::where('key', 'plus')->value('id'), 'status' => 'active', 'provider' => 'stripe', 'provider_ref' => 'sub_a', 'current_period_end' => now()->addMonth()]);
        $sub->user_id = $owner->id;
        $sub->save();

        $this->actingAs(User::factory()->create(), 'sanctum');
        $this->postJson('/api/v1/billing/cancel', ['subscription_id' => $sub->id, 'user_id' => $owner->id])->assertNotFound();
        $this->assertFalse($sub->fresh()->cancel_at_period_end);
        Http::assertNothingSent();

        $this->actingAs($owner, 'sanctum');
        $this->postJson('/api/v1/billing/cancel')->assertOk();
        $this->assertTrue($sub->fresh()->cancel_at_period_end);
    }

    public function test_stripe_errors_and_keys_never_reach_the_client_or_the_report(): void
    {
        Http::fake(['api.stripe.com/*' => Http::response(['error' => ['message' => 'Invalid API Key provided: '.self::KEY.' for mo@example.com']], 401)]);
        $reported = [];
        $this->app->make(ExceptionHandler::class)->reportable(function (\Throwable $e) use (&$reported) {
            $reported[] = $e->getMessage();
        })->stop();
        $this->actingAs(User::factory()->create(), 'sanctum');

        $res = $this->postJson('/api/v1/billing/checkout', ['plan' => 'plus'])->assertStatus(503);

        foreach ([$res->getContent(), ...$reported] as $text) {
            $this->assertStringNotContainsString(self::KEY, $text);
            $this->assertStringNotContainsString('mo@example.com', $text);
            $this->assertStringNotContainsString('whsec_x', $text);
        }
        $this->assertNotEmpty($reported);
    }

    public function test_the_webhook_and_checkout_routes_are_rate_limited_and_the_webhook_needs_no_auth_but_a_signature(): void
    {
        $webhook = Route::getRoutes()->match(\Illuminate\Http\Request::create('/api/v1/billing/webhook/stripe', 'POST'));
        $this->assertContains('throttle:billing-webhook', $webhook->gatherMiddleware());
        $checkout = Route::getRoutes()->match(\Illuminate\Http\Request::create('/api/v1/billing/checkout', 'POST'));
        $this->assertNotEmpty(array_filter($checkout->gatherMiddleware(), fn ($m) => str_starts_with((string) $m, 'throttle:')));

        $this->postJson('/api/v1/billing/webhook/stripe', ['type' => 'checkout.session.completed'])->assertStatus(400);
        $this->postJson('/api/v1/billing/webhook/paypal', [])->assertNotFound();
    }
}
