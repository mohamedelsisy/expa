<?php

return [
    // Arabic-first. Order = fallback priority.
    'locales' => [
        'ar' => ['name' => 'العربية', 'dir' => 'rtl'],
        'en' => ['name' => 'English', 'dir' => 'ltr'],
        'it' => ['name' => 'Italiano', 'dir' => 'ltr'],
    ],
    'default_locale' => 'ar',
    // Comma separated proxy IPs/CIDRs (or "*" on a private network); applied in AppServiceProvider::boot (BE-1).
    'trusted_proxies' => env('TRUSTED_PROXIES'),
    // Set BEHIND_PROXY=false only when the API is exposed directly to clients (no load balancer / reverse proxy).
    // When true (default) `expa:preflight` fails in production if TRUSTED_PROXIES is empty.
    'behind_proxy' => (bool) env('BEHIND_PROXY', true),
    // Per-user maxima so one account cannot create unbounded rows (BE-31).
    'limits' => [
        'job_saves' => (int) env('EXPA_MAX_JOB_SAVES', 500),
        'devices' => (int) env('EXPA_MAX_DEVICES', 10),
        'documents' => (int) env('EXPA_MAX_DOCUMENTS', 200),
        'tokens' => (int) env('EXPA_MAX_TOKENS', 20),
        'cities_max' => 1000,
    ],
    // Staff sessions are short (BE-16); ordinary users keep SANCTUM_TOKEN_EXPIRATION.
    'staff_token_minutes' => (int) env('EXPA_STAFF_TOKEN_MINUTES', 720),
    'frontend_url' => env('FRONTEND_URL', 'http://localhost:3000'),
];
