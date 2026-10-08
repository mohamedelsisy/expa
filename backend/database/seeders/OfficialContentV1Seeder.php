<?php

namespace Database\Seeders;

use App\Domains\Geo\Models\City;
use App\Domains\Geo\Models\Region;
use App\Domains\Government\Models\GovernmentService;
use App\Domains\Guides\Models\Guide;
use Illuminate\Database\Seeder;

/**
 * EXPA official content slice v1.
 *
 * Sources were checked on 2026-10-08. This seeder deliberately places content in
 * review outside local/testing so a second human can approve it before launch.
 * It contains summaries/explanations, not copied government text.
 */
class OfficialContentV1Seeder extends Seeder
{
    private const VERIFIED_AT = '2026-10-08';

    public function run(): void
    {
        foreach ($this->guides() as $index => $item) {
            $guide = Guide::updateOrCreate(
                ['slug' => $item['slug']],
                [
                    'category' => $item['category'],
                    'italian_term' => $item['italian_term'],
                    'region_id' => $this->regionId($item['region'] ?? null),
                    'city_id' => $this->cityId($item['city'] ?? null),
                    'sort_order' => $index * 10,
                    'source_name' => $item['source_name'],
                    'source_url' => $item['source_url'],
                    'source_type' => 'official',
                    'last_verified_at' => self::VERIFIED_AT,
                ]
            );

            $guide->setTranslations($item['translations']);
            $this->setLifecycle($guide);
        }

        foreach ($this->services() as $index => $item) {
            $guide = Guide::where('slug', $item['guide_slug'])->firstOrFail();

            $service = GovernmentService::updateOrCreate(
                ['slug' => $item['slug']],
                [
                    'domain' => $item['domain'],
                    'italian_term' => $item['italian_term'],
                    'guide_id' => $guide->id,
                    'region_id' => $this->regionId($item['region'] ?? null),
                    'city_id' => $this->cityId($item['city'] ?? null),
                    'sort_order' => $index * 10,
                    'source_name' => $item['source_name'],
                    'source_url' => $item['source_url'],
                    'source_type' => 'official',
                    'last_verified_at' => self::VERIFIED_AT,
                ]
            );

            $service->setTranslations($item['translations']);
            $this->setLifecycle($service);
        }
    }

    private function setLifecycle(object $model): void
    {
        // Local/test keeps the app immediately useful. Staging/production must
        // go through the four-eyes review workflow before anything is published.
        $live = app()->environment('local', 'testing');

        $model->forceFill([
            'status' => $live ? 'published' : 'review',
            'published_at' => $live ? ($model->published_at ?? now()) : null,
        ])->save();
    }

    private function regionId(?string $slug): ?int
    {
        return $slug ? Region::where('slug', $slug)->value('id') : null;
    }

    private function cityId(?string $slug): ?int
    {
        return $slug ? City::where('slug', $slug)->value('id') : null;
    }

