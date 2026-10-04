<?php

return [
    'degree_levels' => [
        'bachelor' => 'Laurea triennale',
        'master' => 'Laurea magistrale',
        'phd' => 'Dottorato',
        'short' => 'Corso breve / professionale',
        'language_course' => 'Corso di lingua',
    ],
    'fields' => [
        'engineering' => 'Ingegneria',
        'computer_science' => 'Informatica',
        'medicine' => 'Medicina',
        'economics' => 'Economia e management',
        'law' => 'Giurisprudenza',
        'humanities' => 'Discipline umanistiche',
        'arts_design' => 'Arte e design',
        'sciences' => 'Scienze',
        'architecture' => 'Architettura',
        'education' => 'Formazione',
        'languages' => 'Lingue',
        'other' => 'Altro',
    ],
    'languages' => [
        'en' => 'In inglese',
        'it' => 'In italiano',
        'both' => 'In inglese e italiano',
    ],
    'kinds' => [
        'public' => 'Università pubblica',
        'private' => 'Università privata',
        'other' => 'Altro',
    ],
    'verify_notice' => 'Scadenze, tasse e requisiti possono cambiare ogni anno. Verifica sempre la pagina ufficiale dell\'università prima di candidarti.',
    'match' => [
        'field' => [
            'match' => 'Area di studio coerente',
            'partial' => '',
            'mismatch' => 'Area di studio diversa',
            'unknown' => '',
        ],
        'degree' => [
            'match' => 'Livello di laurea coerente',
            'partial' => '',
            'mismatch' => 'Livello di laurea diverso',
            'unknown' => '',
        ],
        'language' => [
            'match' => 'Lingua di insegnamento adatta',
            'partial' => '',
            'mismatch' => 'Lingua di insegnamento non adatta',
            'unknown' => '',
        ],
        'budget' => [
            'match' => 'Le tasse annuali rientrano nel tuo budget',
            'partial' => 'Le tasse potrebbero superare il budget',
            'mismatch' => 'Le tasse superano il tuo budget',
            'unknown' => 'Tasse non indicate dalla fonte',
        ],
        'city' => [
            'match' => 'Città coerente',
            'partial' => '',
            'mismatch' => 'Città diversa',
            'unknown' => 'Città non specificata',
        ],
        'italian' => [
            'match' => 'Il tuo livello di italiano è sufficiente',
            'partial' => 'Un livello sotto il richiesto',
            'mismatch' => 'Il livello di italiano richiesto è molto più alto',
            'unknown' => 'Nessun livello di italiano richiesto',
        ],
        'english' => [
            'match' => 'Il tuo livello di inglese è sufficiente',
            'partial' => 'Un livello sotto il richiesto',
            'mismatch' => 'Il livello di inglese richiesto è molto più alto',
            'unknown' => 'Nessun livello di inglese richiesto',
        ],
    ],
];
