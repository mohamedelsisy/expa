<?php

/**
 * Reviewed definition of the driving-licence categories (AM ... DE).
 *
 * Source: Ministero delle Infrastrutture e dei Trasporti – Portale dell'Automobilista, page
 * "Veicoli nell'unione: ottenimento e rinnovo di una patente di guida" (last updated by the Ministry on 26 June 2024).
 * `quote` is the VERBATIM sentence of the page that states the minimum age (and, in the same passage, the vehicles); the
 * command re-checks it against the live page with --verify-source.
 *
 * Italian text paraphrases the page. English and Arabic are EXPA's own faithful renderings of the same statement
 * (nothing added); the category definitions come from directive 2006/126/CE as reproduced on the page.
 * No exam questions are, or may be, imported here (copyrighted).
 */
return [
    'dataset' => 'patente-categories',
    'source_name' => 'Ministero delle Infrastrutture e dei Trasporti – Portale dell\'Automobilista: Veicoli nell\'unione: ottenimento e rinnovo di una patente di guida',
    'source_url' => 'https://www.ilportaledellautomobilista.it/SDG/C2IT.html',
    'source_edition' => 'Ultimo aggiornamento 26 Giugno 2024',
    'read_on' => '2026-10-11',
    'license' => null,
    'attribution' => 'Fonte: Ministero delle Infrastrutture e dei Trasporti, Portale dell\'Automobilista.',
    'source_note' => [
        'it' => 'Fonte: Ministero delle Infrastrutture e dei Trasporti, Portale dell\'Automobilista (pagina aggiornata il 26 giugno 2024). Verifica sempre i requisiti aggiornati presso la Motorizzazione.',
        'en' => 'Source: Ministry of Infrastructure and Transport, Portale dell\'Automobilista (page last updated 26 June 2024). Always check the current requirements with the Motorizzazione.',
        'ar' => 'المصدر: وزارة البنى التحتية والنقل، بوابة السيارات Portale dell\'Automobilista (آخر تحديث للصفحة 26 يونيو 2024). تحقّق دائمًا من الشروط الحالية لدى المديرية العامة للنقل (Motorizzazione).',
    ],
    'categories' => [
        [
            'code' => 'AM', 'min_age' => 14,
            'quote' => 'L\'età minima per la categoria AM è fissata a 14 anni',
            'vehicles' => [
                'it' => 'Ciclomotori a due ruote (L1e) e veicoli a tre ruote (L2e) con velocità massima per costruzione non superiore a 45 km/h e cilindrata fino a 50 cm³ (oppure potenza fino a 4 kW per i motori elettrici); quadricicli leggeri (L6e) con massa a vuoto fino a 350 kg, esclusa la massa delle batterie, velocità massima per costruzione fino a 45 km/h e motore fino a 50 cm³ (oppure fino a 4 kW).',
                'en' => 'Two-wheel mopeds (L1e) and three-wheel vehicles (L2e) with a maximum design speed of no more than 45 km/h and an engine of up to 50 cm³ (or up to 4 kW for electric motors); light quadricycles (L6e) with an unladen mass of up to 350 kg, excluding the mass of batteries, a maximum design speed of up to 45 km/h and an engine of up to 50 cm³ (or up to 4 kW).',
                'ar' => 'الدراجات النارية الصغيرة ذات العجلتين (L1e) والمركبات ذات الثلاث عجلات (L2e) التي لا تتجاوز سرعتها القصوى بحسب التصميم 45 كم/س وسعة محركها 50 سم³ (أو قدرتها 4 كيلوواط للمحركات الكهربائية)؛ والدراجات الرباعية الخفيفة (L6e) التي لا تتجاوز كتلتها فارغة 350 كغ (دون احتساب كتلة البطاريات) وسرعتها القصوى بحسب التصميم 45 كم/س ومحركها حتى 50 سم³ (أو حتى 4 كيلوواط).',
            ],
        ],
        [
            'code' => 'A1', 'min_age' => 16,
            'quote' => 'L\'età minima per la categoria A1 è fissata a 16 anni',
            'vehicles' => [
                'it' => 'Motocicli di cilindrata massima 125 cm³, potenza massima 11 kW e rapporto potenza/peso non superiore a 0,1 kW/kg; tricicli di potenza non superiore a 15 kW.',
                'en' => 'Motorcycles with an engine capacity of up to 125 cm³, a maximum power of 11 kW and a power-to-weight ratio of no more than 0.1 kW/kg; tricycles with a power of no more than 15 kW.',
                'ar' => 'الدراجات النارية بسعة محرك حتى 125 سم³ وقدرة قصوى 11 كيلوواط ونسبة قدرة إلى وزن لا تتجاوز 0.1 كيلوواط/كغ؛ والمركبات ذات الثلاث عجلات بقدرة لا تتجاوز 15 كيلوواط.',
            ],
        ],
        [
            'code' => 'A2', 'min_age' => 18,
            'quote' => 'L\'età minima per la categoria A2 è fissata a 18 anni',
            'vehicles' => [
                'it' => 'Motocicli di potenza non superiore a 35 kW, con rapporto potenza/peso non superiore a 0,2 kW/kg e non derivati da una versione che sviluppa oltre il doppio della potenza massima.',
                'en' => 'Motorcycles with a power of no more than 35 kW, a power-to-weight ratio of no more than 0.2 kW/kg, and not derived from a version that develops more than twice its maximum power.',
                'ar' => 'الدراجات النارية بقدرة لا تتجاوز 35 كيلوواط ونسبة قدرة إلى وزن لا تتجاوز 0.2 كيلوواط/كغ، وغير المشتقّة من نسخة تولّد أكثر من ضعف قدرتها القصوى.',
            ],
        ],
        [
            'code' => 'A', 'min_age' => 20,
            'quote' => 'L\'età minima per la categoria A è fissata a 20 anni',
            'vehicles' => [
                'it' => 'Tutti i motocicli; tricicli di potenza superiore a 15 kW (per questi l\'età minima richiesta è 21 anni).',
                'en' => 'All motorcycles; tricycles with a power above 15 kW (for these the minimum age is 21).',
                'ar' => 'جميع الدراجات النارية؛ والمركبات ذات الثلاث عجلات بقدرة تزيد على 15 كيلوواط (والحد الأدنى للسن لها 21 سنة).',
            ],
            'conditions' => [
                'it' => 'Per i motocicli è richiesta un\'esperienza di almeno due anni su motocicli con patente di categoria A2; questa esperienza può non essere richiesta se il candidato ha almeno 24 anni.',
                'en' => 'For motorcycles, at least two years of experience on motorcycles with an A2 licence is required; this prior experience may not be required if the candidate is at least 24.',
                'ar' => 'بالنسبة للدراجات النارية يُشترط خبرة لا تقل عن سنتين على دراجات نارية برخصة الفئة A2؛ وقد لا تُشترط هذه الخبرة إذا بلغ المرشّح 24 سنة على الأقل.',
            ],
            'quote_extra' => ['i tricicli di potenza superiore a 15 KW: in tal caso l’età minima richiesta è 21 anni', 'Questa esperienza preliminare può non essere richiesta se il candidato ha almeno 24 anni'],
        ],
        [
            'code' => 'B1', 'min_age' => 16,
            'quote' => 'L\'età minima per la categoria B1 è fissata a 16 anni',
            'vehicles' => [
                'it' => 'Quadricicli diversi da quelli leggeri (L7e), con massa a vuoto fino a 400 kg (550 kg per i veicoli destinati al trasporto di merci), esclusa la massa delle batterie, e potenza massima netta del motore fino a 15 kW.',
                'en' => 'Quadricycles other than light ones (L7e), with an unladen mass of up to 400 kg (550 kg for vehicles intended for carrying goods), excluding the mass of batteries, and a maximum net engine power of up to 15 kW.',
                'ar' => 'الدراجات الرباعية غير الخفيفة (L7e) التي لا تتجاوز كتلتها فارغة 400 كغ (550 كغ للمركبات المخصصة لنقل البضائع) دون احتساب كتلة البطاريات، وبقدرة محرك صافية قصوى حتى 15 كيلوواط.',
            ],
        ],
        [
            'code' => 'B', 'min_age' => 18,
            'quote' => 'L\'età minima per la categoria B è fissata a 18 anni',
            'vehicles' => [
                'it' => 'Autoveicoli con massa massima autorizzata non superiore a 3500 kg, progettati e costruiti per il trasporto di non più di otto persone oltre al conducente; è possibile agganciare un rimorchio con massa massima autorizzata non superiore a 750 kg.',
                'en' => 'Motor vehicles with a maximum authorised mass of no more than 3500 kg, designed and built to carry no more than eight persons in addition to the driver; a trailer with a maximum authorised mass of no more than 750 kg may be attached.',
                'ar' => 'المركبات ذات المحرك التي لا تتجاوز كتلتها القصوى المسموح بها 3500 كغ، والمصمَّمة والمصنَّعة لنقل ما لا يزيد على ثمانية أشخاص إضافة إلى السائق؛ ويجوز ربط مقطورة لا تتجاوز كتلتها القصوى المسموح بها 750 كغ.',
            ],
        ],
        [
            'code' => 'BE', 'min_age' => 18,
            'quote' => 'di categoria BE consente di condurre complessi di veicoli composti di una motrice della categoria B e di un rimorchio o semirimorchio',
            'quote_extra' => ['L\'età minima per la categoria B è fissata a 18 anni'],
            'vehicles' => [
                'it' => 'Complessi di veicoli composti da una motrice di categoria B e da un rimorchio o semirimorchio con massa massima autorizzata non superiore a 3500 kg.',
                'en' => 'Combinations of vehicles made up of a category B towing vehicle and a trailer or semi-trailer with a maximum authorised mass of no more than 3500 kg.',
                'ar' => 'مجموعات المركبات المؤلفة من مركبة جرّ من الفئة B ومقطورة أو شبه مقطورة لا تتجاوز كتلتها القصوى المسموح بها 3500 كغ.',
            ],
            'conditions' => [
                'it' => 'Nel testo della pagina, nel paragrafo della categoria BE, l\'età minima indicata è 18 anni (la frase cita "la categoria B").',
                'en' => 'In the page text, in the category BE paragraph, the minimum age stated is 18 (the sentence refers to "category B").',
                'ar' => 'في نص الصفحة، وفي فقرة الفئة BE، الحد الأدنى للسن المذكور هو 18 سنة (والجملة تشير إلى «الفئة B»).',
            ],
        ],
        [
            'code' => 'C1', 'min_age' => 18,
            'quote' => 'L’età minima per la categoria C1 è fissata in 18 anni',
            'vehicles' => [
                'it' => 'Autoveicoli diversi da quelli delle categorie D1 o D, con massa massima autorizzata superiore a 3500 kg ma non superiore a 7500 kg, progettati e costruiti per il trasporto di non più di otto passeggeri oltre al conducente; è possibile agganciare un rimorchio con massa massima autorizzata non superiore a 750 kg.',
                'en' => 'Motor vehicles other than those of categories D1 or D, with a maximum authorised mass above 3500 kg but not above 7500 kg, designed and built to carry no more than eight passengers in addition to the driver; a trailer with a maximum authorised mass of no more than 750 kg may be attached.',
                'ar' => 'المركبات ذات المحرك غير المندرجة في الفئتين D1 أو D، التي تزيد كتلتها القصوى المسموح بها على 3500 كغ ولا تتجاوز 7500 كغ، والمصمَّمة والمصنَّعة لنقل ما لا يزيد على ثمانية ركاب إضافة إلى السائق؛ ويجوز ربط مقطورة لا تتجاوز كتلتها القصوى المسموح بها 750 كغ.',
            ],
        ],
        [
            'code' => 'C1E', 'min_age' => 18,
            'quote' => 'L’età minima per la categoria C1E è fissata in 18 anni',
            'vehicles' => [
                'it' => 'Complessi di veicoli composti da una motrice di categoria C1 e da un rimorchio o semirimorchio con massa massima autorizzata superiore a 750 kg, purché la massa autorizzata del complesso non superi 12000 kg; anche complessi composti da una motrice di categoria B e da un rimorchio o semirimorchio con massa autorizzata superiore a 3500 kg, purché la massa autorizzata del complesso non superi 12000 kg.',
                'en' => 'Combinations of vehicles made up of a category C1 towing vehicle and a trailer or semi-trailer with a maximum authorised mass above 750 kg, provided the authorised mass of the combination does not exceed 12000 kg; also combinations made up of a category B towing vehicle and a trailer or semi-trailer with an authorised mass above 3500 kg, provided the authorised mass of the combination does not exceed 12000 kg.',
                'ar' => 'مجموعات المركبات المؤلفة من مركبة جرّ من الفئة C1 ومقطورة أو شبه مقطورة تزيد كتلتها القصوى المسموح بها على 750 كغ، بشرط ألا تتجاوز الكتلة المسموح بها للمجموعة 12000 كغ؛ وكذلك مجموعات مؤلفة من مركبة جرّ من الفئة B ومقطورة أو شبه مقطورة تزيد كتلتها المسموح بها على 3500 كغ، بشرط ألا تتجاوز الكتلة المسموح بها للمجموعة 12000 كغ.',
            ],
        ],
        [
            'code' => 'C', 'min_age' => 21,
            'quote' => 'L’età minima per la categoria C è fissata in 21 anni, fatto salvo il possesso di una carta di qualificazione del conducente',
            'vehicles' => [
                'it' => 'Autoveicoli diversi da quelli delle categorie D1 o D, con massa massima autorizzata superiore a 3500 kg, progettati e costruiti per il trasporto di non più di otto passeggeri oltre al conducente; è possibile agganciare un rimorchio con massa massima autorizzata non superiore a 750 kg.',
                'en' => 'Motor vehicles other than those of categories D1 or D, with a maximum authorised mass above 3500 kg, designed and built to carry no more than eight passengers in addition to the driver; a trailer with a maximum authorised mass of no more than 750 kg may be attached.',
                'ar' => 'المركبات ذات المحرك غير المندرجة في الفئتين D1 أو D، التي تزيد كتلتها القصوى المسموح بها على 3500 كغ، والمصمَّمة والمصنَّعة لنقل ما لا يزيد على ثمانية ركاب إضافة إلى السائق؛ ويجوز ربط مقطورة لا تتجاوز كتلتها القصوى المسموح بها 750 كغ.',
            ],
            'conditions' => [
                'it' => 'L\'età minima è 21 anni, fatto salvo il possesso di una carta di qualificazione del conducente.',
                'en' => 'The minimum age is 21, subject to the holding of a driver qualification card.',
                'ar' => 'الحد الأدنى للسن 21 سنة، مع مراعاة حيازة بطاقة تأهيل السائق (carta di qualificazione del conducente).',
            ],
        ],
        [
            'code' => 'CE', 'min_age' => 21,
            'quote' => 'L’età minima per la categoria CE è fissata in 21 anni, fatto salvo il possesso di una carta di qualificazione del conducente',
            'vehicles' => [
                'it' => 'Complessi di veicoli composti da una motrice di categoria C e da un rimorchio o semirimorchio con massa massima autorizzata superiore a 750 kg.',
                'en' => 'Combinations of vehicles made up of a category C towing vehicle and a trailer or semi-trailer with a maximum authorised mass above 750 kg.',
                'ar' => 'مجموعات المركبات المؤلفة من مركبة جرّ من الفئة C ومقطورة أو شبه مقطورة تزيد كتلتها القصوى المسموح بها على 750 كغ.',
            ],
            'conditions' => [
                'it' => 'L\'età minima è 21 anni, fatto salvo il possesso di una carta di qualificazione del conducente.',
                'en' => 'The minimum age is 21, subject to the holding of a driver qualification card.',
                'ar' => 'الحد الأدنى للسن 21 سنة، مع مراعاة حيازة بطاقة تأهيل السائق (carta di qualificazione del conducente).',
            ],
        ],
        [
            'code' => 'D1', 'min_age' => 21,
            'quote' => 'L’età minima per la categoria D1 è fissata in 21 anni',
            'vehicles' => [
                'it' => 'Autoveicoli progettati e costruiti per il trasporto di non più di 16 persone oltre al conducente e con lunghezza massima di 8 metri; è possibile agganciare un rimorchio con massa massima autorizzata non superiore a 750 kg.',
                'en' => 'Motor vehicles designed and built to carry no more than 16 persons in addition to the driver and with a maximum length of 8 metres; a trailer with a maximum authorised mass of no more than 750 kg may be attached.',
                'ar' => 'المركبات ذات المحرك المصمَّمة والمصنَّعة لنقل ما لا يزيد على 16 شخصًا إضافة إلى السائق وطولها الأقصى 8 أمتار؛ ويجوز ربط مقطورة لا تتجاوز كتلتها القصوى المسموح بها 750 كغ.',
            ],
        ],
        [
            'code' => 'D1E', 'min_age' => 21,
            'quote' => 'L’età minima per la categoria D1E è fissata in 21 anni',
            'vehicles' => [
                'it' => 'Complessi di veicoli composti da una motrice di categoria D1 e da un rimorchio con massa massima autorizzata superiore a 750 kg.',
                'en' => 'Combinations of vehicles made up of a category D1 towing vehicle and a trailer with a maximum authorised mass above 750 kg.',
                'ar' => 'مجموعات المركبات المؤلفة من مركبة جرّ من الفئة D1 ومقطورة تزيد كتلتها القصوى المسموح بها على 750 كغ.',
            ],
        ],
        [
            'code' => 'D', 'min_age' => 24,
            'quote' => 'L’età minima per la categoria D è fissata in 24 anni, fatto salvo il possesso di una carta di qualificazione del conducente',
            'vehicles' => [
                'it' => 'Autoveicoli progettati e costruiti per il trasporto di più di otto persone oltre al conducente; è possibile agganciare un rimorchio con massa massima autorizzata non superiore a 750 kg.',
                'en' => 'Motor vehicles designed and built to carry more than eight persons in addition to the driver; a trailer with a maximum authorised mass of no more than 750 kg may be attached.',
                'ar' => 'المركبات ذات المحرك المصمَّمة والمصنَّعة لنقل أكثر من ثمانية أشخاص إضافة إلى السائق؛ ويجوز ربط مقطورة لا تتجاوز كتلتها القصوى المسموح بها 750 كغ.',
            ],
            'conditions' => [
                'it' => 'L\'età minima è 24 anni, fatto salvo il possesso di una carta di qualificazione del conducente.',
                'en' => 'The minimum age is 24, subject to the holding of a driver qualification card.',
                'ar' => 'الحد الأدنى للسن 24 سنة، مع مراعاة حيازة بطاقة تأهيل السائق (carta di qualificazione del conducente).',
            ],
        ],
        [
            'code' => 'DE', 'min_age' => 24,
            'quote' => 'L’età minima per la categoria DE è fissata in 24 anni, fatto salvo il possesso di una carta di qualificazione del conducente',
            'vehicles' => [
                'it' => 'Complessi di veicoli composti da una motrice di categoria D e da un rimorchio con massa massima autorizzata superiore a 750 kg.',
                'en' => 'Combinations of vehicles made up of a category D towing vehicle and a trailer with a maximum authorised mass above 750 kg.',
                'ar' => 'مجموعات المركبات المؤلفة من مركبة جرّ من الفئة D ومقطورة تزيد كتلتها القصوى المسموح بها على 750 كغ.',
            ],
            'conditions' => [
                'it' => 'L\'età minima è 24 anni, fatto salvo il possesso di una carta di qualificazione del conducente.',
                'en' => 'The minimum age is 24, subject to the holding of a driver qualification card.',
                'ar' => 'الحد الأدنى للسن 24 سنة، مع مراعاة حيازة بطاقة تأهيل السائق (carta di qualificazione del conducente).',
            ],
        ],
    ],
];