    private function guides(): array
    {
        return [
            [
                'slug' => 'permesso-di-soggiorno-rinnovo-roma',
                'category' => 'immigration',
                'italian_term' => 'Permesso di soggiorno',
                'region' => 'lazio',
                'city' => 'roma',
                'source_name' => 'Prefettura di Roma',
                'source_url' => 'https://prefettura.interno.gov.it/it/prefetture/roma/permessi-questura',
                'translations' => [
                    'ar' => [
                        'title' => 'تجديد تصريح الإقامة في روما',
                        'summary' => 'دليل تمهيدي لتجديد Permesso di Soggiorno في روما، مع روابط ومعلومات مصدرها Prefettura di Roma.',
                        'what_is' => 'تصريح الإقامة هو الوثيقة التي تثبت حق الأجنبي في الإقامة في إيطاليا وفق نوع التصريح. تختلف متطلبات التجديد حسب نوع التصريح.',
                        'who_needs' => 'من لديه تصريح إقامة يحتاج إلى التجديد ويريد معرفة الخطوات والمستندات الأساسية في روما.',
                        'required_documents' => [
                            'نموذج الطلب وفق نوع التصريح',
                            'جواز سفر ساري أو وثيقة سفر معترف بها، مع التأشيرة عند الاقتضاء',
                            'نسخة من الوثائق المطلوبة',
                            'أربع صور شخصية بحجم صور جواز السفر',
                            'Marca da bollo بقيمة 16 يورو وفق صفحة Prefettura المشار إليها',
                            'المستندات الخاصة بسبب الإقامة، حسب نوع التصريح',
                        ],
                        'steps' => [
                            ['title' => 'تحقق من موعد التجديد', 'text' => 'ابدأ قبل انتهاء التصريح بوقت مناسب. Prefettura di Roma تذكر مددًا مختلفة حسب مدة التصريح، لذلك راجع المصدر الرسمي قبل التقديم.'],
                            ['title' => 'جهّز المستندات', 'text' => 'المستندات تختلف حسب نوع التصريح. لا تعتمد على قائمة عامة إذا كان نوع تصريحك مختلفًا.'],
                            ['title' => 'اتبع قناة التقديم الرسمية', 'text' => 'استخدم الإجراء والقناة المشار إليهما في الصفحة الرسمية، وتحقق من أي تعليمات خاصة بنوع تصريحك.'],
                            ['title' => 'احتفظ بالإثباتات', 'text' => 'احتفظ بنسخة من الطلب والإيصالات وأي موعد أو رقم تتبع تحصل عليه.'],
                        ],
                        'where_to_apply' => 'هذه الصفحة تخص روما. القواعد أو القنوات المحلية قد تختلف في محافظات أخرى.',
                        'how_to_book' => 'راجع صفحة Prefettura di Roma المرتبطة بالمصدر لمعرفة القناة الحالية لكل نوع من أنواع التصاريح.',
                        'costs' => 'توجد مستندات ورسوم مرتبطة بنوع الطلب. لا تعتبر أي مبلغ ثابتًا لكل أنواع التصاريح.',
                        'processing_time' => 'لم نضع مدة معالجة عامة لأن المدة تختلف حسب نوع الطلب والجهة.',
                        'body' => 'مهم: هذا الدليل يشرح المعلومات الرسمية بصورة مبسطة ولا يحل محل التعليمات الصادرة عن Questura أو Prefettura. إذا كان نوع تصريحك غير واضح، تحقق من الصفحة الرسمية قبل إرسال الطلب.',
                    ],
                    'en' => [
                        'title' => 'Renewing a residence permit in Rome',
                        'summary' => 'A practical starting guide to renewing a Permesso di Soggiorno in Rome, based on the Prefettura di Roma.',
                        'what_is' => 'A residence permit documents a foreign national’s right to stay in Italy under a specific permit type. Renewal requirements depend on that type.',
                        'who_needs' => 'People whose residence permit needs renewal and who are following the Rome procedure.',
                        'required_documents' => ['Application form for the permit type', 'Valid passport or recognised travel document, with visa where required', 'Required copies', 'Four passport-size photos', 'A €16 marca da bollo where required on the cited Prefettura page', 'Documents specific to the reason for stay'],
                        'steps' => [
                            ['title' => 'Check the renewal timing', 'text' => 'Start early. Prefettura di Roma lists different lead times depending on the permit duration, so check the official page before applying.'],
                            ['title' => 'Prepare the documents', 'text' => 'Requirements vary by permit type. Do not treat a generic checklist as complete for every case.'],
                            ['title' => 'Use the official channel', 'text' => 'Follow the application channel and instructions currently published for your permit type.'],
                            ['title' => 'Keep your evidence', 'text' => 'Keep copies of the application, receipts and any appointment or tracking reference.'],
                        ],
                        'where_to_apply' => 'This guide is Rome-specific. Local procedures can differ elsewhere in Italy.',
                        'how_to_book' => 'Use the cited Prefettura di Roma page to check the current channel for your permit type.',
                        'costs' => 'Fees and documents depend on the permit type; no single amount applies to every renewal.',
                        'processing_time' => 'No generic processing time is stated here because it depends on the case and authority.',
                        'body' => 'This is a simplified explanation of official information, not legal advice. Check the official Questura/Prefettura instructions before submitting.',
                    ],
                    'it' => [
                        'title' => 'Rinnovo del permesso di soggiorno a Roma',
                        'summary' => 'Guida introduttiva al rinnovo del Permesso di Soggiorno a Roma, basata sulla Prefettura di Roma.',
                        'what_is' => 'Il permesso di soggiorno documenta il diritto del cittadino straniero a soggiornare in Italia secondo uno specifico titolo. I requisiti cambiano in base al tipo di permesso.',
                        'who_needs' => 'Chi deve rinnovare il proprio permesso seguendo la procedura prevista a Roma.',
                        'required_documents' => ['Modulo relativo al tipo di permesso', 'Passaporto o documento di viaggio valido, con visto quando richiesto', 'Copie richieste', 'Quattro fotografie formato tessera', 'Marca da bollo da €16 quando prevista dalla pagina della Prefettura citata', 'Documentazione relativa al motivo del soggiorno'],
                        'steps' => [
                            ['title' => 'Controlla i tempi', 'text' => 'Muoviti per tempo. La Prefettura di Roma indica termini diversi in base alla durata del permesso: verifica sempre la pagina ufficiale.'],
                            ['title' => 'Prepara i documenti', 'text' => 'La documentazione cambia in base al tipo di permesso.'],
                            ['title' => 'Segui il canale ufficiale', 'text' => 'Segui le istruzioni pubblicate per il tuo specifico titolo di soggiorno.'],
                            ['title' => 'Conserva le ricevute', 'text' => 'Conserva domanda, ricevute e riferimenti dell’eventuale appuntamento o pratica.'],
                        ],
                        'where_to_apply' => 'Guida specifica per Roma. Le procedure locali possono cambiare nelle altre province.',
                        'how_to_book' => 'Controlla la pagina della Prefettura di Roma indicata come fonte per il canale aggiornato.',
                        'costs' => 'Costi e documenti dipendono dal tipo di permesso.',
                        'processing_time' => 'Non viene indicato un tempo generico di lavorazione perché dipende dalla pratica.',
                        'body' => 'La guida semplifica informazioni ufficiali e non sostituisce le istruzioni della Questura/Prefettura.',
                    ],
                ],
            ],
            [
                'slug' => 'patente-b-italia',
                'category' => 'driving',
                'italian_term' => 'Patente B',
                'source_name' => 'Ministero delle Infrastrutture e dei Trasporti',
                'source_url' => 'https://www.mit.gov.it/conseguimento-patente-b',
                'translations' => [
                    'ar' => [
                        'title' => 'الحصول على رخصة القيادة B في إيطاليا',
                        'summary' => 'شرح مبسط للمراحل الأساسية للحصول على Patente B وفق وزارة البنية التحتية والنقل الإيطالية.',
                        'what_is' => 'Patente B هي فئة رخصة القيادة الخاصة بالسيارات، ويعرض المصدر الرسمي شروط وإجراءات الامتحان النظري والعملي.',
                        'who_needs' => 'من يريد الحصول على رخصة القيادة B في إيطاليا.',
                        'required_documents' => ['طلب الحصول على الرخصة لدى Motorizzazione حسب الإجراء الرسمي', 'المستندات الشخصية والصحية المطلوبة وفق الحالة', 'المستندات الإضافية التي يحددها مكتب Motorizzazione'],
                        'steps' => [
                            ['title' => 'تحقق من السن والمتطلبات', 'text' => 'المصدر الرسمي يحدد الحد الأدنى لسن الحصول على Patente B بـ18 سنة.'],
                            ['title' => 'قدّم طلب الامتحان النظري', 'text' => 'تبدأ العملية لدى Ufficio Motorizzazione Civile وفق الإجراء الرسمي.'],
                            ['title' => 'اجتز النظري', 'text' => 'يمنح النجاح في النظري الأساس للانتقال إلى مرحلة foglio rosa وفق القواعد المنشورة.'],
                            ['title' => 'تدرّب ثم اجتز العملي', 'text' => 'بعد استيفاء الشروط، انتقل إلى امتحان القيادة العملي ضمن المدد والمحاولات المحددة رسميًا.'],
                        ],
                        'where_to_apply' => 'Ufficio Motorizzazione Civile المختص بالإجراء.',
                        'how_to_book' => 'راجع صفحة MIT الرسمية والإجراء الخاص بمكتب Motorizzazione الذي تتعامل معه.',
                        'costs' => 'لا نضع مبلغًا موحدًا هنا لأن الرسوم والخدمات الإضافية قد تعتمد على الإجراء ومقدم الخدمة.',
                        'processing_time' => 'يعتمد على المواعيد والمرحلة ومكتب Motorizzazione.',
                        'body' => 'وفق صفحة MIT، الحد الأدنى للسن هو 18 سنة. النظري له محاولتان خلال ستة أشهر، وبعد النجاح يتم إصدار foglio rosa؛ والعملي له حتى ثلاث محاولات ضمن المدة المحددة في المصدر. تحقق من صفحة MIT قبل الاعتماد على أي موعد أو عدد محاولات.',
                    ],
                    'en' => [
                        'title' => 'Getting an Italian category B driving licence',
                        'summary' => 'A simplified overview of the main steps for an Italian Patente B, based on the Ministry of Infrastructure and Transport.',
                        'what_is' => 'Patente B is the driving-licence category for cars. The official source describes the theory and practical examination process.',
                        'who_needs' => 'People who want to obtain a category B driving licence in Italy.',
                        'required_documents' => ['Application at the competent Motorizzazione office', 'Personal and medical documents required for the case', 'Any additional documents requested by the Motorizzazione office'],
                        'steps' => [
                            ['title' => 'Check eligibility', 'text' => 'The official source states a minimum age of 18 for Patente B.'],
                            ['title' => 'Submit the theory application', 'text' => 'The process starts with the competent Ufficio Motorizzazione Civile.'],
                            ['title' => 'Pass the theory test', 'text' => 'Passing the theory stage enables the foglio rosa stage under the published rules.'],
                            ['title' => 'Prepare for and take the practical test', 'text' => 'After meeting the requirements, take the practical driving test within the official validity and attempt rules.'],
                        ],
                        'where_to_apply' => 'The competent Ufficio Motorizzazione Civile.',
                        'how_to_book' => 'Check the MIT page and the current procedure of the Motorizzazione office handling your application.',
                        'costs' => 'No universal amount is stated here because fees and optional training services vary.',
                        'processing_time' => 'Depends on appointments, stage and the Motorizzazione office.',
                        'body' => 'The MIT page states a minimum age of 18. The theory stage allows two attempts within six months; after passing, the foglio rosa is issued, and the practical stage has up to three attempts within the official period. Always re-check MIT before relying on a deadline or attempt count.',
                    ],
                    'it' => [
                        'title' => 'Conseguire la Patente B in Italia',
                        'summary' => 'Panoramica semplificata dei passaggi principali per la Patente B, basata sul Ministero delle Infrastrutture e dei Trasporti.',
                        'what_is' => 'La Patente B è la categoria di patente per le autovetture. La fonte ufficiale descrive esame di teoria e prova pratica.',
                        'who_needs' => 'Chi vuole conseguire la Patente B in Italia.',
                        'required_documents' => ['Domanda presso l’Ufficio Motorizzazione competente', 'Documentazione personale e sanitaria richiesta', 'Eventuale documentazione aggiuntiva indicata dalla Motorizzazione'],
                        'steps' => [
                            ['title' => 'Verifica i requisiti', 'text' => 'La fonte ufficiale indica 18 anni come età minima per la Patente B.'],
                            ['title' => 'Presenta la domanda per la teoria', 'text' => 'La procedura parte dall’Ufficio Motorizzazione Civile competente.'],
                            ['title' => 'Supera la teoria', 'text' => 'Il superamento consente di accedere alla fase del foglio rosa secondo le regole pubblicate.'],
                            ['title' => 'Preparati alla prova pratica', 'text' => 'Dopo aver rispettato i requisiti, affronta la prova pratica nei termini ufficiali.'],
                        ],
                        'where_to_apply' => 'Ufficio Motorizzazione Civile competente.',
                        'how_to_book' => 'Controlla la pagina MIT e la procedura aggiornata dell’ufficio Motorizzazione competente.',
                        'costs' => 'Non viene indicato un costo unico perché tasse e servizi possono variare.',
                        'processing_time' => 'Dipende da appuntamenti, fase della pratica e ufficio.',
                        'body' => 'La pagina MIT indica 18 anni come età minima. La teoria prevede due tentativi in sei mesi; dopo il superamento viene rilasciato il foglio rosa e la prova pratica prevede fino a tre tentativi nel periodo ufficiale.',
                    ],
                ],
            ],
            [
                'slug' => 'spid-per-servizi-pubblici',
                'category' => 'documents',
                'italian_term' => 'SPID',
                'source_name' => 'INPS',
                'source_url' => 'https://www.inps.it/it/it/assistenza/spid---sistema-pubblico-di-identit--digitale.html',
                'translations' => [
                    'ar' => [
                        'title' => 'SPID: الهوية الرقمية للوصول إلى الخدمات',
                        'summary' => 'ما هو SPID وكيف تبدأ في استخدامه للوصول إلى الخدمات الحكومية والخدمات المعتمدة.',
                        'what_is' => 'SPID هو نظام هوية رقمية يسمح باستخدام الخدمات الإلكترونية للإدارة العامة والجهات الخاصة المعتمدة.',
                        'who_needs' => 'من يريد استخدام الخدمات الإلكترونية التي تقبل SPID.',
                        'required_documents' => ['عنوان بريد إلكتروني', 'رقم هاتف', 'وثيقة هوية سارية', 'Tessera Sanitaria أو Codice Fiscale وفق متطلبات مزود الهوية'],
                        'steps' => [
                            ['title' => 'اختر Identity Provider', 'text' => 'اختر أحد مزودي الهوية الرقمية المعتمدين.'],
                            ['title' => 'جهّز بياناتك', 'text' => 'تحتاج عادةً إلى بريد إلكتروني وهاتف ووثيقة هوية سارية، وتوضح INPS متطلبات المقيمين في إيطاليا.'],
                            ['title' => 'أكمل التحقق من الهوية', 'text' => 'اختر طريقة التعرف المتاحة لدى مزود الهوية واتبع تعليماته.'],
                            ['title' => 'استخدم SPID', 'text' => 'بعد التفعيل يمكنك استخدامه في الخدمات التي تدعم SPID.'],
                        ],
                        'where_to_apply' => 'يتم إنشاء SPID عبر Identity Provider معتمد، وليس عبر INPS مباشرة.',
                        'how_to_book' => 'طريقة التعرف تعتمد على مزود الهوية الذي تختاره.',
                        'costs' => 'قد تختلف الشروط والتكاليف حسب مزود الهوية وطريقة التعرف؛ تحقق من مزودك قبل التسجيل.',
                        'processing_time' => 'يختلف حسب مزود الهوية وطريقة التحقق.',
                        'body' => 'INPS يوضح أن SPID وCIE وCNS من أنظمة الدخول المقبولة لخدماته. لا تخلط بين إنشاء SPID وبين حساب INPS نفسه.',
                    ],
                    'en' => [
                        'title' => 'SPID: digital identity for public services',
                        'summary' => 'What SPID is and how to start using it for public and accredited private online services.',
                        'what_is' => 'SPID is a digital identity system used to access Italian public-administration services and accredited private services.',
                        'who_needs' => 'People who need online services that accept SPID.',
                        'required_documents' => ['Email address', 'Phone number', 'Valid identity document', 'Health card or tax code as required by the identity provider'],
                        'steps' => [
                            ['title' => 'Choose an identity provider', 'text' => 'Select an accredited SPID identity provider.'],
                            ['title' => 'Prepare your details', 'text' => 'INPS lists email, phone, valid identity document and health card/tax code among the requirements for residents in Italy.'],
                            ['title' => 'Complete identity verification', 'text' => 'Use one of the recognition methods offered by your provider.'],
                            ['title' => 'Use SPID', 'text' => 'After activation, use it on services that support SPID.'],
                        ],
                        'where_to_apply' => 'SPID is issued through an accredited identity provider, not directly by INPS.',
                        'how_to_book' => 'Recognition options depend on the provider.',
                        'costs' => 'Terms and costs can vary by provider and recognition method.',
                        'processing_time' => 'Depends on the provider and recognition method.',
                        'body' => 'INPS lists SPID, CIE and CNS among the accepted access methods. Creating a SPID identity is separate from creating an INPS account.',
                    ],
                    'it' => [
                        'title' => 'SPID: identità digitale per i servizi online',
                        'summary' => 'Cos’è SPID e come iniziare a usarlo per i servizi pubblici e privati accreditati.',
                        'what_is' => 'SPID è il sistema di identità digitale per accedere ai servizi online della Pubblica Amministrazione e dei privati accreditati.',
                        'who_needs' => 'Chi deve usare servizi online che accettano SPID.',
                        'required_documents' => ['Indirizzo email', 'Numero di telefono', 'Documento di identità valido', 'Tessera sanitaria o codice fiscale secondo il gestore'],
                        'steps' => [
                            ['title' => 'Scegli un gestore', 'text' => 'Scegli un Identity Provider accreditato.'],
                            ['title' => 'Prepara i dati', 'text' => 'INPS indica email, telefono, documento valido e tessera sanitaria/codice fiscale tra i requisiti per i residenti in Italia.'],
                            ['title' => 'Completa il riconoscimento', 'text' => 'Segui una delle modalità offerte dal gestore.'],
                            ['title' => 'Usa SPID', 'text' => 'Dopo l’attivazione puoi accedere ai servizi che lo supportano.'],
                        ],
                        'where_to_apply' => 'SPID viene attivato tramite un Identity Provider accreditato.',
                        'how_to_book' => 'Le modalità di riconoscimento dipendono dal gestore.',
                        'costs' => 'Condizioni e costi possono variare in base al gestore.',
                        'processing_time' => 'Dipende dal gestore e dalla modalità di riconoscimento.',
                        'body' => 'INPS indica SPID, CIE e CNS tra i sistemi di accesso accettati. L’identità SPID è distinta dal rapporto con INPS.',
                    ],
                ],
            ],
            [
                'slug' => 'cie-carta-identita-elettronica',
                'category' => 'documents',
                'italian_term' => 'Carta d’identità elettronica (CIE)',
                'source_name' => 'Ministero dell’Interno — Carta d’Identità Elettronica',
                'source_url' => 'https://www.cartaidentita.interno.gov.it/richiedi/',
                'translations' => [
                    'ar' => [
                        'title' => 'بطاقة الهوية الإلكترونية CIE',
                        'summary' => 'كيف وأين تطلب Carta d’Identità Elettronica وفق بوابة وزارة الداخلية.',
                        'what_is' => 'CIE هي بطاقة هوية إلكترونية تصدر في إيطاليا، ويمكن استخدامها أيضًا كوسيلة للتعرف الرقمي في خدمات متعددة.',
                        'who_needs' => 'من يحتاج إلى إصدار أو تجديد بطاقة الهوية الإلكترونية وفق حالته.',
                        'required_documents' => ['وثيقة الهوية أو المستندات التي يطلبها Comune', 'أي مستندات إضافية يحددها مكتب البلدية', 'موعد إذا كان Comune يستخدم الحجز المسبق'],
                        'steps' => [
                            ['title' => 'حدد البلدية', 'text' => 'يمكن طلب CIE في Comune وفق القنوات المتاحة، وتوضح البوابة الرسمية خيارات الحجز.'],
                            ['title' => 'احجز إذا لزم', 'text' => 'بعض البلديات المشاركة توفر الحجز الإلكتروني.'],
                            ['title' => 'قدّم الطلب', 'text' => 'قدّم الطلب لدى البلدية واتبع تعليمات التحقق والبيانات المطلوبة.'],
                            ['title' => 'استلم البطاقة', 'text' => 'توضح البوابة الرسمية خيارات تسليم CIE بعد إصدارها.'],
                        ],
                        'where_to_apply' => 'Comune di residenza أو domicilio وفق الشروط والقنوات المنشورة رسميًا.',
                        'how_to_book' => 'الحجز يعتمد على البلدية؛ استخدم خدمة الحجز الرسمية إذا كانت متاحة.',
                        'costs' => 'البوابة الرسمية تذكر تكلفة أساسية قدرها 16.79 يورو، وقد تزيد في بعض البلديات بسبب رسوم محلية.',
                        'processing_time' => 'يعتمد على إجراءات الإصدار والتسليم؛ راجع البوابة الرسمية والبلدية.',
                        'body' => 'توضح بوابة CIE الرسمية إمكانية الطلب في Comune di residenza أو domicilio، مع وجود حجز إلكتروني في البلديات المشاركة. تحقق من تعليمات بلديتك قبل الذهاب.',
                    ],
                    'en' => [
                        'title' => 'CIE — Italian electronic identity card',
                        'summary' => 'How and where to request the Carta d’Identità Elettronica according to the Ministry of Interior portal.',
                        'what_is' => 'The CIE is Italy’s electronic identity card and can also be used for digital authentication with supported services.',
                        'who_needs' => 'People who need to request or renew an electronic identity card.',
                        'required_documents' => ['Identity document or documents requested by the Comune', 'Any additional documents requested by the municipality', 'An appointment where the municipality uses advance booking'],
                        'steps' => [
                            ['title' => 'Identify the municipality', 'text' => 'Use the official CIE portal and your Comune’s instructions.'],
                            ['title' => 'Book if required', 'text' => 'Participating municipalities may offer online appointment booking.'],
                            ['title' => 'Submit the request', 'text' => 'Attend the municipality and follow its identification and data-collection procedure.'],
                            ['title' => 'Receive the card', 'text' => 'The official portal lists delivery options after issuance.'],
                        ],
                        'where_to_apply' => 'Your Comune of residence or domicile, according to the applicable procedure.',
                        'how_to_book' => 'Booking depends on the municipality; use its official booking channel when available.',
                        'costs' => 'The official portal lists a fixed base cost of €16.79; some municipalities may add local fees.',
                        'processing_time' => 'Depends on issuance and delivery; check the official portal and municipality.',
                        'body' => 'The official CIE portal states that the card can be requested at a Comune of residence or domicile and that participating municipalities may provide online booking.',
                    ],
                    'it' => [
                        'title' => 'CIE — Carta d’Identità Elettronica',
                        'summary' => 'Come e dove richiedere la CIE secondo il portale ufficiale del Ministero dell’Interno.',
                        'what_is' => 'La CIE è la carta d’identità elettronica italiana e può essere utilizzata anche per l’autenticazione digitale nei servizi supportati.',
                        'who_needs' => 'Chi deve richiedere o rinnovare una carta d’identità elettronica.',
                        'required_documents' => ['Documento di identità o documentazione richiesta dal Comune', 'Eventuali documenti aggiuntivi indicati dal Comune', 'Appuntamento se previsto'],
                        'steps' => [
                            ['title' => 'Individua il Comune', 'text' => 'Controlla il portale CIE e le istruzioni del tuo Comune.'],
                            ['title' => 'Prenota se necessario', 'text' => 'I Comuni aderenti possono offrire la prenotazione online.'],
                            ['title' => 'Presenta la richiesta', 'text' => 'Vai in Comune e segui la procedura di identificazione e raccolta dati.'],
                            ['title' => 'Ricevi la carta', 'text' => 'Il portale ufficiale indica le modalità di consegna disponibili.'],
                        ],
                        'where_to_apply' => 'Comune di residenza o domicilio secondo la procedura applicabile.',
                        'how_to_book' => 'Le modalità di prenotazione dipendono dal Comune.',
                        'costs' => 'Il portale ufficiale indica un costo fisso base di €16,79; alcuni Comuni possono aggiungere diritti locali.',
                        'processing_time' => 'Dipende da emissione e consegna.',
                        'body' => 'Il portale ufficiale CIE indica la possibilità di richiedere la carta presso il Comune di residenza o domicilio e la prenotazione online nei Comuni aderenti.',
                    ],
                ],
            ],
            [
                'slug' => 'ssn-cittadini-stranieri',
                'category' => 'healthcare',
                'italian_term' => 'Servizio Sanitario Nazionale (SSN)',
                'source_name' => 'Ministero della Salute',
                'source_url' => 'https://www.salute.gov.it/new/it/faq/faq-cittadini-stranieri-con-regolare-permesso-di-soggiorno-che-non-appartengono-ai-paesi/',
                'translations' => [
                    'ar' => [
                        'title' => 'التسجيل في النظام الصحي SSN للأجانب',
                        'summary' => 'معلومات أساسية من وزارة الصحة الإيطالية عن تسجيل بعض المقيمين الأجانب في SSN.',
                        'what_is' => 'SSN هو النظام الصحي الوطني الإيطالي. شروط التسجيل تختلف حسب وضع الإقامة وسببها.',
                        'who_needs' => 'الأجانب المقيمون بشكل قانوني الذين يريدون معرفة طريقة التسجيل الصحي حسب نوع تصريحهم.',
                        'required_documents' => ['Permesso di soggiorno أو إيصال طلب الإصدار/التجديد، حسب الحالة', 'وثيقة هوية', 'Codice Fiscale', 'إثبات الإقامة أو dichiarazione di effettiva dimora حسب الحالة'],
                        'steps' => [
                            ['title' => 'حدد وضعك', 'text' => 'نوع تصريح الإقامة وسبب الإقامة يحددان نوع التسجيل والوثائق المطلوبة.'],
                            ['title' => 'جهّز الوثائق', 'text' => 'وزارة الصحة تذكر مجموعة من الوثائق تختلف حسب الحالة، ومنها تصريح الإقامة أو إيصال الطلب والهوية وCodice Fiscale.'],
                            ['title' => 'توجه إلى الجهة الصحية المختصة', 'text' => 'تتم إجراءات التسجيل لدى ASL المختصة بحسب محل الإقامة أو الوجود الفعلي وفق الحالة.'],
                            ['title' => 'اختر طبيب الأسرة عند استحقاق ذلك', 'text' => 'بعد التسجيل، يمكن اختيار طبيب الأسرة أو طبيب الأطفال وفق النظام المحلي.'],
                        ],
                        'where_to_apply' => 'ASL المختصة حسب محل الإقامة أو الوجود الفعلي.',
                        'how_to_book' => 'طرق الحجز أو المواعيد تختلف حسب ASL.',
                        'costs' => 'تختلف بحسب نوع التسجيل. بعض أوضاع الإقامة لها تسجيل إلزامي، وبعضها اختياري وشروطه مختلفة.',
                        'processing_time' => 'يعتمد على ASL والحالة.',
                        'body' => 'وزارة الصحة تذكر أن مدة التسجيل الإلزامي ترتبط في بعض الحالات بمدة تصريح الإقامة. لا تستخدم هذه الصفحة لتحديد استحقاقك النهائي إذا كان وضعك مختلفًا عن الحالات المذكورة في المصدر.',
                    ],
                    'en' => [
                        'title' => 'SSN registration for foreign residents',
                        'summary' => 'Key information from the Italian Ministry of Health on SSN registration for certain foreign residents.',
                        'what_is' => 'The SSN is Italy’s National Health Service. Registration rules depend on residence status and the reason for stay.',
                        'who_needs' => 'Lawfully resident foreign nationals checking how to register according to their permit type.',
                        'required_documents' => ['Residence permit or application/renewal receipt as applicable', 'Identity document', 'Tax code', 'Residence self-declaration or effective-domicile declaration as applicable'],
                        'steps' => [
                            ['title' => 'Identify your status', 'text' => 'The permit type and reason for stay determine the registration route and documents.'],
                            ['title' => 'Prepare the documents', 'text' => 'The Ministry lists documents that vary by case, including permit/receipt, identity document and tax code.'],
                            ['title' => 'Contact the competent ASL', 'text' => 'Registration is handled by the competent local health authority according to the case.'],
                            ['title' => 'Choose a doctor where applicable', 'text' => 'After registration, a family doctor or paediatrician can be selected under the applicable local process.'],
                        ],
                        'where_to_apply' => 'The competent ASL according to residence or effective domicile, as applicable.',
                        'how_to_book' => 'Appointment procedures vary by ASL.',
                        'costs' => 'Depend on the type of registration; some statuses are mandatory and others voluntary.',
                        'processing_time' => 'Depends on the ASL and case.',
                        'body' => 'The Ministry of Health notes that in some cases compulsory registration lasts for the same period as the residence permit. Check the official FAQ for your exact status.',
                    ],
                    'it' => [
                        'title' => 'Iscrizione al SSN per cittadini stranieri',
                        'summary' => 'Informazioni di base del Ministero della Salute sull’iscrizione al SSN per alcuni cittadini stranieri.',
                        'what_is' => 'Il SSN è il Servizio Sanitario Nazionale. Le regole di iscrizione dipendono dal titolo e dal motivo del soggiorno.',
                        'who_needs' => 'Cittadini stranieri regolarmente soggiornanti che vogliono capire il percorso di iscrizione in base alla propria situazione.',
                        'required_documents' => ['Permesso di soggiorno o ricevuta di richiesta/rinnovo, quando previsto', 'Documento di identità', 'Codice fiscale', 'Autocertificazione di residenza o dichiarazione di effettiva dimora, quando prevista'],
                        'steps' => [
                            ['title' => 'Individua la tua situazione', 'text' => 'Il tipo di permesso e il motivo del soggiorno determinano percorso e documenti.'],
                            ['title' => 'Prepara i documenti', 'text' => 'Il Ministero indica documenti diversi a seconda del caso.'],
                            ['title' => 'Rivolgiti alla ASL competente', 'text' => 'La procedura viene gestita dalla ASL competente secondo la situazione dell’interessato.'],
                            ['title' => 'Scegli il medico quando previsto', 'text' => 'Dopo l’iscrizione è possibile scegliere il medico di medicina generale o il pediatra secondo le regole applicabili.'],
                        ],
                        'where_to_apply' => 'ASL competente in base a residenza o dimora effettiva, quando previsto.',
                        'how_to_book' => 'Le modalità di prenotazione dipendono dalla ASL.',
                        'costs' => 'Dipendono dal tipo di iscrizione.',
                        'processing_time' => 'Dipende dalla ASL e dal caso.',
                        'body' => 'Il Ministero della Salute precisa che in alcune situazioni l’iscrizione obbligatoria ha durata collegata al permesso di soggiorno. Verifica sempre la FAQ ufficiale per la tua situazione.',
                    ],
                ],
            ],
            [
                'slug' => 'accesso-servizi-inps',
                'category' => 'daily_life',
                'italian_term' => 'Accesso ai servizi INPS',
                'source_name' => 'INPS',
                'source_url' => 'https://www.inps.it/it/it/assistenza/le-credenziali-per-accedere-ai-servizi.html',
                'translations' => [
                    'ar' => [
                        'title' => 'كيف تدخل إلى خدمات INPS أونلاين',
                        'summary' => 'طرق الدخول الحالية إلى خدمات INPS باستخدام الهوية الرقمية.',
                        'what_is' => 'INPS يتيح الوصول إلى خدماته الإلكترونية باستخدام SPID أو CIE أو CNS، مع استثناءات محدودة موضحة رسميًا للمقيمين بالخارج.',
                        'who_needs' => 'من يريد استخدام خدمات INPS الإلكترونية.',
                        'required_documents' => ['SPID أو CIE أو CNS', 'المتطلبات الخاصة بطريقة الدخول التي اخترتها'],
                        'steps' => [
                            ['title' => 'اختر وسيلة الدخول', 'text' => 'INPS يذكر SPID وCIE وCNS كأنظمة مصادقة مقبولة حاليًا.'],
                            ['title' => 'جهّز وسيلة المصادقة', 'text' => 'تأكد أن حساب SPID أو CIE أو CNS يعمل قبل بدء الخدمة.'],
                            ['title' => 'ادخل إلى MyINPS', 'text' => 'اختر وسيلة الدخول المناسبة من صفحة المصادقة الرسمية.'],
                            ['title' => 'استخدم الخدمة', 'text' => 'بعد الدخول، ابحث عن الخدمة المطلوبة داخل بوابة INPS.'],
                        ],
                        'where_to_apply' => 'بوابة INPS الإلكترونية.',
                        'how_to_book' => 'عادة لا تحتاج إلى موعد لإنشاء جلسة الدخول، لكن بعض الخدمات نفسها قد تتطلب إجراءً أو موعدًا.',
                        'costs' => 'طريقة الدخول نفسها ليست خدمة مدفوعة من INPS؛ قد تكون هناك شروط أو تكاليف لدى مزود خارجي لـSPID.',
                        'processing_time' => 'يعتمد على الخدمة التي تستخدمها بعد تسجيل الدخول.',
                        'body' => 'توضح INPS أن أنظمة الدخول المقبولة حاليًا تشمل SPID وCIE وCNS. المقيمون بالخارج دون وثيقة هوية إيطالية لديهم استثناء خاص بالـPIN وفق الصفحة الرسمية.',
                    ],
                    'en' => [
                        'title' => 'How to access INPS online services',
                        'summary' => 'Current ways to authenticate to INPS online services.',
                        'what_is' => 'INPS currently accepts SPID, CIE and CNS for online authentication, with a limited PIN exception for certain residents abroad.',
                        'who_needs' => 'Anyone who needs to use INPS online services.',
                        'required_documents' => ['SPID, CIE or CNS', 'The credentials or device required by the selected method'],
                        'steps' => [
                            ['title' => 'Choose an access method', 'text' => 'INPS lists SPID, CIE and CNS among its currently accepted authentication systems.'],
                            ['title' => 'Prepare authentication', 'text' => 'Make sure your selected SPID/CIE/CNS method is active.'],
                            ['title' => 'Open MyINPS', 'text' => 'Use the official INPS authentication page.'],
                            ['title' => 'Open the required service', 'text' => 'After signing in, find the service you need in the INPS portal.'],
                        ],
                        'where_to_apply' => 'INPS online portal.',
                        'how_to_book' => 'Authentication itself normally does not require an appointment, although individual services may have their own procedures.',
                        'costs' => 'INPS does not charge for the authentication page; an external SPID provider may have its own terms.',
                        'processing_time' => 'Depends on the service used after login.',
                        'body' => 'INPS lists SPID, CIE and CNS as current authentication systems. A limited PIN exception applies to residents abroad without an Italian identity document.',
                    ],
                    'it' => [
                        'title' => 'Come accedere ai servizi INPS online',
                        'summary' => 'Le modalità attuali di autenticazione ai servizi online INPS.',
                        'what_is' => 'INPS accetta attualmente SPID, CIE e CNS per l’accesso ai servizi online, con una limitata eccezione PIN per alcuni residenti all’estero.',
                        'who_needs' => 'Chi deve utilizzare i servizi online INPS.',
                        'required_documents' => ['SPID, CIE o CNS', 'Credenziali o dispositivo richiesti dalla modalità scelta'],
                        'steps' => [
                            ['title' => 'Scegli il metodo', 'text' => 'INPS indica SPID, CIE e CNS tra i sistemi di autenticazione accettati.'],
                            ['title' => 'Prepara l’autenticazione', 'text' => 'Verifica che il metodo scelto sia attivo.'],
                            ['title' => 'Apri MyINPS', 'text' => 'Utilizza la pagina ufficiale di autenticazione INPS.'],
                            ['title' => 'Apri il servizio', 'text' => 'Dopo l’accesso cerca il servizio necessario nel portale INPS.'],
                        ],
                        'where_to_apply' => 'Portale online INPS.',
                        'how_to_book' => 'L’autenticazione non richiede normalmente un appuntamento, ma singoli servizi possono avere procedure proprie.',
                        'costs' => 'INPS non applica un costo per l’autenticazione; un gestore SPID esterno può avere proprie condizioni.',
                        'processing_time' => 'Dipende dal servizio utilizzato.',
                        'body' => 'INPS indica SPID, CIE e CNS come sistemi di autenticazione attualmente accettati. Esiste una specifica eccezione PIN per alcuni residenti all’estero.',
                    ],
                ],
            ],
            [
                'slug' => 'universitaly-studenti-stranieri',
                'category' => 'study',
                'italian_term' => 'Universitaly — Studenti stranieri',
                'source_name' => 'Universitaly',
                'source_url' => 'https://www.universitaly.it/en/studenti-stranieri',
                'translations' => [
                    'ar' => [
                        'title' => 'الطلاب الأجانب: التقديم للدراسة في إيطاليا',
                        'summary' => 'نقطة بداية رسمية للطلاب الدوليين لفهم إجراءات ما قبل التسجيل والتأشيرة.',
                        'what_is' => 'Universitaly هي البوابة الرسمية التي تنشر إجراءات ومعلومات للطلاب الدوليين، بما في ذلك pre-enrolment لبعض مسارات الدراسة.',
                        'who_needs' => 'الطلاب الدوليون الذين يخططون للدراسة في مؤسسة تعليم عالٍ في إيطاليا.',
                        'required_documents' => ['وثائق الهوية', 'وثائق الدراسة والمؤهلات المطلوبة من الجامعة', 'المستندات التي تطلبها المؤسسة أو القنصلية حسب الحالة'],
                        'steps' => [
                            ['title' => 'اختر البرنامج والجامعة', 'text' => 'ابدأ بمتطلبات الجامعة والبرنامج، ثم راجع الإجراءات المنشورة على Universitaly.'],
                            ['title' => 'أكمل pre-enrolment عندما يكون مطلوبًا', 'text' => 'اتبع المسار الرسمي المطبق على برنامجك وسنة القبول.'],
                            ['title' => 'تابع الجامعة', 'text' => 'تحقق من قبول الجامعة ومتطلبات التسجيل النهائية؛ التحقق من pre-enrolment لا يضمن موعد التأشيرة أو منحها.'],
                            ['title' => 'قدّم طلب التأشيرة عند انطباقه', 'text' => 'قرار منح تأشيرة الدراسة يعود حصريًا للبعثة الدبلوماسية أو القنصلية المختصة.'],
                        ],
                        'where_to_apply' => 'Universitaly للخطوات الرقمية ذات الصلة، والجامعة والبعثة القنصلية للخطوات الخاصة بهما.',
                        'how_to_book' => 'مواعيد القنصلية تعتمد على البعثة المختصة، ولا تضمنها عملية pre-enrolment.',
                        'costs' => 'تختلف حسب الجامعة والبرنامج والتأشيرة والخدمات ذات الصلة.',
                        'processing_time' => 'تختلف حسب الجامعة والبعثة والموسم الدراسي.',
                        'body' => 'الصفحة الرسمية تذكر أن الإجراءات المعروضة صالحة للأعوام الأكاديمية 2026/27 و2027/28، وأن القرار النهائي بشأن تأشيرة الدراسة من اختصاص البعثة الدبلوماسية أو القنصلية.',
                    ],
                    'en' => [
                        'title' => 'International students: studying in Italy',
                        'summary' => 'An official starting point for international students navigating pre-enrolment and study-visa procedures.',
                        'what_is' => 'Universitaly is the official portal providing procedures and information for international students, including pre-enrolment where applicable.',
                        'who_needs' => 'International students planning to study at an Italian higher-education institution.',
                        'required_documents' => ['Identity documents', 'Academic qualifications required by the university', 'Documents requested by the university or consular authority as applicable'],
                        'steps' => [
                            ['title' => 'Choose a programme and university', 'text' => 'Start with the university’s programme requirements and then check the applicable Universitaly procedure.'],
                            ['title' => 'Complete pre-enrolment when required', 'text' => 'Follow the official path applicable to your programme and academic year.'],
                            ['title' => 'Follow the university process', 'text' => 'Pre-enrolment validation does not guarantee a visa appointment or visa issuance.'],
                            ['title' => 'Apply for the study visa when applicable', 'text' => 'The final decision on a study visa is made exclusively by the competent diplomatic or consular mission.'],
                        ],
                        'where_to_apply' => 'Universitaly for relevant online steps, plus the university and competent consular mission for their respective steps.',
                        'how_to_book' => 'Consular appointments depend on the competent mission and are not guaranteed by pre-enrolment.',
                        'costs' => 'Vary by university, programme, visa and related services.',
                        'processing_time' => 'Varies by university, consular mission and academic cycle.',
                        'body' => 'The official page states that the described procedures apply to academic years 2026/27 and 2027/28 and that the final study-visa decision belongs exclusively to the diplomatic/consular mission.',
                    ],
                    'it' => [
                        'title' => 'Studenti stranieri: studiare in Italia',
                        'summary' => 'Punto di partenza ufficiale per studenti internazionali su pre-iscrizione e visto per studio.',
                        'what_is' => 'Universitaly è il portale ufficiale con procedure e informazioni per studenti internazionali, compresa la pre-iscrizione quando prevista.',
                        'who_needs' => 'Studenti internazionali che intendono studiare presso un istituto di istruzione superiore in Italia.',
                        'required_documents' => ['Documenti di identità', 'Titoli e documentazione richiesti dall’università', 'Documenti richiesti dall’università o dalla sede consolare secondo il caso'],
                        'steps' => [
                            ['title' => 'Scegli corso e università', 'text' => 'Parti dai requisiti dell’università e verifica la procedura applicabile su Universitaly.'],
                            ['title' => 'Completa la pre-iscrizione quando richiesta', 'text' => 'Segui la procedura prevista per il corso e l’anno accademico.'],
                            ['title' => 'Segui la procedura dell’università', 'text' => 'La validazione della pre-iscrizione non garantisce un appuntamento o il rilascio del visto.'],
                            ['title' => 'Richiedi il visto quando necessario', 'text' => 'La decisione finale sul visto per studio spetta esclusivamente alla rappresentanza diplomatica/consolare competente.'],
                        ],
                        'where_to_apply' => 'Universitaly per le procedure online previste, oltre a università e sede consolare per le rispettive fasi.',
                        'how_to_book' => 'Gli appuntamenti consolari dipendono dalla sede competente.',
                        'costs' => 'Variano in base a università, corso, visto e servizi collegati.',
                        'processing_time' => 'Dipende da università, sede consolare e ciclo di ammissione.',
                        'body' => 'La pagina ufficiale indica che le procedure descritte valgono per gli anni accademici 2026/27 e 2027/28 e che la decisione finale sul visto spetta alla rappresentanza diplomatica o consolare.',
                    ],
                ],
            ],
        ];
    }

