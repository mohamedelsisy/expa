<?php

/**
 * Reviewed definition of the Italian tax reference figures used by the net-salary estimator and the VAT table.
 *
 * Every figure carries the sentence(s) quoted from the OFFICIAL page it comes from, that page's URL and the date it was
 * read. `php artisan expa:import:tax-reference` validates this file (and, with --verify-sources, re-checks the quotes
 * against the live official pages) before it writes anything. Change a number here ONLY after reading the official
 * source again, and update `read_on`.
 *
 * Quotes are verbatim (Italian). "verify" = the quote can be machine-checked against an HTML page (false for PDFs).
 */
$ade = 'https://www.agenziaentrate.gov.it/portale/imposta-sul-reddito-delle-persone-fisiche-irpef-/aliquote-e-calcolo-dell-irpef';
$readOn = '2026-10-11';

$bracketsFrom2024 = [
    'url' => $ade,
    'read_on' => $readOn,
    'verify' => true,
    'quotes' => [
        'Dall’anno 2024 l’imposta lorda si calcola applicando le seguenti aliquote',
        'fino a euro 28.000 23%',
        'da 28.001 fino a euro 50.000 35%',
        'oltre a euro 50.000 43%',
    ],
];

$inpsRate = [
    'url' => 'https://www.inps.it/bussola/visualizzadoc.aspx?sVirtuaLURL=%2Fcircolari%2FCircolare+numero+23+del+24-1-2007.htm',
    'read_on' => $readOn,
    'verify' => true,
    'quotes' => ['per la generalità delle aziende, la contribuzione pensionistica si attesterà nella misura del 33% , di cui 9,19% a carico del lavoratore'],
];

