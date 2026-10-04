<?php

return [
    'degree_levels' => [
        'bachelor' => 'Bachelor\'s (Laurea triennale)',
        'master' => 'Master\'s (Laurea magistrale)',
        'phd' => 'PhD (Dottorato)',
        'short' => 'Short / professional course',
        'language_course' => 'Language course',
    ],
    'fields' => [
        'engineering' => 'Engineering',
        'computer_science' => 'Computer science',
        'medicine' => 'Medicine',
        'economics' => 'Economics & management',
        'law' => 'Law',
        'humanities' => 'Humanities',
        'arts_design' => 'Arts & design',
        'sciences' => 'Sciences',
        'architecture' => 'Architecture',
        'education' => 'Education',
        'languages' => 'Languages',
        'other' => 'Other',
    ],
    'languages' => [
        'en' => 'Taught in English',
        'it' => 'Taught in Italian',
        'both' => 'Taught in English and Italian',
    ],
    'kinds' => [
        'public' => 'Public university',
        'private' => 'Private university',
        'other' => 'Other',
    ],
    'verify_notice' => 'Deadlines, fees and requirements can change every year. Always confirm on the university\'s official page before applying.',
    'match' => [
        'field' => [
            'match' => 'Field matches',
            'partial' => '',
            'mismatch' => 'Different field',
            'unknown' => '',
        ],
        'degree' => [
            'match' => 'Degree level matches',
            'partial' => '',
            'mismatch' => 'Different degree level',
            'unknown' => '',
        ],
        'language' => [
            'match' => 'Language of instruction fits',
            'partial' => '',
            'mismatch' => 'Language of instruction does not fit',
            'unknown' => '',
        ],
        'budget' => [
            'match' => 'Yearly tuition is within your budget',
            'partial' => 'Tuition may exceed your budget',
            'mismatch' => 'Tuition is above your budget',
            'unknown' => 'Tuition not stated by the source',
        ],
        'city' => [
            'match' => 'City matches',
            'partial' => '',
            'mismatch' => 'Different city',
            'unknown' => 'City not specified',
        ],
        'italian' => [
            'match' => 'Your Italian level is enough',
            'partial' => 'One level below the requirement',
            'mismatch' => 'Italian requirement is well above your level',
            'unknown' => 'No specific Italian level required',
        ],
        'english' => [
            'match' => 'Your English level is enough',
            'partial' => 'One level below the requirement',
            'mismatch' => 'English requirement is well above your level',
            'unknown' => 'No specific English level required',
        ],
    ],
];
