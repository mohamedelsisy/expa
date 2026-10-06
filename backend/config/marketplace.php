<?php

return [
    // false = only providers with a current EXPA verification are listed. true = unverified providers are also listed,
    // always with an explicit "not verified" label (the default while the verification team is being staffed).
    'list_unverified' => (bool) env('MARKETPLACE_LIST_UNVERIFIED', true),
    // A verification is valid for this long; afterwards the provider is shown as unverified until re-verified.
    'verification_valid_days' => (int) env('MARKETPLACE_VERIFICATION_DAYS', 365),

    'reviews' => [
        'min_account_age_hours' => (int) env('MARKETPLACE_REVIEW_MIN_ACCOUNT_HOURS', 24),
        'body_max' => 2000,
        'reply_max' => 1000,
    ],
    'leads' => [
        'message_min' => 10,
        'message_max' => 1500,
        'per_user_provider_cooldown_hours' => 24,
        'max_open_per_user' => 10,
        'retention_days' => (int) env('MARKETPLACE_LEAD_RETENTION_DAYS', 365),
        // Bump when the wording the user agrees to changes; stored with every lead.
        'consent_version' => 'v1',
    ],
    'evidence' => [
        'max_kb' => 5 * 1024,
        'max_files' => 5,
        'allowed_mimes' => ['application/pdf' => 'pdf', 'image/jpeg' => 'jpg', 'image/png' => 'png'],
    ],
    'languages_max' => 8,
    'services_max' => 15,
    'areas_max' => 30,
];
