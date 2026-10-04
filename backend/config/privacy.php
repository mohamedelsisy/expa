<?php

return [
    // Bump when the privacy policy / terms change materially; users are then flagged for re-consent.
    // NOTE: policy texts are pending legal review (see docs/GDPR.md).
    'policy_version' => env('PRIVACY_POLICY_VERSION', '2026-10-draft'),

    // Retention periods (see docs/GDPR.md).
    'retention' => [
        'audit_logs_months' => 24,
    ],
];
