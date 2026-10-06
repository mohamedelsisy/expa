<?php

return [
    // Document identifiers served by GET /api/v1/legal/{slug}. The TEXT is never shipped with the code: it is written
    // by the operator, approved by legal counsel and published through the admin workflow (docs/CONTENT_VERIFICATION.md).
    'slugs' => ['privacy', 'terms', 'cookies'],

    // The document whose published version is recorded in consents.policy_version.
    'consent_document' => 'privacy',

    'max_body_chars' => 200000,
];