    private function services(): array
    {
        return [
            [
                'slug' => 'permesso-di-soggiorno-roma',
                'domain' => 'immigration',
                'italian_term' => 'Permesso di soggiorno',
                'guide_slug' => 'permesso-di-soggiorno-rinnovo-roma',
                'region' => 'lazio',
                'city' => 'roma',
                'source_name' => 'Prefettura di Roma',
                'source_url' => 'https://prefettura.interno.gov.it/it/prefetture/roma/permessi-questura',
                'translations' => [
                    'ar' => ['name' => 'تصريح الإقامة — روما', 'summary' => 'معلومات رسمية عن إجراءات تصريح الإقامة في روما.', 'how_to_apply' => 'راجع صفحة Prefettura di Roma واختر الإجراء المطابق لنوع تصريحك.', 'required_documents' => ['المستندات تختلف حسب نوع التصريح', 'جواز سفر/وثيقة سفر', 'صور ومستندات الطلب وفق الحالة'], 'notes' => 'EXPA يشرح المعلومات ولا يقدم الطلب نيابة عنك.'],
                    'en' => ['name' => 'Residence permit — Rome', 'summary' => 'Official information hub for residence-permit procedures in Rome.', 'how_to_apply' => 'Use the cited Prefettura di Roma page and select the procedure matching your permit type.', 'required_documents' => ['Documents vary by permit type', 'Passport/travel document', 'Application-specific photos and documents'], 'notes' => 'EXPA explains the procedure but does not submit applications for you.'],
                    'it' => ['name' => 'Permesso di soggiorno — Roma', 'summary' => 'Punto informativo ufficiale per le procedure del permesso di soggiorno a Roma.', 'how_to_apply' => 'Consulta la pagina della Prefettura di Roma e scegli la procedura relativa al tuo titolo.', 'required_documents' => ['Documenti variabili in base al titolo', 'Passaporto/documento di viaggio', 'Foto e documenti richiesti dalla pratica'], 'notes' => 'EXPA spiega le informazioni ma non presenta la domanda al posto tuo.'],
                ],
            ],
            [
                'slug' => 'patente-b-motorizzazione',
                'domain' => 'transport',
                'italian_term' => 'Patente B',
                'guide_slug' => 'patente-b-italia',
                'source_name' => 'Ministero delle Infrastrutture e dei Trasporti',
                'source_url' => 'https://www.mit.gov.it/conseguimento-patente-b',
                'translations' => [
                    'ar' => ['name' => 'الحصول على Patente B', 'summary' => 'المعلومات الرسمية لبدء مسار رخصة B.', 'how_to_apply' => 'ابدأ من Ufficio Motorizzazione Civile المختص واتبع صفحة MIT.', 'required_documents' => ['مستندات شخصية وصحية وفق الحالة', 'طلب الرخصة', 'أي مستندات يطلبها المكتب'], 'notes' => 'تحقق من MIT قبل الاعتماد على المواعيد أو القواعد.'],
                    'en' => ['name' => 'Patente B application', 'summary' => 'Official starting information for the category B licence process.', 'how_to_apply' => 'Start with the competent Ufficio Motorizzazione Civile and follow the MIT procedure.', 'required_documents' => ['Personal and medical documents as applicable', 'Licence application', 'Any documents requested by the office'], 'notes' => 'Re-check MIT before relying on deadlines or exam rules.'],
                    'it' => ['name' => 'Conseguimento Patente B', 'summary' => 'Informazioni ufficiali per iniziare il percorso della patente B.', 'how_to_apply' => 'Rivolgiti all’Ufficio Motorizzazione Civile competente e segui la procedura MIT.', 'required_documents' => ['Documenti personali e sanitari secondo il caso', 'Domanda', 'Eventuale documentazione richiesta'], 'notes' => 'Verifica sempre MIT prima di fare affidamento su scadenze o regole d’esame.'],
                ],
            ],
            [
                'slug' => 'spid-identita-digitale',
                'domain' => 'identity',
                'italian_term' => 'SPID',
                'guide_slug' => 'spid-per-servizi-pubblici',
                'source_name' => 'INPS',
                'source_url' => 'https://www.inps.it/it/it/assistenza/spid---sistema-pubblico-di-identit--digitale.html',
                'translations' => [
                    'ar' => ['name' => 'SPID', 'summary' => 'هوية رقمية للوصول إلى الخدمات الإلكترونية.', 'how_to_apply' => 'اختر Identity Provider معتمدًا وأكمل التحقق.', 'required_documents' => ['بريد إلكتروني', 'هاتف', 'وثيقة هوية', 'Tessera Sanitaria/Codice Fiscale وفق المزود'], 'notes' => 'SPID ليس حساب INPS بحد ذاته.'],
                    'en' => ['name' => 'SPID', 'summary' => 'Digital identity for online services.', 'how_to_apply' => 'Choose an accredited identity provider and complete identity verification.', 'required_documents' => ['Email', 'Phone', 'Identity document', 'Health card/tax code as required'], 'notes' => 'SPID is not itself an INPS account.'],
                    'it' => ['name' => 'SPID', 'summary' => 'Identità digitale per i servizi online.', 'how_to_apply' => 'Scegli un Identity Provider accreditato e completa il riconoscimento.', 'required_documents' => ['Email', 'Telefono', 'Documento di identità', 'Tessera sanitaria/codice fiscale secondo il gestore'], 'notes' => 'SPID non coincide con un account INPS.'],
                ],
            ],
            [
                'slug' => 'cie-carta-identita',
                'domain' => 'identity',
                'italian_term' => 'CIE',
                'guide_slug' => 'cie-carta-identita-elettronica',
                'source_name' => 'Ministero dell’Interno — Carta d’Identità Elettronica',
                'source_url' => 'https://www.cartaidentita.interno.gov.it/richiedi/',
                'translations' => [
                    'ar' => ['name' => 'Carta d’Identità Elettronica (CIE)', 'summary' => 'خدمة طلب أو تجديد بطاقة الهوية الإلكترونية.', 'how_to_apply' => 'راجع بوابة CIE الرسمية وتعليمات Comune.', 'required_documents' => ['وثيقة هوية', 'المستندات التي يطلبها Comune', 'موعد إذا كان مطلوبًا'], 'notes' => 'المواعيد والقنوات تختلف حسب البلدية.'],
                    'en' => ['name' => 'Carta d’Identità Elettronica (CIE)', 'summary' => 'Service information for requesting or renewing the electronic identity card.', 'how_to_apply' => 'Check the official CIE portal and your Comune instructions.', 'required_documents' => ['Identity document', 'Documents requested by the Comune', 'Appointment if required'], 'notes' => 'Booking channels vary by municipality.'],
                    'it' => ['name' => 'Carta d’Identità Elettronica (CIE)', 'summary' => 'Informazioni per richiedere o rinnovare la CIE.', 'how_to_apply' => 'Consulta il portale CIE ufficiale e le istruzioni del Comune.', 'required_documents' => ['Documento di identità', 'Documenti richiesti dal Comune', 'Appuntamento se previsto'], 'notes' => 'Le modalità di prenotazione variano da Comune a Comune.'],
                ],
            ],
            [
                'slug' => 'iscrizione-ssn-stranieri',
                'domain' => 'health',
                'italian_term' => 'Iscrizione al SSN',
                'guide_slug' => 'ssn-cittadini-stranieri',
                'source_name' => 'Ministero della Salute',
                'source_url' => 'https://www.salute.gov.it/new/it/faq/faq-cittadini-stranieri-con-regolare-permesso-di-soggiorno-che-non-appartengono-ai-paesi/',
                'translations' => [
                    'ar' => ['name' => 'التسجيل في SSN', 'summary' => 'معلومات عن التسجيل الصحي للأجانب حسب نوع الإقامة.', 'how_to_apply' => 'راجع حالتك ثم توجه إلى ASL المختصة.', 'required_documents' => ['Permesso أو إيصال الطلب حسب الحالة', 'وثيقة هوية', 'Codice Fiscale', 'إثبات الإقامة/الوجود الفعلي حسب الحالة'], 'notes' => 'الاستحقاق والتسجيل يختلفان حسب وضع الإقامة.'],
                    'en' => ['name' => 'SSN registration', 'summary' => 'Health-service registration information for foreign residents.', 'how_to_apply' => 'Check your status and contact the competent ASL.', 'required_documents' => ['Permit/receipt as applicable', 'Identity document', 'Tax code', 'Residence/effective-domicile declaration as applicable'], 'notes' => 'Eligibility and registration route depend on residence status.'],
                    'it' => ['name' => 'Iscrizione al SSN', 'summary' => 'Informazioni sull’iscrizione sanitaria per cittadini stranieri.', 'how_to_apply' => 'Verifica la tua situazione e rivolgiti alla ASL competente.', 'required_documents' => ['Permesso/ricevuta secondo il caso', 'Documento di identità', 'Codice fiscale', 'Autocertificazione secondo il caso'], 'notes' => 'Requisiti e percorso dipendono dal titolo di soggiorno.'],
                ],
            ],
            [
                'slug' => 'accesso-servizi-inps-spid-cie-cns',
                'domain' => 'social_security',
                'italian_term' => 'Accesso ai servizi INPS',
                'guide_slug' => 'accesso-servizi-inps',
                'source_name' => 'INPS',
                'source_url' => 'https://www.inps.it/it/it/assistenza/le-credenziali-per-accedere-ai-servizi.html',
                'translations' => [
                    'ar' => ['name' => 'الدخول إلى خدمات INPS', 'summary' => 'الوصول إلى خدمات INPS عبر SPID أو CIE أو CNS.', 'how_to_apply' => 'افتح صفحة المصادقة الرسمية واختر وسيلة الدخول.', 'required_documents' => ['SPID أو CIE أو CNS', 'بيانات/جهاز المصادقة المطلوب'], 'notes' => 'يوجد استثناء محدود للـPIN لبعض المقيمين بالخارج.'],
                    'en' => ['name' => 'INPS online access', 'summary' => 'Access INPS services using SPID, CIE or CNS.', 'how_to_apply' => 'Open the official authentication page and select your access method.', 'required_documents' => ['SPID, CIE or CNS', 'Credentials/device required by the method'], 'notes' => 'A limited PIN exception exists for certain residents abroad.'],
                    'it' => ['name' => 'Accesso ai servizi INPS', 'summary' => 'Accesso ai servizi INPS con SPID, CIE o CNS.', 'how_to_apply' => 'Apri la pagina ufficiale di autenticazione e scegli il metodo.', 'required_documents' => ['SPID, CIE o CNS', 'Credenziali/dispositivo richiesti dal metodo'], 'notes' => 'Esiste una limitata eccezione PIN per alcuni residenti all’estero.'],
                ],
            ],
        ];
    }
}
