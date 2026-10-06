<?php

return [
    'purposes' => [
        'terms' => [
            'title' => 'Termini di servizio',
            'why' => 'Per creare il tuo account e fornire il servizio.',
            'data' => 'Nome, email, password (cifrata).',
        ],
        'privacy' => [
            'title' => 'Informativa sulla privacy',
            'why' => 'Per informarti su come trattiamo i tuoi dati ai sensi del GDPR.',
            'data' => 'Nessun dato aggiuntivo; è una presa visione.',
        ],
        'profile_personalization' => [
            'title' => 'Personalizzazione dell\'esperienza',
            'why' => 'Per mostrarti guide, passaggi e attività adatti alla tua situazione.',
            'data' => 'Situazione attuale, nazionalità, tipo di soggiorno, livelli linguistici, obiettivi, fascia d\'età (solo ciò che scegli di fornire).',
        ],
        'document_storage' => [
            'title' => 'Conservazione dei documenti',
            'why' => 'Per tracciare le scadenze dei tuoi documenti, ricordartele e conservare i tuoi allegati in sicurezza.',
            'data' => 'Tipo di documento, date di rilascio e scadenza, tue note e file caricati.',
        ],
        'ai_personalization' => [
            'title' => 'Personalizzazione delle risposte dell\'assistente',
            'why' => 'Perché l\'assistente EXPA tenga conto della tua situazione. Inviamo solo il minimo (mai nome, email o file).',
            'data' => 'Nazionalità, città, situazione, livello linguistico e scadenze imminenti.',
        ],
        'email_reminders' => [
            'title' => 'Promemoria via email',
            'why' => 'Per inviarti promemoria di scadenza dei documenti e degli appuntamenti.',
            'data' => 'Il tuo indirizzo email e le date dei promemoria.',
        ],
        'push_notifications' => [
            'title' => 'Notifiche push',
            'why' => 'Per inviare avvisi al tuo telefono.',
            'data' => 'Token del dispositivo e piattaforma.',
        ],
        'analytics' => [
            'title' => 'Statistiche di utilizzo',
            'why' => 'Per migliorare EXPA misurando l\'uso generale senza identificarti.',
            'data' => 'Nomi di eventi (es. guida aperta) senza identificativi personali.',
        ],
        'marketing' => [
            'title' => 'Comunicazioni di marketing',
            'why' => 'Per informarti su novità e offerte.',
            'data' => 'Il tuo indirizzo email e interessi generali.',
        ],
        'housing_analysis' => [
            'title' => 'Analisi di annunci di affitto',
            'why' => 'Per controllare il testo dell\'annuncio o del contratto che incolli e, se lo chiedi, farlo spiegare da un modello di IA. Il testo viene elaborato in memoria e non è conservato salvo che tu scelga di salvare il risultato.',
            'data' => 'Il testo dell\'annuncio o del contratto che incolli (può essere inviato al nostro fornitore di IA) e il risultato se lo salvi.',
        ],
        'document_analysis' => [
            'title' => 'Analisi di lettere e documenti',
            'why' => 'Per leggere la foto, la scansione o il testo di una lettera, bolletta o busta paga, classificarlo e spiegarlo. I file sono elaborati temporaneamente ed eliminati; per impostazione predefinita nulla viene conservato.',
            'data' => 'Il file o il testo che invii (il testo può essere inviato al nostro fornitore di IA).',
        ],
    ],
];
