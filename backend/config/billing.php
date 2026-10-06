<?php

return [
    // none = checkout unavailable (503). fake = deterministic provider for local/tests. stripe = StripePaymentProvider
    // (code complete and Http::fake-tested; live-untested until credentials exist, T-038). Other processors implement
    // App\Domains\Billing\Contracts\PaymentProvider and are bound in AppServiceProvider.
    'provider' => env('BILLING_PROVIDER', 'none'),
    'fake_webhook_secret' => env('BILLING_FAKE_WEBHOOK_SECRET', 'local-only-secret'),

    'currency' => 'EUR',
    // BE-33: paid plans are seeded INACTIVE unless this is true (placeholder prices must not be listed publicly by accident).
    'seed_paid_plans_active' => (bool) env('BILLING_SEED_PLANS_ACTIVE', ! in_array(env('APP_ENV'), ['production', 'staging'], true)),

    /*
     | Failed-payment policy (DunningService). Numbers are product decisions, not facts: edit via env.
     | grace_days: access kept after a failed renewal; reminder_days: days after the failure when a reminder is sent.
     */
    'dunning' => [
        'grace_days' => (int) env('BILLING_GRACE_DAYS', 7),
        'reminder_days' => array_values(array_filter(array_map('intval', explode(',', (string) env('BILLING_DUNNING_REMINDER_DAYS', '3,6'))))),
    ],

    /*
     | VAT. NO rate is hard-coded anywhere. Set `plans.vat_rate` per plan, or add VERIFIED rows to `tax_rates` and set the
     | invoice country here. Without either, invoices carry no tax lines. Needs an accountant's decision (see docs/EXTERNAL_SERVICES.md).
     */
    'tax' => [
        'country' => env('BILLING_TAX_COUNTRY'),
    ],

    /*
     | Stripe (BILLING_PROVIDER=stripe). NOT enabled by default; credentials come from env / the secret manager only.
     | price_ids is optional: when a plan has no Stripe price id the checkout session is built from the plan's own price.
     */
    'stripe' => [
        'secret_key' => env('STRIPE_SECRET_KEY'),
        'webhook_secret' => env('STRIPE_WEBHOOK_SECRET'), // comma separated to allow secret rotation
        'api_base' => env('STRIPE_API_BASE', 'https://api.stripe.com'),
        'api_version' => env('STRIPE_API_VERSION'),
        'tolerance' => (int) env('STRIPE_WEBHOOK_TOLERANCE', 300),
        'timeout' => (int) env('STRIPE_TIMEOUT', 15),
        'price_ids' => array_filter(['plus' => env('STRIPE_PRICE_PLUS'), 'pro' => env('STRIPE_PRICE_PRO')]),
    ],

    /*
     | Default plan catalogue used by PlanSeeder. PRICES ARE PLACEHOLDERS (spec): after seeding, edit them in the
     | `plans` table / admin; nothing in code reads these numbers at runtime.
     */
    'plans' => [
        'free' => ['interval' => 'none', 'price_minor' => 0, 'sort' => 1, 'features' => ['ai_daily_limit' => 10, 'reminders_advanced' => false, 'document_ai' => false, 'human_credits' => 0]],
        'plus' => ['interval' => 'month', 'price_minor' => 599, 'sort' => 2, 'features' => ['ai_daily_limit' => 100, 'reminders_advanced' => true, 'document_ai' => false, 'human_credits' => 0]],
        'pro' => ['interval' => 'month', 'price_minor' => 1499, 'sort' => 3, 'features' => ['ai_daily_limit' => 300, 'reminders_advanced' => true, 'document_ai' => true, 'human_credits' => 2]],
    ],

    'invoice_prefix' => 'EXPA',
];
