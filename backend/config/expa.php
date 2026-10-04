<?php

return [
    // Arabic-first. Order = fallback priority.
    'locales' => [
        'ar' => ['name' => 'العربية', 'dir' => 'rtl'],
        'en' => ['name' => 'English', 'dir' => 'ltr'],
        'it' => ['name' => 'Italiano', 'dir' => 'ltr'],
    ],
    'default_locale' => 'ar',
    'frontend_url' => env('FRONTEND_URL', 'http://localhost:3000'),
];
