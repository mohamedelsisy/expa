<?php

return [
    'max_file_kb' => 10 * 1024,
    'max_files_per_document' => 10,
    'max_total_mb_per_user' => 100,

    // Allowed by *detected content type* (finfo), never by extension or client-supplied MIME.
    'allowed_mimes' => [
        'application/pdf' => 'pdf',
        'image/jpeg' => 'jpg',
        'image/png' => 'png',
        'image/webp' => 'webp',
    ],

    // Encrypt file contents at rest with the app key (AES-256 via Laravel Crypt).
    'encrypt_at_rest' => env('DOCUMENTS_ENCRYPT', true),

    // Scanner implementing App\Domains\Documents\Contracts\ContentScanner.
    //   basic  = built-in heuristics only (NOT an antivirus): local development and tests; `expa:preflight` rejects it in production.
    //   clamav = heuristics + ClamAV through clamd (INSTREAM). Required in production. See docs/EXTERNAL_SERVICES.md.
    'scanner' => env('DOCUMENTS_SCANNER', 'basic'),

    'clamav' => [
        'host' => env('CLAMAV_HOST', '127.0.0.1'),
        'port' => (int) env('CLAMAV_PORT', 3310),
        'socket' => env('CLAMAV_SOCKET'), // e.g. /var/run/clamav/clamd.ctl; wins over host/port when set
        'timeout' => (float) env('CLAMAV_TIMEOUT', 5),
        // true (default): when clamd cannot be reached the upload is REJECTED and admins are alerted. Production requires true.
        'fail_closed' => (bool) env('CLAMAV_FAIL_CLOSED', true),
        'chunk_size' => 65536,
    ],

    // Default reminder offsets (days before expiry) when a document has no custom schedule.
    'default_reminder_offsets' => [90, 60, 30, 14, 7],
    'expiring_soon_days' => 90,
];
