<?php

/*
| "Setup steps" behind the EXPA Score. These are generic life-in-Italy milestones, NOT legal claims about what a
| specific person must do. Text lives in lang/{locale}/setup.php (tasks.<key>.title / .hint).
|
| applies:  always            → shown to everyone
|           segments / goals  → shown when the user's segment is listed OR any goal matches (needs personalization consent)
|           unless_residence  → hidden when the user's residence_type is listed
| priority: lower = suggested earlier.
| guide:    slug of a published guide to link to (omitted from the API when that guide is not published).
| route:    client route for in-app steps.
| auto:     the step counts as done when the user tracks a document of that type (optionally with an expiry date).
*/
return [
    'categories' => [
        // key => weight in the overall score
        'documents' => 1,
        'housing' => 1,
        'italian' => 1,
        'work' => 1,
        'healthcare' => 1,
        'banking' => 1,
        'driving' => 1,
    ],

    'tasks' => [
        'codice_fiscale' => ['category' => 'documents', 'priority' => 10, 'applies' => ['always' => true], 'guide' => 'codice-fiscale', 'auto' => ['document_type' => 'codice_fiscale']],
        'track_residence_permit' => ['category' => 'documents', 'priority' => 5, 'applies' => ['always' => true, 'unless_residence' => ['eu_citizen', 'italian_citizen']], 'route' => 'my-documents', 'auto' => ['document_type' => 'residence_permit', 'requires_expiry' => true]],
        'residenza' => ['category' => 'documents', 'priority' => 30, 'applies' => ['always' => true], 'guide' => 'residenza'],
        'spid' => ['category' => 'documents', 'priority' => 60, 'applies' => ['always' => true], 'guide' => 'spid'],

        'tessera_sanitaria' => ['category' => 'healthcare', 'priority' => 20, 'applies' => ['always' => true], 'guide' => 'tessera-sanitaria', 'auto' => ['document_type' => 'health_card']],
        'medico_di_base' => ['category' => 'healthcare', 'priority' => 40, 'applies' => ['always' => true], 'guide' => 'medico-di-base'],

        'bank_account' => ['category' => 'banking', 'priority' => 25, 'applies' => ['always' => true], 'guide' => 'conto-corrente'],

        'housing_contract' => ['category' => 'housing', 'priority' => 15, 'applies' => ['always' => true], 'guide' => 'contratto-di-locazione'],

        'italian_start' => ['category' => 'italian', 'priority' => 35, 'applies' => ['always' => true], 'route' => 'learn-italian'],
        'italian_a2' => ['category' => 'italian', 'priority' => 70, 'applies' => ['goals' => ['italian'], 'segments' => ['student']], 'route' => 'learn-italian'],

        'job_search' => ['category' => 'work', 'priority' => 45, 'applies' => ['goals' => ['work'], 'segments' => ['newcomer']], 'route' => 'jobs'],
        'partita_iva' => ['category' => 'work', 'priority' => 50, 'applies' => ['goals' => ['business'], 'segments' => ['self_employed']], 'guide' => 'partita-iva'],

        'patente_plan' => ['category' => 'driving', 'priority' => 80, 'applies' => ['goals' => ['driving']], 'guide' => 'patente-b'],
        'patente_theory' => ['category' => 'driving', 'priority' => 85, 'applies' => ['goals' => ['driving']], 'route' => 'patente'],
    ],

    'next_actions_limit' => 5,
];
