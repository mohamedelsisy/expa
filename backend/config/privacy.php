<?php

return [
    // Bump when the privacy policy / terms change materially; users are then flagged for re-consent.
    // NOTE: policy texts are pending legal review (see docs/GDPR.md).
    'policy_version' => env('PRIVACY_POLICY_VERSION', '2026-10-draft'),

    // Retention periods (see docs/GDPR.md).
    'retention' => [
        'audit_logs_months' => 24,
        'notifications_months' => 6,
        'job_import_runs_days' => 90,
    ],

    // BE-17: true = GET /profile/export is disabled and POST /profile/export (password in the body) is the only way.
    // Default false until web and mobile call the POST form.
    'export_requires_password' => (bool) env('EXPORT_REQUIRE_PASSWORD', false),
];
