<?php

return [
    // none = checkout unavailable (503). fake = deterministic provider for local/tests. A real adapter (Stripe, …)
    // implements App\Domains\Billing\Contracts\PaymentProvider and is bound in AppServiceProvider (T-038, needs credentials).
    'provider' => env('BILLING_PROVIDER', 'none'),
    'fake_webhook_secret' => env('BILLING_FAKE_WEBHOOK_SECRET', 'local-only-secret'),

    'currency' => 'EUR',

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
