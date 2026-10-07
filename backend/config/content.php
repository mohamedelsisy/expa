<?php

use App\Domains\Appointments\Models\AppointmentGuide;
use App\Domains\Articles\Models\Article;
use App\Domains\Geo\Models\CityProfile;
use App\Domains\Government\Models\GovernmentOffice;
use App\Domains\Government\Models\GovernmentService;
use App\Domains\Guides\Models\Guide;
use App\Domains\Housing\Models\HousingRule;
use App\Domains\Learning\Models\ItalianExercise;
use App\Domains\Learning\Models\ItalianLesson;
use App\Domains\Learning\Models\ItalianVocabulary;
use App\Domains\Legal\Models\LegalDocument;
use App\Domains\Marketplace\Models\ServiceProvider;
use App\Domains\Money\Models\TaxTable;
use App\Domains\Patente\Models\PatenteCategory;
use App\Domains\Patente\Models\PatenteQuestion;
use App\Domains\Patente\Models\PatenteTopic;
use App\Domains\Study\Models\Scholarship;
use App\Domains\Study\Models\StudyProgram;
use App\Domains\Study\Models\University;
use App\Domains\Travel\Models\TravelRequirement;

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
        'universitaly.it', 'studyinitaly.esteri.it', 'comune.roma.it', 'comune.milano.it', 'comune.napoli.it', 'comune.torino.it', 'comune.bologna.it',
        'comune.firenze.it',
    ],

    // Additional EXACT official domains added by operations without a code release (comma separated, e.g. a comune or ASL
    // site that was verified against the institution's own published contact page). Reviewed like any config change.
    // Nothing is pre-filled here: no domain is assumed official until a person verified it.
    'official_domains_extra' => array_values(array_filter(array_map(fn ($d) => strtolower(trim($d)), explode(',', (string) env('OFFICIAL_DOMAINS_EXTRA', ''))))),

    // BE-20: the patterns below accept ANY registrable name that merely starts with comune./regione. (e.g. comune.anything.it),
    // so they are a convenience, not a trust anchor. Set false to accept only the allow-lists above (stricter, recommended
    // once the extra list covers the municipalities you actually cite). Four-eyes approval still applies either way.
    'official_domain_patterns_enabled' => (bool) env('OFFICIAL_DOMAIN_PATTERNS_ENABLED', true),

    // Authors cannot approve their own content (super_admin is exempt). Disable only for single-person teams.
    'four_eyes' => env('CONTENT_FOUR_EYES', true),

    // Institutional hosting patterns for municipalities / regions / provinces (comune.<city>.it, regione.<x>.it, …).
    // Anything else (ASL, universities, …) must be tagged `institutional`, which is not host-restricted.
    'official_domain_patterns' => [
        '/(^|\.)(comune|regione|provincia|cittametropolitana)\.[a-z0-9-]+(\.[a-z0-9-]+)*\.it$/',
        '/(^|\.)[a-z0-9-]+\.gov\.it$/',
    ],

    // Content models handled by `expa:publish-scheduled` (registered as modules are built).
    // EVERY model using HasContentLifecycle must be listed (a test enforces it).
    'models' => [
        Guide::class,
        GovernmentService::class,
        GovernmentOffice::class,
        AppointmentGuide::class,
        ItalianLesson::class,
        PatenteCategory::class,
        PatenteTopic::class,
        PatenteQuestion::class,
        University::class,
        StudyProgram::class,
        Scholarship::class,
        Article::class,
        CityProfile::class,
        ServiceProvider::class,
        LegalDocument::class,
        HousingRule::class,
        TravelRequirement::class,
        TaxTable::class,
        ItalianVocabulary::class,
        ItalianExercise::class,
    ],
];
