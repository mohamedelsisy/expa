<?php

return [
    // log = LogPushSender (records a count only, delivers nothing). fcm = FcmPushSender (Firebase Cloud Messaging HTTP v1).
    // `expa:preflight` warns in production while this is `log`. Needs a Firebase project: docs/EXTERNAL_SERVICES.md.
    'push_driver' => env('PUSH_DRIVER', 'log'),

    'fcm' => [
        // Credentials come ONLY from the environment / secret manager. Prefer the path of the service-account JSON file
        // mounted outside the web root; FCM_CREDENTIALS_JSON (raw JSON or base64 of it) exists for secret stores that
        // inject values. The file must never be committed.
        'credentials_path' => env('FCM_CREDENTIALS_PATH'),
        'credentials_json' => env('FCM_CREDENTIALS_JSON'),
        'project_id' => env('FCM_PROJECT_ID'), // optional: defaults to project_id inside the service account
        'api_base' => env('FCM_API_BASE', 'https://fcm.googleapis.com'),
        'timeout' => (int) env('FCM_TIMEOUT', 10),
        'retry_sleep_ms' => (int) env('FCM_RETRY_SLEEP_MS', 250),
    ],
];
