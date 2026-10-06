<?php

return [
    'types' => [
        'comune' => 'Lettera del Comune',
        'questura' => 'Questura / ufficio immigrazione',
        'inps' => 'INPS (previdenza)',
        'agenzia_entrate' => 'Agenzia delle Entrate',
        'bolletta' => 'Bolletta',
        'busta_paga' => 'Busta paga',
        'multa' => 'Multa / verbale',
        'contratto' => 'Contratto',
        'sanitaria' => 'Sanità (ASL / ospedale)',
        'scuola' => 'Scuola',
        'unknown' => 'Documento non riconosciuto',
    ],
    'date_labels' => [
        'appointment' => 'Data dell\'appuntamento',
        'issued' => 'Data di emissione',
        'deadline' => 'Scadenza',
        'payment_due' => 'Pagamento entro',
        'date' => 'Data trovata nel documento',
    ],
    'disclaimer' => 'Questa spiegazione è automatica e generale. Potrebbe essere errata o incompleta e non è una consulenza legale, fiscale o medica. Controlla il documento originale e la fonte ufficiale e, se hai dubbi, chiedi all\'ufficio che lo ha inviato.',
    'summary_unavailable' => 'Non sono riuscito a elaborarlo in questo momento. Riprova. Il tipo e le date qui sotto sono stati letti direttamente dal testo.',
    'actions' => [
        'reminder' => 'Crea un promemoria per il :date',
        'guide' => 'Leggi la guida EXPA: :term',
        'appointment' => 'Come prenotare un appuntamento',
    ],
];
