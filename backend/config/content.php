<?php

use App\Domains\Guides\Models\Guide;

return [
    // Translations required before an item may be published. Arabic-first: the primary experience must exist.
    'required_locales_to_publish' => ['ar'],

    // When the requested language is missing, try these in order (explicit, per locale).
    'fallbacks' => [
        'ar' => ['en', 'it'],
        'en' => ['ar', 'it'],
        'it' => ['en', 'ar'],
    ],

    // Days since last_verified_at before a source is flagged.
    'freshness' => ['stale_after_days' => 180, 'outdated_after_days' => 365],

    /*
     | Domains accepted for source_type=official. An official-looking URL on any other domain is rejected,
     | which blocks typos and look-alike (phishing) domains. Extend deliberately, in code review.
     | Entries match the host itself or any subdomain of it.
     */
    'official_domains' => [
        'gov.it', 'governo.it', 'poliziadistato.it', 'inps.it', 'inail.it', 'istat.it',
        'agenziaentrate.gov.it', 'interno.gov.it', 'esteri.gov.it', 'salute.gov.it', 'lavoro.gov.it',
        'mim.gov.it', 'mur.gov.it', 'cittadinanza.dlci.interno.it', 'spid.gov.it', 'cie.interno.gov.it',
        'anpr.interno.it', 'portaleimmigrazione.it', 'poste.it', 'italia.it', 'europa.eu',
        'comune.roma.it', 'comune.milano.it', 'comune.napoli.it', 'comune.torino.it', 'comune.bologna.it',
        'comune.firenze.it',
    ],

    // Authors cannot approve their own content (super_admin is exempt). Disable only for single-person teams.
    'four_eyes' => env('CONTENT_FOUR_EYES', true),

    // Institutional hosting patterns for municipalities / regions / provinces (comune.<city>.it, regione.<x>.it, …).
    // Anything else (ASL, universities, …) must be tagged `institutional`, which is not host-restricted.
    'official_domain_patterns' => [
        '/(^|\.)(comune|regione|provincia|cittametropolitana)\.[a-z0-9-]+(\.[a-z0-9-]+)*\.it$/',
        '/(^|\.)[a-z0-9-]+\.gov\.it$/',
    ],

    // Content models handled by `expa:publish-scheduled` (registered as modules are built).
    'models' => [
        Guide::class,
    ],
];
