<?php

return [
    // Arabic-first. Order = fallback priority.
    'locales' => [
        'ar' => ['name' => 'العربية', 'dir' => 'rtl'],
        'en' => ['name' => 'English', 'dir' => 'ltr'],
        'it' => ['name' => 'Italiano', 'dir' => 'ltr'],
    ],
    'default_locale' => 'ar',
    // Informational copy of TRUSTED_PROXIES (read directly in bootstrap/app.php) so `expa:preflight` can check it.
    'trusted_proxies' => env('TRUSTED_PROXIES'),
    'frontend_url' => env('FRONTEND_URL', 'http://localhost:3000'),
];
