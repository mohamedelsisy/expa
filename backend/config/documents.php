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

    // Scanner implementing App\Domains\Documents\Contracts\ContentScanner. `basic` = built-in heuristics only.
    // In production bind a real antivirus (ClamAV) — see docs/SECURITY.md.
    'scanner' => env('DOCUMENTS_SCANNER', 'basic'),

    // Default reminder offsets (days before expiry) when a document has no custom schedule.
    'default_reminder_offsets' => [90, 60, 30, 14, 7],
    'expiring_soon_days' => 90,
];