return [
    'dataset' => 'tax-reference',
    'source_name' => 'Agenzia delle Entrate — Aliquote e calcolo dell\'Irpef; INPS — circolari sui valori contributivi',
    'source_url' => $ade,
    'license' => null,
    'attribution' => 'Fonte: Agenzia delle Entrate (Irpef) e INPS (contributi). Cifre normative, non un testo riprodotto.',

    'tables' => [
        [
            'source_id' => 'it-irpef-2026',
            'slug' => 'irpef-2026',
            'tax_year' => 2026,
            'sort_order' => 1,
            'brackets' => [['up_to' => 28000, 'rate' => 23], ['up_to' => 50000, 'rate' => 33], ['up_to' => null, 'rate' => 43]],
            // No flat deduction is defined by the official pages: detrazioni depend on the case and are NOT modelled.
            'deduction_flat' => 0,
            'contribution_rate' => 9.19,
            'contribution_ceiling' => 122295,
            'names' => [
                'it' => 'Irpef 2026 – aliquote per scaglioni e contributi INPS del lavoratore (stima semplificata)',
                'en' => 'IRPEF 2026 – bracket rates and employee INPS contributions (simplified estimate)',
                'ar' => 'ضريبة الدخل IRPEF لعام 2026 – الشرائح واشتراكات INPS على العامل (تقدير مبسّط)',
            ],
            'notes' => [
                'it' => 'Aliquote: pagina Agenzia delle Entrate (legge di Bilancio 2026: seconda aliquota 33%). Contributo del lavoratore 9,19% (INPS circ. n. 23/2007) con massimale annuo 122.295 euro (INPS circ. n. 6/2026, che vale per chi è iscritto dopo il 31/12/1995). Non sono modellati: addizionali regionali/comunali, detrazioni (es. lavoro dipendente, familiari), aliquota aggiuntiva INPS dell\'1% oltre 56.224 euro, aliquota ridotta di alcuni settori/aziende, sterilizzazione del beneficio oltre 200.000 euro.',
            ],
            'sources' => [
                'brackets' => [
                    'url' => $ade,
                    'read_on' => $readOn,
                    'verify' => true,
                    'quotes' => [
                        'la legge di Bilancio 2026 ha ridotto la seconda aliquota dell’Irpef dal 35 al 33 per cento',
                        'l’imposta dovuta è pari a 13.700 euro (non più 14.140) + il 43% sul reddito eccedente i 50.000 euro',
                        'fino a euro 28.000 23%',
                        'oltre a euro 50.000 43%',
                    ],
                ],
                'contribution_rate' => $inpsRate,
                'contribution_ceiling' => [
                    'url' => 'https://www.inps.it/it/it/inps-comunica/notizie/dettaglio-news-page.news.2026.02.lavoratori-dipendenti-limite-minimo-di-retribuzione-giornaliera-2026.html',
                    'read_on' => $readOn,
                    'verify' => true,
                    'quotes' => ['massimale annuo della base contributiva , che per il 2026 raggiunge i 122.295 euro'],
                    'also' => 'INPS circolare n. 6 del 30/01/2026, par. 6: https://www.inps.it/it/it/inps-comunica/atti/circolari-messaggi-e-normativa/dettaglio.circolari-e-messaggi.2026.01.circolare-numero-6-del-30-01-2026_15151.html',
                ],
                'deduction_flat' => [
                    'url' => $ade,
                    'read_on' => $readOn,
                    'verify' => false,
                    'quotes' => ['(no flat deduction is stated by the page: detrazioni depend on the taxpayer, so the value is 0)'],
                ],
            ],
        ],
        [
            'source_id' => 'it-irpef-2025',
            'slug' => 'irpef-2025',
            'tax_year' => 2025,
            'sort_order' => 2,
            'brackets' => [['up_to' => 28000, 'rate' => 23], ['up_to' => 50000, 'rate' => 35], ['up_to' => null, 'rate' => 43]],
            'deduction_flat' => 0,
            'contribution_rate' => 9.19,
            'contribution_ceiling' => 120607,
            'names' => [
                'it' => 'Irpef 2025 – aliquote per scaglioni e contributi INPS del lavoratore (stima semplificata)',
                'en' => 'IRPEF 2025 – bracket rates and employee INPS contributions (simplified estimate)',
                'ar' => 'ضريبة الدخل IRPEF لعام 2025 – الشرائح واشتراكات INPS على العامل (تقدير مبسّط)',
            ],
            'notes' => [
                'it' => 'Aliquote: pagina Agenzia delle Entrate ("Dall\'anno 2024" le aliquote sono 23/35/43%; la pagina segnala una modifica solo con la legge di Bilancio 2026, quindi per il 2025 valgono queste). Contributo del lavoratore 9,19% (INPS circ. n. 23/2007), massimale annuo 120.607 euro (INPS circ. n. 26/2025, par. 6). Non sono modellati: addizionali, detrazioni, aliquota aggiuntiva INPS dell\'1% oltre 55.448 euro.',
            ],
            'sources' => [
                'brackets' => $bracketsFrom2024,
                'contribution_rate' => $inpsRate,
                'contribution_ceiling' => [
                    'url' => 'https://www.inps.it/content/dam/inps-site/it/scorporati/circolari-e-messaggi/2025/01/Circolare_14806/Allegati/15874_Circolare-numero-26-del-30-01-2025.pdf',
                    'read_on' => $readOn,
                    'verify' => false,
                    'quotes' => ['è pari, per l\'anno 2025, a 120.606,90 euro, che arrotondato all’unità di euro è pari a 120.607,00 euro'],
                ],
                'deduction_flat' => [
                    'url' => $ade,
                    'read_on' => $readOn,
                    'verify' => false,
                    'quotes' => ['(no flat deduction is stated by the page: value is 0)'],
                ],
            ],
        ],
    ],

    'rates' => [
        [
            'source_id' => 'it-vat-ordinary',
            'country' => 'IT',
            'label' => 'VAT',
            'rate' => 22,
            'valid_from' => null, // the page does not state a start date: none is invented
            'source_url' => 'https://www.agenziaentrate.gov.it/portale/iva-regole-generali-aliquote-esenzioni-pagamento/norme-generali-e-aliquote',
            'read_on' => $readOn,
            'verify' => true,
            'quotes' => ['In Italia l’aliquota ordinaria Iva è del 22%'],
        ],
    ],
];
