<?php

namespace App\Console\Commands;

use App\Domains\Billing\Models\Plan;
use App\Domains\Billing\Services\StripeKey;
use App\Domains\Billing\Services\StripePaymentProvider;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;

/**
 * Read-only verification of the Stripe set-up. Prints the key MODE, never the key or the webhook secret; creates no Checkout
 * session and no object at Stripe: exactly one GET /v1/balance proves the key works (https://docs.stripe.com/api/balance/balance_retrieve).
 */
class BillingCheck extends Command
{
    protected $signature = 'expa:billing:check';

    protected $description = 'Verify the Stripe configuration (read-only: one GET /v1/balance, no session, no secrets printed)';

    public function handle(): int
    {
        $problems = [];
        $provider = (string) config('billing.provider');
        $this->line("provider: $provider");
        if ($provider !== 'stripe') {
            $this->error('Set BILLING_PROVIDER=stripe (see docs/STRIPE_SETUP.md); nothing else can be verified.');

            return self::FAILURE;
        }

        $cfg = (array) config('billing.stripe');
        $key = (string) ($cfg['secret_key'] ?? '');
        $mode = StripeKey::mode($key);
        $this->line('key mode: '.($mode ?? 'MISSING/MALFORMED'));
        if ($refusal = StripeKey::refusal($key)) {
            $problems[] = $refusal.' Fix STRIPE_SECRET_KEY.';
        }

        $secrets = array_filter(array_map('trim', explode(',', (string) ($cfg['webhook_secret'] ?? ''))));
        $this->line('webhook secret: '.($secrets ? 'configured ('.count($secrets).')' : 'NOT configured'));
        if (! $secrets) {
            $problems[] = 'STRIPE_WEBHOOK_SECRET is not set: every webhook would be rejected and no subscription could activate (copy the signing secret of the endpoint, whsec_…).';
        }

        $adapter = new StripePaymentProvider($cfg);
        $paid = Plan::where('active', true)->where('price_minor', '>', 0)->orderBy('sort_order')->get();
        if ($paid->isEmpty()) {
            $this->line('active paid plans: none (activate with PATCH /api/v1/admin/billing/plans/{key})');
        }
        foreach ($paid as $plan) {
            $bad = $adapter->readinessProblem($plan);
            $this->line("plan {$plan->key}: ".($bad ? "NOT ready ($bad)" : sprintf('ready (%d %s / %s, %s)', $plan->price_minor, $plan->currency, $plan->interval, ! empty($cfg['price_ids'][$plan->key]) ? 'Stripe price id' : 'inline price_data')));
            if ($bad) {
                $problems[] = "Plan {$plan->key} cannot create a Checkout: $bad.";
            }
        }

        // One read-only call, only with a usable key (a refused live key must not be sent anywhere).
        if ($mode !== null && ! StripeKey::refusal($key)) {
            $problems = array_merge($problems, $this->probe($cfg, $key, $mode));
        }

        foreach ($problems as $p) {
            $this->error($p);
        }
        $this->{$problems ? 'error' : 'info'}($problems ? 'Billing check FAILED ('.count($problems).').' : 'Billing check passed (Stripe reachable, key valid).');

        return $problems ? self::FAILURE : self::SUCCESS;
    }

    /** @return list<string> */
    private function probe(array $cfg, string $key, string $mode): array
    {
        try {
            $req = Http::withToken($key)->acceptJson()->timeout((int) ($cfg['timeout'] ?? 15));
            if (! empty($cfg['api_version'])) {
                $req = $req->withHeaders(['Stripe-Version' => $cfg['api_version']]);
            }
            $res = $req->get(rtrim((string) ($cfg['api_base'] ?? 'https://api.stripe.com'), '/').'/v1/balance');
        } catch (\Throwable) {
            return ['Stripe API is unreachable from this server (network/DNS/firewall). Retry; check outbound HTTPS to api.stripe.com.'];
        }
        // Stripe's error body is never echoed (it can quote part of the key).
        if ($res->status() === 401) {
            return ['Stripe rejected STRIPE_SECRET_KEY (HTTP 401): wrong, revoked or expired key. Copy a fresh key from the Dashboard (API keys).'];
        }
        if ($res->status() === 403) {
            return ['The key is valid but lacks permission to read the balance (HTTP 403). Use a secret key, or grant the restricted key read access to Balance.'];
        }
        if (! $res->successful()) {
            return ['Stripe answered HTTP '.$res->status().' to the balance check; try again later.'];
        }
        if (($res->json('livemode') === true) !== ($mode === 'live')) {
            return ['Key mode and Stripe livemode disagree (key says '.$mode.', Stripe says livemode='.var_export((bool) $res->json('livemode'), true).'): wrong key pasted.'];
        }

        return [];
    }
}
