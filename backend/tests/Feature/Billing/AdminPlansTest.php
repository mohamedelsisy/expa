<?php

namespace Tests\Feature\Billing;

use App\Domains\Access\Services\AccessSynchronizer;
use App\Domains\Audit\Models\AuditLog;
use App\Domains\Billing\Contracts\PaymentProvider;
use App\Domains\Billing\Models\Plan;
use App\Domains\Billing\Models\Subscription;
use App\Models\User;
use Database\Seeders\PlanSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Client\Request;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class AdminPlansTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(PlanSeeder::class);
        app(AccessSynchronizer::class)->sync();
    }

    private function as(string $role): User
    {
        $u = User::factory()->create();
        $u->syncRoleKeys([$role]);
        $this->actingAs($u, 'sanctum');

        return $u;
    }

    public function test_permission_matrix(): void
    {
        $this->assertContains('plans.view', config('permissions.permissions'));
        $this->assertContains('plans.manage', config('permissions.permissions'));

        $expect = [ // role => [view status, patch status]
            'super_admin' => [200, 200], 'admin' => [200, 200], 'support_agent' => [200, 403],
            'content_manager' => [403, 403], 'editor' => [403, 403], 'translator' => [403, 403], 'provider' => [403, 403], 'user' => [403, 403],
        ];
        foreach ($expect as $role => [$view, $patch]) {
            $this->as($role);
            $this->getJson('/api/v1/admin/billing/plans')->assertStatus($view);
            $this->getJson('/api/v1/admin/billing/plans/plus')->assertStatus($view);
            $this->patchJson('/api/v1/admin/billing/plans/plus', ['price_minor' => $patch === 200 ? 599 : 123])->assertStatus($patch);
        }
        $this->app['auth']->forgetGuards();
        $this->getJson('/api/v1/admin/billing/plans')->assertUnauthorized();
        $this->assertSame(599, Plan::where('key', 'plus')->value('price_minor')); // no forbidden role changed anything
    }

    public function test_list_and_show_expose_everything_an_operator_needs(): void
    {
        $this->as('admin');
        $sub = new Subscription(['plan_id' => Plan::where('key', 'plus')->value('id'), 'status' => 'active', 'provider' => 'stripe', 'provider_ref' => 'sub_1']);
        $sub->user_id = User::factory()->create()->id;
        $sub->save();
        config(['billing.stripe.price_ids' => ['plus' => 'price_123']]);

        $res = $this->getJson('/api/v1/admin/billing/plans')->assertOk();
        $this->assertSame(['free', 'plus', 'pro'], collect($res->json('data'))->pluck('key')->all());
        $res->assertJsonPath('meta.billing_available', false);
        $plus = collect($res->json('data'))->firstWhere('key', 'plus');
        $this->assertSame(['amount_minor' => 599, 'currency' => 'EUR', 'interval' => 'month'], $plus['price']);
        $this->assertSame(1, $plus['active_subscriptions']);
        $this->assertTrue($plus['stripe_price_id_configured']);
        $this->assertArrayHasKey('features', $plus);
        $this->assertArrayHasKey('translations', $plus);
        $this->getJson('/api/v1/admin/billing/plans/nope')->assertNotFound();
    }

    public function test_patch_updates_price_active_features_and_translations_and_audits_old_to_new(): void
    {
        $admin = $this->as('admin');
        Plan::where('key', 'plus')->update(['active' => false]);
        $before = Plan::where('key', 'plus')->first();

        $this->patchJson('/api/v1/admin/billing/plans/plus', [
            'active' => true, 'price_minor' => 799, 'interval' => 'year', 'features' => ['ai_daily_limit' => 150],
            'translations' => ['en' => ['name' => 'Plus+', 'description' => 'More']],
        ])->assertOk()->assertJsonPath('data.price.amount_minor', 799)->assertJsonPath('data.active', true);

        $plan = Plan::where('key', 'plus')->first();
        $this->assertSame(799, $plan->price_minor);
        $this->assertSame('year', $plan->interval);
        $this->assertSame(150, $plan->feature('ai_daily_limit'));
        $this->assertSame($before->feature('document_ai'), $plan->feature('document_ai')); // merged, not replaced
        $this->assertSame('Plus+', $plan->setRelation('translations', $plan->translations()->get())->localized('name', 'en'));

        $log = AuditLog::where('action', 'admin.plan.updated')->latest('id')->first();
        $this->assertSame($admin->id, $log->actor_id);
        $this->assertSame($plan->id, (int) $log->subject_id);
        $this->assertSame(['old' => 599, 'new' => 799], $log->changes['price_minor']);
        $this->assertSame(['old' => 'month', 'new' => 'year'], $log->changes['interval']);
        $this->assertSame(['old' => $before->active, 'new' => true], $log->changes['active']);
    }

    public function test_a_noop_patch_writes_no_audit_row(): void
    {
        $this->as('admin');
        $this->patchJson('/api/v1/admin/billing/plans/plus', ['price_minor' => 599])->assertOk();
        $this->assertSame(0, AuditLog::where('action', 'admin.plan.updated')->count());
    }

    public function test_validation(): void
    {
        $this->as('admin');
        $bad = [
            ['price_minor' => -1], ['price_minor' => 'abc'], ['price_minor' => 1.5], ['price_minor' => 100001], ['currency' => 'USD'], ['currency' => 'eu'],
            ['interval' => 'week'], ['interval' => 'none'], ['active' => 'maybe'], ['features' => ['ai_daily_limit' => -3]], ['features' => ['evil' => true]],
            ['features' => ['human_credits' => 'x']], ['translations' => ['fr' => ['name' => 'x']]], ['translations' => ['en' => ['name' => '']]],
            ['translations' => ['en' => ['name' => str_repeat('a', 81)]]], ['key' => 'hacked'], [],
        ];
        foreach ($bad as $payload) {
            $this->patchJson('/api/v1/admin/billing/plans/plus', $payload)->assertStatus(422);
        }
        $this->assertSame(599, Plan::where('key', 'plus')->value('price_minor'));
        $this->assertSame('plus', Plan::whereKey(Plan::where('key', 'plus')->value('id'))->value('key'));
    }

    public function test_free_plan_stays_free_active_and_intervalless(): void
    {
        $this->as('admin');
        $this->patchJson('/api/v1/admin/billing/plans/free', ['active' => false])->assertStatus(422);
        $this->patchJson('/api/v1/admin/billing/plans/free', ['price_minor' => 100])->assertStatus(422);
        $this->patchJson('/api/v1/admin/billing/plans/free', ['interval' => 'month'])->assertStatus(422);
        $this->patchJson('/api/v1/admin/billing/plans/free', ['features' => ['ai_daily_limit' => 15]])->assertOk();
        $this->assertSame(15, Plan::where('key', 'free')->first()->feature('ai_daily_limit'));
    }

    public function test_a_paid_plan_cannot_be_active_at_price_zero(): void
    {
        $this->as('admin');
        $this->patchJson('/api/v1/admin/billing/plans/pro', ['active' => true, 'price_minor' => 0])->assertStatus(422);
        Plan::where('key', 'pro')->update(['active' => true]);
        $this->patchJson('/api/v1/admin/billing/plans/pro', ['price_minor' => 0])->assertStatus(422);
        $this->assertSame(1499, Plan::where('key', 'pro')->value('price_minor'));
    }

    public function test_public_listing_reflects_changes_and_billing_available_follows_the_provider_only(): void
    {
        $this->as('admin');
        Plan::whereIn('key', ['plus', 'pro'])->update(['active' => false]);
        config(['billing.provider' => 'none']);
        $keys = fn () => collect($this->getJson('/api/v1/billing/plans')->json('data'))->pluck('key')->all();
        $this->assertSame(['free'], $keys());

        $this->patchJson('/api/v1/admin/billing/plans/plus', ['active' => true, 'price_minor' => 650])->assertOk(); // allowed while unconfigured
        $res = $this->getJson('/api/v1/billing/plans')->assertOk()->assertJsonPath('meta.billing_available', false);
        $this->assertSame(650, collect($res->json('data'))->firstWhere('key', 'plus')['price']['amount_minor']);

        config(['billing.provider' => 'stripe']);
        $this->getJson('/api/v1/billing/plans')->assertJsonPath('meta.billing_available', true);
        $this->patchJson('/api/v1/admin/billing/plans/plus', ['active' => false])->assertOk();
        $this->assertSame(['free'], $keys());
    }

    public function test_checkout_uses_the_new_price_and_existing_subscriptions_keep_theirs(): void
    {
        config(['billing.provider' => 'stripe', 'billing.stripe.secret_key' => 'sk_test_abcdefgh12345', 'billing.stripe.webhook_secret' => 'whsec_x', 'billing.stripe.price_ids' => []]);
        $this->app->forgetInstance(PaymentProvider::class);
        Http::fake(['api.stripe.com/v1/checkout/sessions' => Http::response(['id' => 'cs_1', 'url' => 'https://checkout.stripe.com/x'])]);

        $subscriber = User::factory()->create();
        $sub = new Subscription(['plan_id' => Plan::where('key', 'plus')->value('id'), 'status' => 'active', 'provider' => 'stripe', 'provider_ref' => 'sub_old', 'current_period_end' => now()->addMonth()]);
        $sub->user_id = $subscriber->id;
        $sub->save();
        $sub->items()->create(['slot' => 'base', 'kind' => 'base', 'plan_id' => $sub->plan_id, 'quantity' => 1, 'unit_price_minor' => 599]);

        $this->as('admin');
        $this->patchJson('/api/v1/admin/billing/plans/pro', ['price_minor' => 1999])->assertOk();

        $buyer = User::factory()->create();
        $this->actingAs($buyer, 'sanctum');
        $this->postJson('/api/v1/billing/checkout', ['plan' => 'pro'])->assertOk();

        Http::assertSent(function (Request $r) {
            parse_str($r->body(), $b);

            return $b['line_items'][0]['price_data']['unit_amount'] === '1999';
        });
        $this->assertSame(599, $sub->items()->first()->unit_price_minor); // grandfathered: new checkouts only
    }

    public function test_responses_warn_when_a_configured_stripe_price_id_overrides_the_admin_price(): void
    {
        config(['billing.stripe.price_ids' => ['plus' => 'price_123']]);
        $this->as('admin');
        $this->patchJson('/api/v1/admin/billing/plans/plus', ['price_minor' => 700])->assertOk()->assertJsonPath('meta.warnings.0', 'stripe_price_id_overrides_price');
        $this->patchJson('/api/v1/admin/billing/plans/plus', ['active' => true])->assertOk()->assertJsonMissingPath('meta.warnings');
    }
}
