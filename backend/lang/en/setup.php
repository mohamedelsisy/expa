<?php

return [
    'categories' => [
        'documents' => 'Documents',
        'housing' => 'Housing',
        'italian' => 'Italian',
        'work' => 'Work',
        'healthcare' => 'Healthcare',
        'banking' => 'Banking',
        'driving' => 'Driving',
    ],
    'tasks' => [
        'codice_fiscale' => [
            'title' => 'Get your tax code (Codice Fiscale)',
            'hint' => 'Requested in many official procedures and contracts.',
        ],
        'track_residence_permit' => [
            'title' => 'Add your residence permit and its expiry date (Permesso di soggiorno)',
            'hint' => 'So we can remind you well before it expires.',
        ],
        'residenza' => [
            'title' => 'Register your residence at the Comune (Residenza)',
            'hint' => 'Read the guide for the requirements in your city.',
        ],
        'spid' => [
            'title' => 'Activate your digital identity (SPID)',
            'hint' => 'Lets you use many government services online.',
        ],
        'tessera_sanitaria' => [
            'title' => 'Get your health card (Tessera Sanitaria)',
            'hint' => 'Linked to the national health service (SSN).',
        ],
        'medico_di_base' => [
            'title' => 'Choose a family doctor (Medico di base)',
            'hint' => 'Your first point of contact in the health system.',
        ],
        'bank_account' => [
            'title' => 'Open a bank account (Conto corrente / IBAN)',
            'hint' => 'To receive your salary and pay bills.',
        ],
        'housing_contract' => [
            'title' => 'Sort out housing and understand your lease (Contratto di locazione)',
            'hint' => 'Read the contract terms carefully before signing.',
        ],
        'italian_start' => [
            'title' => 'Start learning Italian',
            'hint' => 'Ten minutes a day makes a difference.',
        ],
        'italian_a2' => [
            'title' => 'Reach level A2 in Italian',
            'hint' => 'A useful level for daily life, work and study.',
        ],
        'job_search' => [
            'title' => 'Start your job search',
            'hint' => 'Prepare your CV and browse jobs that suit you.',
        ],
        'partita_iva' => [
            'title' => 'Understand Partita IVA and the regime that fits you',
            'hint' => 'General information only; consult an accountant (Commercialista) before deciding.',
        ],
        'patente_plan' => [
            'title' => 'Plan your Italian driving licence (Patente)',
            'hint' => 'Learn the requirements and steps.',
        ],
        'patente_theory' => [
            'title' => 'Start preparing for the theory exam',
            'hint' => 'Practise with mock tests.',
        ],
    ],
    'score' => [
        'how_calculated' => 'Each category is the steps you completed divided by the steps that apply to you; the overall score is the average of the categories. Steps you mark "not applicable" are excluded. It is a personal estimate to help you, not an official status.',
        'personalization_off' => 'Turn on personalization so steps are chosen for your situation. For now only general steps are shown.',
    ],
];
