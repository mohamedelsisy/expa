<?php

/*
| The API is consumed by the EXPA web app (and mobile, which is not subject to CORS).
| Origins are an explicit allow-list from env, never `*`.
| CORS_ALLOWED_ORIGINS: comma-separated; defaults to FRONTEND_URL.
*/
return [
    'paths' => ['api/*'],
    'allowed_methods' => ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    'allowed_origins' => array_values(array_filter(array_map('trim', explode(',', (string) env('CORS_ALLOWED_ORIGINS', env('FRONTEND_URL', 'http://localhost:3000')))))),
    'allowed_origins_patterns' => [],
    'allowed_headers' => ['Accept', 'Accept-Language', 'Authorization', 'Content-Type', 'X-Client', 'X-Requested-With'],
    'exposed_headers' => ['Content-Language', 'Content-Disposition', 'Retry-After'],
    'max_age' => 600,
    'supports_credentials' => false, // bearer tokens, not cookies
];
