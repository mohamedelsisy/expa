<?php

return [
    'disclaimer' => 'Questo è un controllo automatico e generale del testo che hai incollato. Non è una consulenza legale né una conclusione giuridica. Conferma i punti importanti con il proprietario per iscritto e, in caso di dubbi, con un professionista qualificato o un sindacato degli inquilini.',
    'signals' => [
        'rent_monthly' => 'Canone mensile',
        'deposit_mentioned' => 'Deposito cauzionale',
        'utilities_stated' => 'Se le utenze sono incluse',
        'registration_mentioned' => 'Registrazione del contratto',
        'notice_period_mentioned' => 'Preavviso',
        'utilities_cost' => 'Costo delle utenze',
    ],
    'assumptions' => [
        'rent_missing' => 'Nel testo non è stato trovato un canone mensile, quindi non è stato possibile calcolare il totale mensile. Puoi inserirlo tu.',
        'utilities_included' => 'Il testo dice che utenze/spese sono incluse, quindi non sono state aggiunte.',
        'expenses_assumed_monthly' => 'L\'importo delle spese trovato nel testo è considerato mensile.',
        'utilities_not_counted_excluded' => 'Il testo dice che le utenze non sono incluse e non è stata data una stima: NON sono conteggiate. Inserisci una tua stima per includerle.',
        'utilities_not_counted_unknown' => 'Il testo non dice se le utenze sono incluse: NON sono conteggiate. Chiedi, oppure inserisci una tua stima.',
        'deposit_from_months' => 'L\'importo del deposito è stato calcolato moltiplicando il numero di mensilità trovato nel testo per il canone.',
    ],
    'notes' => [
        'rent_ambiguous' => 'Nel testo compaiono più importi di canone diversi: verifica quale vale.',
        'utilities_ambiguous' => 'Il testo indica le utenze sia come incluse sia come escluse: chiedi chiarimenti.',
        'deposit_months_derived' => 'Le mensilità di deposito sono state calcolate dall\'importo del deposito e dal canone.',
    ],
];
