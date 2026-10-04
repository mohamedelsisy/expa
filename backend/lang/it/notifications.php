<?php

return [
    'push' => [
        'title' => 'EXPA',
    ],
    'mail' => [
        'open' => 'Apri il documento',
        'footer' => 'Ricevi questo messaggio perché hai attivato i promemoria via email. Puoi disattivarli nelle impostazioni sulla privacy.',
    ],
    'types' => [
        'job_source_failing' => [
            'title' => 'Una fonte di offerte è stata disattivata',
            'body' => 'La fonte di offerte «:source» è stata disattivata dopo :failures esecuzioni fallite consecutive.',
            'push' => 'Una fonte di offerte è stata disattivata',
        ],
        'document_reminder' => [
            'title' => '«:name» scade tra :days giorni',
            'body' => 'Data di scadenza: :date. Inizia a preparare il rinnovo e consulta la guida ufficiale per i dettagli.',
            'push' => 'Un tuo documento sta per scadere.',
        ],
        'document_expired' => [
            'title' => '«:name» è scaduto',
            'body' => 'È scaduto il :date. Verifica come procedere presso l\'ente competente.',
            'push' => 'Uno dei tuoi documenti è scaduto.',
        ],
    ],
];
