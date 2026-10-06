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
        'payment_failed' => [
            'title' => 'Non siamo riusciti a incassare il pagamento',
            'body' => 'L\'ultimo pagamento EXPA non è andato a buon fine. Il tuo piano resta attivo per altri :days giorni. Aggiorna il metodo di pagamento presso il tuo gestore dei pagamenti.',
            'push' => 'Ultimo pagamento non riuscito.',
        ],
        'payment_failed_reminder' => [
            'title' => 'Il pagamento è ancora in sospeso',
            'body' => 'Non siamo ancora riusciti a incassare il pagamento EXPA. Il piano terminerà tra circa :days giorni se il pagamento non va a buon fine.',
            'push' => 'Pagamento ancora in sospeso.',
        ],
        'subscription_ended' => [
            'title' => 'Il tuo piano è terminato',
            'body' => 'Il piano a pagamento è terminato perché il pagamento non è stato incassato. Puoi riabbonarti in qualsiasi momento.',
            'push' => 'Il piano a pagamento è terminato.',
        ],
        'scanner_unavailable' => [
            'title' => 'Scanner dei file non raggiungibile',
            'body' => 'L\'antivirus usato per il caricamento dei documenti non è raggiungibile. I caricamenti vengono rifiutati finché non torna disponibile.',
            'push' => 'L\'antivirus dei caricamenti non è raggiungibile.',
        ],
        'provider_new_lead' => [
            'title' => 'Hai una nuova richiesta',
            'body' => 'Un utente ti ha inviato una richiesta di contatto. Apri il portale fornitori per leggerla e rispondere.',
            'push' => 'Hai una nuova richiesta.',
        ],
        'announcement' => [
            'title' => 'Avviso',
            'body' => '',
            'push' => 'Hai un nuovo avviso.',
        ],
    ],
];
