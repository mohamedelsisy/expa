<?php

namespace Tests\Feature\Billing;

use App\Console\Commands\Preflight;
use App\Domains\Access\Services\AccessSynchronizer;
use App\Domains\Billing\Contracts\PaymentProvider;
use App\Domains\Billing\Models\Plan;
use App\Domains\Billing\Services\StripeKey;
use App\Domains\Billing\Services\StripePaymentProvider;
use App\Exceptions\ApiException;
use App\Models\User;
use Database\Seeders\PlanSeeder;
use Illuminate\Contracts\Debug\ExceptionHandler;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Client\Factory;
use Illuminate\Http\Client\Request;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class StripeSafetyTest extends TestCase
{
    use RefreshDatabase;

    // Fixtures are assembled at runtime so no key-shaped literal sits in the source.
    private function key(string $mode, string $kind = 'sk'): string
    {
        return $kind.'_'.$mode.'_'.str_repeat('a1', 12);
    }

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(PlanSeeder::class);
        app(AccessSynchronizer::class)->sync();
        config(['billing.provider' => 'stripe', 'billing.stripe.secret_key' => $this->key('test'), 'billing.stripe.webhook_secret' => 'whsec_x', 'billing.stripe.price_ids' => []]);
    }

    private function createCheckout(): void
    {
        (new StripePaymentProvider((array) config('billing.stripe')))->createCheckout(User::factory()->create(), Plan::where('key', 'plus')->first(), 'https://a/s', 'https://a/c');
    }

    public function test_key_modes_are_classified_and_malformed_keys_rejected(): void
    {
        $this->assertSame('test', StripeKey::mode($this->key('test')));
        $this->assertSame('live', StripeKey::mode($this->key('live')));
        $this->assertSame('live', StripeKey::mode($this->key('live', 'rk')));
        foreach ([null, '', 'sk_test_', 'pk_test_'.str_repeat('a', 20), 'sk_prod_'.str_repeat('a', 20), 'whsec_'.str_repeat('a', 20), ' '.$this->key('test'), 'sk_test_bad key'] as $bad) {
            $this->assertNull(StripeKey::mode($bad), (string) $bad);
        }
    }

    public function test_a_live_key_is_refused_outside_production_and_nothing_is_sent(): void
    {
        config(['billing.stripe.secret_key' => $this->key('live')]);
        Http::fake();
        $this->assertFalse(app()->isProduction());

        $this->expectException(ApiException::class);
        try {
            $this->createCheckout();
        } finally {
            Http::assertNothingSent();
        }
    }

    public function test_a_live_key_is_accepted_in_production(): void
    {
        config(['billing.stripe.secret_key' => $this->key('live')]);
        $this->app['env'] = 'production';
        Http::fake(['api.stripe.com/*' => Http::response(['id' => 'cs_1', 'url' => 'https://checkout.stripe.com/x'])]);

        $this->createCheckout();

        Http::assertSent(fn (Request $r) => $r->hasHeader('Authorization', 'Bearer '.$this->key('live')));
    }

    public function test_a_malformed_key_is_refused_without_calling_stripe(): void
    {
        config(['billing.stripe.secret_key' => 'not-a-stripe-key']);
        Http::fake();
        try {
            $this->createCheckout();
            $this->fail('expected refusal');
        } catch (ApiException $e) {
            $this->assertSame(503, $e->status);
        }
        Http::assertNothingSent();
    }

    public function test_the_refusal_message_names_the_problem_for_operators_but_never_contains_the_key(): void
    {
        config(['billing.stripe.secret_key' => $this->key('live')]);
        $reported = [];
        $this->app->make(ExceptionHandler::class)->reportable(function (\Throwable $e) use (&$reported) {
            $reported[] = $e->getMessage();
        })->stop();
        try {
            $this->createCheckout();
        } catch (ApiException) {
        }
        $this->assertNotEmpty($reported);
        $this->assertStringContainsStringIgnoringCase('live', $reported[0]);
        $this->assertStringNotContainsString($this->key('live'), $reported[0]);
    }

    // ---- preflight ---------------------------------------------------------------------------

    private function codes(bool $production, string $level = 'error'): array
    {
        return collect((new Preflight)->findings($production, 'mysql'))->where('level', $level)->pluck('code')->all();
    }

    public function test_preflight_flags_a_live_key_outside_production_as_an_error_even_in_a_non_production_run(): void
    {
        config(['billing.stripe.secret_key' => $this->key('live')]);
        $this->assertContains('stripe_live_key_outside_production', $this->codes(false));
        $this->assertContains('stripe_live_key_outside_production', $this->codes(true));
    }

    public function test_preflight_flags_a_malformed_key(): void
    {
        config(['billing.stripe.secret_key' => 'nope']);
        $this->assertContains('stripe_key_malformed', $this->codes(true));
    }

    public function test_preflight_requires_real_billing_in_production_only_when_paid_plans_are_active(): void
    {
        $this->app['env'] = 'production';
        config(['billing.provider' => 'none']);
        Plan::whereIn('key', ['plus', 'pro'])->update(['active' => true]);
        $this->assertContains('billing_required_for_active_paid_plans', $this->codes(true));

        Plan::whereIn('key', ['plus', 'pro'])->update(['active' => false]);
        $this->assertNotContains('billing_required_for_active_paid_plans', $this->codes(true));
        $this->assertContains('billing_none', $this->codes(true, 'warning'));
    }

    public function test_preflight_wants_a_live_key_and_webhook_secret_in_production_with_paid_plans(): void
    {
        $this->app['env'] = 'production';
        Plan::whereIn('key', ['plus', 'pro'])->update(['active' => true]);

        $this->assertContains('stripe_test_key_in_production', $this->codes(true)); // setUp key is a test key

        config(['billing.stripe.secret_key' => $this->key('live'), 'billing.stripe.webhook_secret' => null]);
        $this->assertContains('stripe_credentials_missing', $this->codes(true));
        $this->assertNotContains('stripe_test_key_in_production', $this->codes(true));

        config(['billing.stripe.webhook_secret' => 'whsec_x']);
        $this->assertNotContains('stripe_credentials_missing', $this->codes(true));
        $this->assertNotContains('stripe_live_key_outside_production', $this->codes(true));
    }

    public function test_preflight_only_warns_about_a_test_key_in_production_when_no_paid_plan_is_active(): void
    {
        $this->app['env'] = 'production';
        Plan::whereIn('key', ['plus', 'pro'])->update(['active' => false]);
        $this->assertNotContains('stripe_test_key_in_production', $this->codes(true));
        $this->assertContains('stripe_test_key_in_production', $this->codes(true, 'warning'));
    }

    // ---- expa:billing:check -------------------------------------------------------------------

    private function balance(bool $live = false, int $status = 200)
    {
        Http::swap(new Factory);
        Http::fake(['api.stripe.com/v1/balance' => Http::response($status === 200 ? ['object' => 'balance', 'livemode' => $live] : ['error' => ['message' => 'Invalid API Key provided: sk_test_***']], $status)]);
    }

    public function test_check_passes_with_a_working_test_key_makes_exactly_one_read_only_get_and_never_prints_secrets(): void
    {
        Plan::whereIn('key', ['plus', 'pro'])->update(['active' => true]);
        $this->balance();

        $this->artisan('expa:billing:check')
            ->expectsOutputToContain('provider: stripe')
            ->expectsOutputToContain('key mode: test')
            ->expectsOutputToContain('webhook secret: configured')
            ->expectsOutputToContain('plan plus')
            ->expectsOutputToContain('plan pro')
            ->doesntExpectOutputToContain($this->key('test'))
            ->doesntExpectOutputToContain('whsec_x')
            ->assertSuccessful();

        Http::assertSentCount(1);
        Http::assertSent(fn (Request $r) => $r->method() === 'GET' && $r->url() === 'https://api.stripe.com/v1/balance' && ! str_contains($r->url(), 'checkout'));
    }

    public function test_check_fails_with_an_actionable_message_when_stripe_rejects_the_key(): void
    {
        $this->balance(status: 401);

        $this->artisan('expa:billing:check')->expectsOutputToContain('STRIPE_SECRET_KEY')->assertFailed();
    }

    public function test_check_fails_when_provider_is_not_stripe_or_the_webhook_secret_is_missing_or_key_mode_mismatches(): void
    {
        config(['billing.provider' => 'none']);
        $this->artisan('expa:billing:check')->expectsOutputToContain('BILLING_PROVIDER=stripe')->assertFailed();

        config(['billing.provider' => 'stripe', 'billing.stripe.webhook_secret' => null]);
        $this->balance();
        $this->artisan('expa:billing:check')->expectsOutputToContain('STRIPE_WEBHOOK_SECRET')->assertFailed();

        config(['billing.stripe.webhook_secret' => 'whsec_x']);
        $this->balance(live: true); // a test-mode key must never see livemode=true
        $this->artisan('expa:billing:check')->expectsOutputToContain('livemode')->assertFailed();
    }

    public function test_check_refuses_a_live_key_outside_production_without_calling_stripe(): void
    {
        config(['billing.stripe.secret_key' => $this->key('live')]);
        Http::fake();

        $this->artisan('expa:billing:check')->expectsOutputToContain('production')->assertFailed();
        Http::assertNothingSent();
    }

    public function test_check_reports_active_paid_plans_that_cannot_create_a_checkout(): void
    {
        Plan::where('key', 'plus')->update(['active' => true, 'interval' => 'week']);
        config(['billing.stripe.price_ids' => ['pro' => 'bogus']]);
        Plan::where('key', 'pro')->update(['active' => true]);
        $this->balance();

        $this->artisan('expa:billing:check')->expectsOutputToContain('plan plus: NOT ready')->expectsOutputToContain('plan pro: NOT ready')->assertFailed();
    }

    public function test_the_command_is_bound_to_the_stripe_provider_instance(): void
    {
        $this->app->forgetInstance(PaymentProvider::class);
        $this->assertInstanceOf(StripePaymentProvider::class, app(PaymentProvider::class));
    }
}
