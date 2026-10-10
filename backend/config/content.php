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
    'required_locales_to_publish' => ['ar'],
    'fallbacks' => [
        'ar' => ['en', 'it'],
        'en' => ['ar', 'it'],
        'it' => ['en', 'ar'],
    ],
    'freshness' => ['stale_after_days' => 180, 'outdated_after_days' => 365],

    /*
     | Hosts accepted for source_type=official. Add an institution only after
     | verifying its ownership and using its actual institutional domain.
     */
    'official_domains' => [
        'gov.it', 'governo.it', 'poliziadistato.it', 'inps.it', 'inail.it', 'istat.it',
        'agenziaentrate.gov.it', 'interno.gov.it', 'esteri.gov.it', 'salute.gov.it', 'lavoro.gov.it',
        'mim.gov.it', 'mur.gov.it', 'cittadinanza.dlci.interno.it', 'spid.gov.it', 'cie.interno.it',
        'anpr.interno.it', 'portaleimmigrazione.it', 'poste.it', 'italia.it', 'europa.eu',
        'universitaly.it', 'studyinitaly.esteri.it', 'comune.roma.it', 'comune.milano.it', 'comune.napoli.it', 'comune.torino.it', 'comune.bologna.it',
        'comune.firenze.it', 'atac.roma.it', 'anagrafenazionale.interno.it',
        'ilportaledellautomobilista.it',
    ],

    'official_domains_extra' => array_values(array_filter(array_map(fn ($d) => strtolower(trim($d)), explode(',', (string) env('OFFICIAL_DOMAINS_EXTRA', ''))))),
    'official_domain_patterns_enabled' => (bool) env('OFFICIAL_DOMAIN_PATTERNS_ENABLED', true),
    'four_eyes' => env('CONTENT_FOUR_EYES', true),
    'official_domain_patterns' => [
        '/(^|\\.)(comune|regione|provincia|cittametropolitana)\\.[a-z0-9-]+(\\.[a-z0-9-]+)*\\.it$/',
        '/(^|\\.)[a-z0-9-]+\\.gov\\.it$/',
    ],

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
