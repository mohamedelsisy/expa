<?php

namespace Database\Seeders;

use App\Domains\Government\Models\GovernmentService;
use App\Domains\Guides\Models\Guide;
use Illuminate\Database\Seeder;

/**
 * EXPA official content slice v2.
 *
 * Sources checked on 2026-10-08. Content is summarized, not copied.
 * Staging/production stays in review for the existing four-eyes workflow.
 */
class OfficialContentV2Seeder extends Seeder
{
    private const VERIFIED_AT = '2026-10-08';

    public function run(): void
    {
        foreach ($this->items() as $index => $item) {
            $guide = Guide::updateOrCreate(
                ['slug' => $item['slug']],
                [
                    'category' => $item['category'],
                    'italian_term' => $item['italian_term'],
                    'sort_order' => $index * 10,
                    'source_name' => $item['source_name'],
                    'source_url' => $item['source_url'],
                    'source_type' => 'official',
                    'last_verified_at' => self::VERIFIED_AT,
                ]
            );
            $guide->setTranslations($item['translations']);
            $this->lifecycle($guide);

            if (! empty($item['service'])) {
                $service = GovernmentService::updateOrCreate(
                    ['slug' => $item['service']['slug']],
                    [
                        'domain' => $item['service']['domain'],
                        'italian_term' => $item['italian_term'],
                        'guide_id' => $guide->id,
                        'sort_order' => $index * 10,
                        'source_name' => $item['source_name'],
                        'source_url' => $item['source_url'],
                        'source_type' => 'official',
                        'last_verified_at' => self::VERIFIED_AT,
                    ]
                );
                $service->setTranslations($item['service']['translations']);
                $this->lifecycle($service);
            }
        }
    }

    private function lifecycle(object $model): void
    {
        $live = app()->environment('local', 'testing');
        $model->forceFill([
            'status' => $live ? 'published' : 'review',
            'published_at' => $live ? ($model->published_at ?? now()) : null,
        ])->save();
    }

    private function items(): array
    {
        $t = fn (
            string $titleAr, string $summaryAr, string $whatAr, array $docsAr, array $stepsAr, string $whereAr, string $costAr, string $bodyAr,
            string $titleEn, string $summaryEn, string $whatEn, array $docsEn, array $stepsEn, string $whereEn, string $costEn, string $bodyEn,
            string $titleIt, string $summaryIt, string $whatIt, array $docsIt, array $stepsIt, string $whereIt, string $costIt, string $bodyIt
        ) => [
            'ar' => ['title' => $titleAr, 'summary' => $summaryAr, 'what_is' => $whatAr, 'required_documents' => $docsAr, 'steps' => $stepsAr, 'where_to_apply' => $whereAr, 'costs' => $costAr, 'body' => $bodyAr],
            'en' => ['title' => $titleEn, 'summary' => $summaryEn, 'what_is' => $whatEn, 'required_documents' => $docsEn, 'steps' => $stepsEn, 'where_to_apply' => $whereEn, 'costs' => $costEn, 'body' => $bodyEn],
            'it' => ['title' => $titleIt, 'summary' => $summaryIt, 'what_is' => $whatIt, 'required_documents' => $docsIt, 'steps' => $stepsIt, 'where_to_apply' => $whereIt, 'costs' => $costIt, 'body' => $bodyIt],
        ];

        return [
            [
                'slug' => 'codice-fiscale-stranieri',
                'category' => 'documents',
                'italian_term' => 'Codice fiscale',
                'source_name' => 'Agenzia delle Entrate',
                'source_url' => 'https://www.agenziaentrate.gov.it/portale/codice-fiscale-e-tessera-sanitaria/che-cos-cittadini',
                'translations' => $t(
                    'Codice Fiscale للأجانب', 'ما هو الرقم الضريبي الإيطالي وكيف تطلبه أو تتحقق منه.', 'Codice Fiscale هو رقم تعريفي يستخدم في التعاملات مع الإدارة العامة والجهات الأخرى في إيطاليا.',
                    ['وثيقة هوية سارية', 'نموذج AA4/8 عند تقديم طلب مباشر', 'مستندات إضافية حسب سبب الطلب'],
                    [['title' => 'حدد سبب الطلب', 'text' => 'إذا لم يكن لديك Codice Fiscale، يمكن طلبه عبر Agenzia delle Entrate وفق القناة المناسبة.'], ['title' => 'جهّز AA4/8 عند الحاجة', 'text' => 'Agenzia delle Entrate تستخدم نموذج AA4/8 للأشخاص الطبيعيين.'], ['title' => 'أرسل المستندات', 'text' => 'يمكن لبعض الخدمات قبول الطلب عبر البريد الإلكتروني أو PEC أو في المكتب.'], ['title' => 'تحقق من الرقم', 'text' => 'توجد خدمة رسمية للتحقق من صحة Codice Fiscale ومطابقته للبيانات.']],
                    'Agenzia delle Entrate أو القناة المحددة للطلب.', 'قد لا توجد تكلفة على طلب الرقم نفسه؛ تحقق من الخدمة المحددة.', 'لا تخلط بين Codice Fiscale وPartita IVA. احتفظ بشهادة الإسناد واستخدم خدمة التحقق الرسمية عند الشك.',
                    'Italian tax code for foreigners', 'What the Italian tax code is and how to request or verify it.', 'The Codice Fiscale is an identification code used in dealings with Italian public administration and other entities.',
                    ['Valid identity document', 'AA4/8 form when making a direct request', 'Additional documents depending on the reason for the request'],
                    [['title' => 'Identify the reason', 'text' => 'If you do not have a tax code, use the appropriate Agenzia delle Entrate procedure.'], ['title' => 'Prepare AA4/8 when needed', 'text' => 'AA4/8 is the form used for individuals.'], ['title' => 'Submit the documents', 'text' => 'Some requests can be sent by email/PEC or handled at an office.'], ['title' => 'Verify the code', 'text' => 'Agenzia delle Entrate provides an official verification service.']],
                    'Agenzia delle Entrate or the channel specified for the request.', 'The tax-code request itself is not presented here as a paid service; check the specific service.', 'Do not confuse Codice Fiscale with Partita IVA. Keep the attribution certificate and use the official verification service if needed.',
                    'Codice fiscale per cittadini stranieri', 'Cos’è il codice fiscale e come richiederlo o verificarlo.', 'Il codice fiscale è un identificativo usato nei rapporti con la Pubblica Amministrazione e altri soggetti.',
                    ['Documento di identità valido', 'Modello AA4/8 quando si presenta una richiesta diretta', 'Documentazione aggiuntiva secondo il motivo della richiesta'],
                    [['title' => 'Individua il motivo', 'text' => 'Se non hai il codice fiscale, usa la procedura dell’Agenzia delle Entrate adatta al caso.'], ['title' => 'Prepara AA4/8', 'text' => 'Il modello AA4/8 è utilizzato per le persone fisiche.'], ['title' => 'Invia la documentazione', 'text' => 'Alcune richieste possono essere inviate via email/PEC o presentate in ufficio.'], ['title' => 'Verifica il codice', 'text' => 'È disponibile un servizio ufficiale di verifica.']],
                    'Agenzia delle Entrate o canale indicato per la richiesta.', 'Il servizio specifico va verificato prima della richiesta.', 'Non confondere Codice Fiscale e Partita IVA. Conserva il certificato di attribuzione.',
                ),
                'service' => ['slug' => 'codice-fiscale-servizio', 'domain' => 'tax', 'translations' => [
                    'ar' => ['name' => 'طلب Codice Fiscale', 'summary' => 'خدمة المعلومات الرسمية لطلب الرقم الضريبي.', 'how_to_apply' => 'استخدم نموذج AA4/8 والقناة التي تحددها Agenzia delle Entrate.', 'required_documents' => ['وثيقة هوية', 'AA4/8 عند الحاجة'], 'notes' => 'EXPA لا يصدر الرقم نيابة عنك.'],
                    'en' => ['name' => 'Codice Fiscale request', 'summary' => 'Official information for requesting a tax code.', 'how_to_apply' => 'Use AA4/8 and the channel specified by Agenzia delle Entrate.', 'required_documents' => ['Identity document', 'AA4/8 when required'], 'notes' => 'EXPA does not issue the code for you.'],
                    'it' => ['name' => 'Richiesta Codice Fiscale', 'summary' => 'Informazioni ufficiali per richiedere il codice fiscale.', 'how_to_apply' => 'Usa il modello AA4/8 e il canale indicato dall’Agenzia delle Entrate.', 'required_documents' => ['Documento di identità', 'AA4/8 quando previsto'], 'notes' => 'EXPA non rilascia il codice al posto tuo.'],
                ]],
            ],
            [
                'slug' => 'tessera-sanitaria-stranieri',
                'category' => 'healthcare',
                'italian_term' => 'Tessera Sanitaria',
                'source_name' => 'Agenzia delle Entrate',
                'source_url' => 'https://www1.agenziaentrate.gov.it/web_app_entrate/tessera_sanitaria.html/1000',
                'translations' => $t(
                    'البطاقة الصحية Tessera Sanitaria', 'كيف ترتبط البطاقة الصحية بالتسجيل في SSN، وماذا تفعل عند فقدانها.', 'Tessera Sanitaria هي الوثيقة المرتبطة بحقوق الرعاية الصحية وتحتوي أيضًا على Codice Fiscale.',
                    ['التسجيل في SSN عند انطباقه', 'Codice Fiscale', 'وثائق الإقامة/الهوية حسب الحالة'],
                    [['title' => 'تحقق من التسجيل في SSN', 'text' => 'الأجانب الذين يريدون Tessera Sanitaria يحتاجون أولًا إلى التسجيل في SSN وفق حالتهم.'], ['title' => 'تحقق من العنوان', 'text' => 'البطاقة تُرسل إلى عنوان الإقامة المسجل في Anagrafe Tributaria عندما تنطبق الشروط.'], ['title' => 'اطلب نسخة عند الحاجة', 'text' => 'توجد قنوات إلكترونية وبريد إلكتروني/PEC ومكاتب Agenzia delle Entrate بحسب نوع البطاقة.'], ['title' => 'في حالة الخطأ', 'text' => 'يمكن طلب تصحيح البيانات عبر الجهة المختصة وفق حالة الشخص.']],
                    'ASL المختصة للتسجيل الصحي وAgenzia delle Entrate لبعض خدمات البطاقة.', 'تختلف الرسوم حسب الخدمة والحالة؛ لا نضع مبلغًا عامًا.', 'تسجيل SSN وصلاحية Tessera Sanitaria للأجانب مرتبطان بالحالة ونوع الإقامة. راجع المصدر قبل الاعتماد على أي مدة.',
                    'Tessera Sanitaria', 'How the health card relates to SSN registration and what to do if it is lost.', 'The Tessera Sanitaria is linked to healthcare entitlement and also shows the tax code.',
                    ['SSN registration where applicable', 'Codice Fiscale', 'Residence/identity documents as applicable'],
                    [['title' => 'Check SSN registration', 'text' => 'Foreign nationals requesting the health card generally need SSN registration first.'], ['title' => 'Check the address', 'text' => 'The card is sent to the residence address recorded in the Tax Registry when applicable.'], ['title' => 'Request a duplicate', 'text' => 'Online, email/PEC and office channels are available depending on the card.'], ['title' => 'Correct errors', 'text' => 'Use the authority specified for the type of data correction.']],
                    'The competent ASL for healthcare registration and Agenzia delle Entrate for relevant card services.', 'Costs depend on the service and case; no universal amount is stated.', 'For foreign nationals, SSN registration and card validity depend on status and residence permit. Check the official source before relying on a validity period.',
                    'Tessera Sanitaria', 'Come funziona la Tessera Sanitaria e cosa fare in caso di smarrimento.', 'La Tessera Sanitaria è collegata all’assistenza sanitaria e riporta anche il codice fiscale.',
                    ['Iscrizione al SSN quando prevista', 'Codice fiscale', 'Documenti di identità/soggiorno secondo il caso'],
                    [['title' => 'Verifica l’iscrizione SSN', 'text' => 'Per i cittadini stranieri l’iscrizione al SSN è normalmente il primo passaggio per ottenere la tessera.'], ['title' => 'Controlla l’indirizzo', 'text' => 'La tessera viene spedita all’indirizzo di residenza presente nell’Anagrafe Tributaria quando previsto.'], ['title' => 'Richiedi un duplicato', 'text' => 'Sono disponibili canali online, email/PEC e ufficio secondo il caso.'], ['title' => 'Correggi eventuali errori', 'text' => 'Segui il canale indicato dall’autorità competente.']],
                    'ASL competente per il SSN e Agenzia delle Entrate per i servizi previsti.', 'I costi dipendono dal servizio e dal caso.', 'Per gli stranieri durata e requisiti dipendono dalla situazione. Verifica sempre la fonte ufficiale.',
                ),
                'service' => ['slug' => 'tessera-sanitaria-servizio', 'domain' => 'health', 'translations' => [
                    'ar' => ['name' => 'Tessera Sanitaria', 'summary' => 'معلومات رسمية عن البطاقة الصحية.', 'how_to_apply' => 'ابدأ بالتسجيل في SSN إذا كان مطلوبًا ثم اتبع القناة الرسمية.', 'required_documents' => ['SSN', 'Codice Fiscale', 'وثائق الحالة'], 'notes' => 'القواعد تختلف حسب الوضع.'],
                    'en' => ['name' => 'Tessera Sanitaria', 'summary' => 'Official health-card information.', 'how_to_apply' => 'Complete SSN registration when required and follow the official channel.', 'required_documents' => ['SSN registration', 'Codice Fiscale', 'Status documents'], 'notes' => 'Rules vary by status.'],
                    'it' => ['name' => 'Tessera Sanitaria', 'summary' => 'Informazioni ufficiali sulla tessera sanitaria.', 'how_to_apply' => 'Completa l’iscrizione al SSN quando prevista e segui il canale ufficiale.', 'required_documents' => ['Iscrizione SSN', 'Codice fiscale', 'Documenti relativi alla situazione'], 'notes' => 'I requisiti cambiano in base al caso.'],
                ]],
            ],
            [
                'slug' => 'anpr-certificati-online',
                'category' => 'documents',
                'italian_term' => 'ANPR',
                'source_name' => 'Ministero dell’Interno',
                'source_url' => 'https://www.anagrafenazionale.interno.it/area-cittadino/certificati/',
                'translations' => $t(
                    'استخراج الشهادات من ANPR أونلاين', 'يمكن للمواطن الوصول إلى خدمات ANPR الرقمية واستخراج شهادات أنagrafe عبر الإنترنت.', 'ANPR هي قاعدة البيانات الوطنية للسكان المقيمين وتوفر خدمات أنagrafe رقمية.',
                    ['SPID أو CIE أو CNS', 'بيانات الشخص أو أفراد الأسرة عند طلب شهادة نيابة عنهم'],
                    [['title' => 'ادخل إلى ANPR', 'text' => 'استخدم الهوية الرقمية المطلوبة للوصول إلى المنطقة الشخصية.'], ['title' => 'اختر الشهادة', 'text' => 'اختر نوع الشهادة المتاح لحالتك.'], ['title' => 'اختر الاستخدام المناسب', 'text' => 'قد تختلف الشهادة أو طريقة الإصدار حسب ما إذا كانت مع أو بدون bollo.'], ['title' => 'نزّل أو اطبع', 'text' => 'احفظ الشهادة والمرجع بعد إصدارها.']],
                    'Portale ANPR.', 'قد توجد رسوم bollo في الحالات التي تتطلب شهادة خاضعة للضريبة؛ بعض الخدمات متاحة دون الذهاب للمكتب.', 'تحقق من نوع الشهادة والغرض قبل إصدارها، لأن متطلبات الاستخدام قد تختلف.',
                    'Get ANPR certificates online', 'ANPR provides online demographic certificate services.', 'ANPR is Italy’s national resident population registry and provides digital registry services.',
                    ['SPID, CIE or CNS', 'Personal/family data when requesting for an eligible family member'],
                    [['title' => 'Sign in to ANPR', 'text' => 'Use the supported digital identity.'], ['title' => 'Choose the certificate', 'text' => 'Select the certificate available for your situation.'], ['title' => 'Check the tax treatment', 'text' => 'Some certificates may require bollo while others can be issued without it.'], ['title' => 'Download or print', 'text' => 'Save the issued certificate and reference.']],
                    'ANPR portal.', 'Some certificates can require bollo; online services avoid an unnecessary office visit.', 'Check the certificate type and intended use before issuing it.',
                    'Certificati ANPR online', 'ANPR offre servizi digitali per i certificati anagrafici.', 'ANPR è l’anagrafe nazionale e permette di usare diversi servizi demografici online.',
                    ['SPID, CIE o CNS', 'Dati personali/familiari secondo il certificato richiesto'],
                    [['title' => 'Accedi ad ANPR', 'text' => 'Usa l’identità digitale supportata.'], ['title' => 'Scegli il certificato', 'text' => 'Seleziona il certificato disponibile per la tua situazione.'], ['title' => 'Verifica il bollo', 'text' => 'Alcuni certificati possono richiedere il bollo.'], ['title' => 'Scarica o stampa', 'text' => 'Conserva il certificato rilasciato.']],
                    'Portale ANPR.', 'Alcuni certificati possono richiedere il bollo.', 'Verifica sempre il tipo di certificato e il suo utilizzo.',
                ),
                'service' => ['slug' => 'anpr-certificati', 'domain' => 'civil_registry', 'translations' => [
                    'ar' => ['name' => 'شهادات ANPR', 'summary' => 'إصدار شهادات السجل المدني إلكترونيًا.', 'how_to_apply' => 'ادخل إلى ANPR بهويتك الرقمية واختر الشهادة.', 'required_documents' => ['SPID/CIE/CNS'], 'notes' => 'بعض الشهادات قد تتطلب bollo.'],
                    'en' => ['name' => 'ANPR certificates', 'summary' => 'Online demographic certificates.', 'how_to_apply' => 'Sign in to ANPR and choose the required certificate.', 'required_documents' => ['SPID/CIE/CNS'], 'notes' => 'Some certificates may require bollo.'],
                    'it' => ['name' => 'Certificati ANPR', 'summary' => 'Certificati anagrafici online.', 'how_to_apply' => 'Accedi ad ANPR e seleziona il certificato necessario.', 'required_documents' => ['SPID/CIE/CNS'], 'notes' => 'Alcuni certificati possono richiedere il bollo.'],
                ]],
            ],
            [
                'slug' => 'cambio-residenza-anpr',
                'category' => 'daily_life',
                'italian_term' => 'Cambio di residenza',
                'source_name' => 'Ministero dell’Interno',
                'source_url' => 'https://www.interno.gov.it/it/notizie/attivo-servizio-line-cambio-residenza-sul-portale-anagrafe-nazionale-popolazione-residente',
                'translations' => $t(
                    'تغيير الإقامة عبر ANPR', 'تقديم بعض طلبات تغيير الإقامة أو تغيير السكن يمكن أن يتم إلكترونيًا عبر ANPR.', 'خدمة ANPR تتيح لبعض البالغين المسجلين في ANPR إرسال طلبات أنagrafe إلكترونيًا إلى البلدية المختصة.',
                    ['SPID أو CIE أو CNS', 'بيانات السكن الجديد', 'المعلومات المطلوبة لأفراد الأسرة عند انطباقها'],
                    [['title' => 'تحقق من نوع الطلب', 'text' => 'الخدمة تغطي حالات محددة مثل الانتقال إلى Comune آخر أو تغيير السكن داخل نفس Comune.'], ['title' => 'ادخل إلى ANPR', 'text' => 'استخدم SPID أو CIE أو CNS.'], ['title' => 'أكمل الطلب', 'text' => 'أدخل البيانات المطلوبة لك ولأفراد الأسرة المشمولين.'], ['title' => 'تابع الحالة', 'text' => 'يمكن متابعة حالة الطلب من المنطقة الشخصية.']],
                    'Portale ANPR والبلدية المختصة.', 'لا نضع رسومًا عامة؛ الإجراء نفسه رقمي في الحالات التي يدعمها ANPR.', 'ليس كل طلبات الإقامة تتم عبر ANPR؛ الحالات الأخرى قد تتطلب التواصل مع Comune.',
                    'Change residence through ANPR', 'Some residence and address-change requests can be submitted online through ANPR.', 'ANPR lets eligible adults registered in the system send specified registry declarations to the competent municipality.',
                    ['SPID, CIE or CNS', 'New address details', 'Family information when applicable'],
                    [['title' => 'Check the request type', 'text' => 'The service covers specified cases such as moving between municipalities or changing address within one municipality.'], ['title' => 'Sign in', 'text' => 'Use SPID, CIE or CNS.'], ['title' => 'Complete the request', 'text' => 'Enter the required details for yourself and eligible family members.'], ['title' => 'Track the request', 'text' => 'The private area can show the progress of the submitted request.']],
                    'ANPR portal and competent municipality.', 'No universal fee is stated here.', 'Not every registry request is handled online through ANPR; other cases may require the Comune.',
                    'Cambio di residenza tramite ANPR', 'Alcune dichiarazioni di residenza o cambio abitazione possono essere presentate online tramite ANPR.', 'ANPR permette agli adulti registrati di inviare alcune dichiarazioni anagrafiche al Comune competente.',
                    ['SPID, CIE o CNS', 'Dati della nuova abitazione', 'Dati dei familiari quando previsti'],
                    [['title' => 'Verifica il tipo di pratica', 'text' => 'Il servizio copre casi specifici, tra cui trasferimento tra Comuni e cambio di abitazione nello stesso Comune.'], ['title' => 'Accedi ad ANPR', 'text' => 'Usa SPID, CIE o CNS.'], ['title' => 'Compila la richiesta', 'text' => 'Inserisci i dati richiesti.'], ['title' => 'Controlla lo stato', 'text' => 'Puoi seguire la richiesta nell’area riservata.']],
                    'Portale ANPR e Comune competente.', 'Non viene indicato un costo generale.', 'Non tutte le pratiche anagrafiche sono disponibili online tramite ANPR.',
                ),
                'service' => ['slug' => 'cambio-residenza-anpr-servizio', 'domain' => 'civil_registry', 'translations' => [
                    'ar' => ['name' => 'تغيير الإقامة عبر ANPR', 'summary' => 'خدمة رقمية لتقديم حالات محددة من تغيير الإقامة.', 'how_to_apply' => 'ادخل إلى ANPR وأرسل الطلب للبلدية المختصة.', 'required_documents' => ['هوية رقمية', 'بيانات السكن'], 'notes' => 'الخدمة لا تغطي كل الحالات.'],
                    'en' => ['name' => 'ANPR residence change', 'summary' => 'Online service for eligible residence changes.', 'how_to_apply' => 'Sign in to ANPR and submit the request to the competent municipality.', 'required_documents' => ['Digital identity', 'Address details'], 'notes' => 'Not every registry case is online.'],
                    'it' => ['name' => 'Cambio residenza ANPR', 'summary' => 'Servizio online per i casi previsti di cambio di residenza.', 'how_to_apply' => 'Accedi ad ANPR e invia la richiesta al Comune competente.', 'required_documents' => ['Identità digitale', 'Dati abitazione'], 'notes' => 'Non tutte le pratiche sono disponibili online.'],
                ]],
            ],
            [
                'slug' => 'ricongiungimento-familiare',
                'category' => 'family',
                'italian_term' => 'Ricongiungimento familiare',
                'source_name' => 'Prefettura di Roma',
                'source_url' => 'https://prefettura.interno.gov.it/it/prefetture/roma/ricongiungimento-familiare',
                'translations' => $t(
                    'لمّ الشمل العائلي في إيطاليا', 'شرح تمهيدي لمسار Ricongiungimento Familiare مع مصدر رسمي من Prefettura di Roma.', 'لمّ الشمل هو مسار قانوني يتيح، عند استيفاء الشروط، طلب دخول بعض أفراد الأسرة إلى إيطاليا.',
                    ['جواز السفر', 'تصريح الإقامة', 'وثائق السكن المناسب', 'وثائق الدخل المطلوب', 'إثبات صلة القرابة حسب الحالة'],
                    [['title' => 'تحقق من الأهلية', 'text' => 'نوع تصريح الإقامة ومدته وعلاقة القرابة عوامل أساسية.'], ['title' => 'قدّم طلب nulla osta', 'text' => 'الطلب يمر عبر Sportello Unico المختص وفق الإجراء الرسمي.'], ['title' => 'تابع الوثائق', 'text' => 'وثائق السكن والدخل والقرابة يجب أن تطابق متطلبات الحالة.'], ['title' => 'المرحلة القنصلية', 'text' => 'بعد الموافقة، يقدّم فرد الأسرة الوثائق المطلوبة إلى القنصلية الإيطالية المختصة للحصول على التأشيرة عند انطباقها.']],
                    'Sportello Unico per l’Immigrazione في Prefettura المختصة، ثم القنصلية عند الحاجة.', 'توجد تكاليف ووثائق مرتبطة بالملف؛ لا نضع رقمًا عامًا.', 'هذه معاملة هجرة حساسة. راجع المصدر الرسمي أو مختص هجرة عند وجود حالة غير واضحة.',
                    'Family reunification', 'A starting guide to family reunification, using the Prefettura di Roma official procedure as the source.', 'Family reunification can allow eligible foreign residents to request entry for specified close family members when the legal conditions are met.',
                    ['Passport', 'Residence permit', 'Suitable housing evidence', 'Income documentation', 'Proof of family relationship as applicable'],
                    [['title' => 'Check eligibility', 'text' => 'Permit type, duration and family relationship are key factors.'], ['title' => 'Request the nulla osta', 'text' => 'The request is handled through the competent Sportello Unico.'], ['title' => 'Prepare evidence', 'text' => 'Housing, income and relationship evidence must meet the applicable requirements.'], ['title' => 'Consular stage', 'text' => 'After approval, the family member follows the applicable Italian consular visa process.']],
                    'Competent Sportello Unico per l’Immigrazione, followed by the consular authority where applicable.', 'Costs depend on the case; no universal amount is stated.', 'This is immigration-sensitive information. Verify the official procedure for the exact family and permit situation.',
                    'Ricongiungimento familiare', 'Guida introduttiva al ricongiungimento familiare con fonte della Prefettura di Roma.', 'Il ricongiungimento può consentire, quando ricorrono i requisiti, l’ingresso in Italia di determinati familiari.',
                    ['Passaporto', 'Permesso di soggiorno', 'Documentazione sull’alloggio', 'Documentazione sul reddito', 'Prova del rapporto familiare secondo il caso'],
                    [['title' => 'Verifica i requisiti', 'text' => 'Tipo e durata del permesso e rapporto familiare sono elementi fondamentali.'], ['title' => 'Richiedi il nulla osta', 'text' => 'La domanda passa dallo Sportello Unico competente.'], ['title' => 'Prepara la documentazione', 'text' => 'Alloggio, reddito e parentela devono rispettare i requisiti applicabili.'], ['title' => 'Fase consolare', 'text' => 'Dopo il nulla osta, il familiare segue la procedura del visto presso la rappresentanza competente.']],
                    'Sportello Unico per l’Immigrazione competente e, quando previsto, rappresentanza consolare.', 'I costi dipendono dalla pratica.', 'Le regole di immigrazione sono sensibili: verifica sempre la situazione specifica.',
                ),
                'service' => ['slug' => 'ricongiungimento-familiare-servizio', 'domain' => 'immigration', 'translations' => [
                    'ar' => ['name' => 'لمّ الشمل العائلي', 'summary' => 'معلومات عن طلب nulla osta ولمّ الشمل.', 'how_to_apply' => 'راجع Sportello Unico في Prefettura المختصة.', 'required_documents' => ['إقامة', 'سكن', 'دخل', 'صلة قرابة'], 'notes' => 'المصدر المستخدم خاص بـPrefettura di Roma.'],
                    'en' => ['name' => 'Family reunification', 'summary' => 'Information on the nulla osta and family reunification process.', 'how_to_apply' => 'Check the competent Sportello Unico at the Prefettura.', 'required_documents' => ['Residence permit', 'Housing', 'Income', 'Family relationship'], 'notes' => 'The cited source is Rome-specific.'],
                    'it' => ['name' => 'Ricongiungimento familiare', 'summary' => 'Informazioni sul nulla osta e sul ricongiungimento.', 'how_to_apply' => 'Consulta lo Sportello Unico presso la Prefettura competente.', 'required_documents' => ['Permesso', 'Alloggio', 'Reddito', 'Parentela'], 'notes' => 'La fonte citata è specifica per Roma.'],
                ]],
            ],
            [
                'slug' => 'conversione-permesso-soggiorno',
                'category' => 'immigration',
                'italian_term' => 'Conversione del permesso di soggiorno',
                'source_name' => 'Ministero dell’Interno',
                'source_url' => 'https://www.interno.gov.it/it/temi/immigrazione-e-asilo/modalita-dingresso/sportello-unico-limmigrazione',
                'translations' => $t(
                    'تحويل نوع تصريح الإقامة', 'متى يمكن أن تدخل في مسار تحويل بعض تصاريح الإقامة إلى مسار عمل وفق المعلومات الرسمية.', 'وزارة الداخلية تشرح مسار تحويل بعض تصاريح الدراسة أو التدريب أو العمل الموسمي إلى تصريح مرتبط بالعمل، مع مراعاة توفر الحصص والمتطلبات.',
                    ['تصريح الإقامة الحالي', 'وثائق العمل أو العقد حسب المسار', 'وثائق إضافية يطلبها Sportello Unico'],
                    [['title' => 'تحقق من نوع التصريح', 'text' => 'المصدر يذكر فئات محددة مثل الدراسة والتدريب والعمل الموسمي.'], ['title' => 'تحقق من الحصص', 'text' => 'التحويل المرتبط بالعمل يخضع لتوفر quota وفق الإجراء الرسمي.'], ['title' => 'توجه إلى Sportello Unico', 'text' => 'الإجراء يكون في المحافظة التي توجد فيها الإقامة وفق المصدر.'], ['title' => 'تابع الإجراء', 'text' => 'لا تفترض أن كل تصريح يمكن تحويله أو أن الحصة متاحة في كل وقت.']],
                    'Sportello Unico per l’Immigrazione في المحافظة المختصة.', 'التكاليف تعتمد على نوع الطلب.', 'لا تعتمد على هذا الدليل وحده لتحديد أهليتك؛ نوع التصريح والحصص والقواعد السارية يجب التحقق منها وقت الطلب.',
                    'Converting a residence permit', 'When some residence permits can enter a work-related conversion route under official rules.', 'The Ministry of the Interior describes conversion routes for certain study, training or seasonal-work permits, subject to quotas and requirements.',
                    ['Current residence permit', 'Employment/contract documents as applicable', 'Additional documents requested by Sportello Unico'],
                    [['title' => 'Check the permit type', 'text' => 'The official source names specific categories such as study, training and seasonal work.'], ['title' => 'Check quota availability', 'text' => 'Work-related conversion is subject to available quotas under the applicable procedure.'], ['title' => 'Use the competent Sportello Unico', 'text' => 'The application route is tied to the province of residence under the cited procedure.'], ['title' => 'Follow the current procedure', 'text' => 'Do not assume every permit is convertible or that a quota is always available.']],
                    'Competent Sportello Unico per l’Immigrazione.', 'Costs depend on the application.', 'Eligibility depends on the permit type, quota and rules in force at the time of application.',
                    'Conversione del permesso di soggiorno', 'Quando alcuni permessi possono essere convertiti secondo le regole ufficiali.', 'Il Ministero dell’Interno descrive conversioni per alcuni permessi di studio, tirocinio o lavoro stagionale, soggette a quote e requisiti.',
                    ['Permesso attuale', 'Documentazione lavorativa secondo il caso', 'Documenti richiesti dallo Sportello Unico'],
                    [['title' => 'Verifica il tipo di permesso', 'text' => 'La fonte indica categorie specifiche.'], ['title' => 'Verifica le quote', 'text' => 'La conversione per lavoro dipende dalla disponibilità delle quote.'], ['title' => 'Rivolgiti allo Sportello Unico', 'text' => 'Segui la procedura della provincia competente.'], ['title' => 'Controlla le regole aggiornate', 'text' => 'Non tutti i permessi sono convertibili.']],
                    'Sportello Unico per l’Immigrazione competente.', 'I costi dipendono dalla pratica.', 'Verifica sempre requisiti, quote e regole vigenti.',
                ),
                'service' => ['slug' => 'conversione-permesso-servizio', 'domain' => 'immigration', 'translations' => [
                    'ar' => ['name' => 'تحويل تصريح الإقامة', 'summary' => 'معلومات رسمية عن مسارات التحويل.', 'how_to_apply' => 'تحقق من Sportello Unico والحصة والإجراء الخاص بنوع تصريحك.', 'required_documents' => ['التصريح الحالي', 'وثائق العمل حسب الحالة'], 'notes' => 'ليست كل التصاريح قابلة للتحويل.'],
                    'en' => ['name' => 'Residence-permit conversion', 'summary' => 'Official information on eligible conversion routes.', 'how_to_apply' => 'Check the Sportello Unico, quota and procedure for your permit type.', 'required_documents' => ['Current permit', 'Employment documents as applicable'], 'notes' => 'Not every permit is convertible.'],
                    'it' => ['name' => 'Conversione permesso', 'summary' => 'Informazioni ufficiali sulle conversioni previste.', 'how_to_apply' => 'Verifica Sportello Unico, quote e procedura per il tuo titolo.', 'required_documents' => ['Permesso attuale', 'Documenti di lavoro secondo il caso'], 'notes' => 'Non tutti i permessi sono convertibili.'],
                ]],
            ],
            [
                'slug' => 'did-centro-impiego',
                'category' => 'work',
                'italian_term' => 'DID',
                'source_name' => 'Ministero del Lavoro e delle Politiche Sociali',
                'source_url' => 'https://www.lavoro.gov.it/strumenti-e-servizi/pagine/dichiarazione-di-immediata-disponibilita-al-lavoro',
                'translations' => $t(
                    'DID ومركز التوظيف', 'ما هي Dichiarazione di Immediata Disponibilità وكيف تبدأ حالة البحث عن عمل.', 'DID هي التصريح الذي يحدد رسميًا بداية حالة البطالة ويتيح الوصول إلى خدمات إعادة الإدماج في سوق العمل.',
                    ['بيانات الهوية', 'بيانات العمل السابقة عند الحاجة', 'الوصول إلى بوابة العمل أو مركز التوظيف'],
                    [['title' => 'تحقق من حالتك', 'text' => 'DID مخصصة لمن هو عاطل عن العمل أو تلقى إشعار فصل وفق الشروط.'], ['title' => 'قدّم DID', 'text' => 'يمكن تقديمها عبر Portale per le politiche attive، أو بوابات إقليمية حيث تتوفر، أو لدى Centro per l’Impiego.'], ['title' => 'التأكيد لدى CPI', 'text' => 'قد يُطلب تأكيد حالة البطالة والتحقق من الهوية عند أول تواصل.'], ['title' => 'استفد من الخدمات', 'text' => 'مراكز التوظيف تقدم توجيهًا وتدريبًا قصيرًا وخدمات ربط بين الوظائف والباحثين.']],
                    'Portale per le politiche attive أو Centro per l’Impiego المختص.', 'الخدمة الحكومية نفسها ليست معروضة هنا كخدمة مدفوعة.', 'لا تخلط بين عدم العمل وبين حالة البطالة القانونية؛ بعض المزايا لها شروطها الخاصة.',
                    'DID and employment centres', 'What the DID is and how it starts formal unemployment status.', 'The DID is the declaration that formally starts a person’s unemployment status and can provide access to re-employment services.',
                    ['Identity details', 'Previous employment information where relevant', 'Access to the labour portal or employment centre'],
                    [['title' => 'Check your status', 'text' => 'DID is intended for people who are unemployed or have received a dismissal notice under the applicable rules.'], ['title' => 'Submit DID', 'text' => 'It can be completed through the national labour-policy portal, regional portals where available, or an employment centre.'], ['title' => 'Confirm with the CPI', 'text' => 'The first contact may require confirmation of unemployment status and identity.'], ['title' => 'Use the services', 'text' => 'Employment centres provide orientation, short training and job-matching services.']],
                    'National labour-policy portal or competent Centro per l’Impiego.', 'The public service is not presented as a paid service.', 'Do not equate simply having no job with every legal definition of unemployment; benefits can have additional requirements.',
                    'DID e Centro per l’Impiego', 'Cos’è la DID e come si avvia formalmente lo stato di disoccupazione.', 'La DID determina formalmente lo stato di disoccupazione e permette di accedere ai servizi di reinserimento.',
                    ['Dati identificativi', 'Informazioni sul lavoro precedente quando richieste', 'Accesso al portale lavoro o al CPI'],
                    [['title' => 'Verifica la situazione', 'text' => 'La DID riguarda chi è disoccupato o ha ricevuto comunicazione di licenziamento secondo le regole.'], ['title' => 'Presenta la DID', 'text' => 'Può essere presentata online o presso il Centro per l’Impiego.'], ['title' => 'Conferma al CPI', 'text' => 'Al primo contatto può essere richiesta la conferma dello stato di disoccupazione.'], ['title' => 'Usa i servizi', 'text' => 'I CPI offrono orientamento, formazione breve e incontro domanda-offerta.']],
                    'Portale per le politiche attive o Centro per l’Impiego competente.', 'Il servizio pubblico non è presentato come servizio a pagamento.', 'La nozione di disoccupazione può avere requisiti ulteriori per le singole prestazioni.',
                ),
                'service' => ['slug' => 'did-centro-impiego-servizio', 'domain' => 'labor', 'translations' => [
                    'ar' => ['name' => 'DID — التصريح بالاستعداد للعمل', 'summary' => 'بدء حالة البطالة رسميًا والوصول إلى خدمات التوظيف.', 'how_to_apply' => 'قدّم DID أونلاين أو لدى Centro per l’Impiego.', 'required_documents' => ['هوية', 'بيانات العمل حسب الحالة'], 'notes' => 'الخدمات تختلف إقليميًا.'],
                    'en' => ['name' => 'DID — immediate availability', 'summary' => 'Formal unemployment declaration and access to employment services.', 'how_to_apply' => 'Submit the DID online or through the employment centre.', 'required_documents' => ['Identity', 'Employment details as applicable'], 'notes' => 'Regional services can differ.'],
                    'it' => ['name' => 'DID — disponibilità immediata', 'summary' => 'Dichiarazione di disoccupazione e accesso ai servizi per il lavoro.', 'how_to_apply' => 'Presenta la DID online o presso il Centro per l’Impiego.', 'required_documents' => ['Identità', 'Dati lavorativi secondo il caso'], 'notes' => 'I servizi regionali possono variare.'],
                ]],
            ],
            [
                'slug' => 'naspi-disoccupazione',
                'category' => 'work',
                'italian_term' => 'NASpI',
                'source_name' => 'INPS',
                'source_url' => 'https://www.inps.it/it/it/dettaglio-scheda.it.schede-servizio-strumento.schede-servizi.50593.naspi-indennit-mensile-di-disoccupazione.html',
                'translations' => $t(
                    'NASpI: إعانة البطالة', 'شرح أساسي لمن فقد عملًا تابعًا بشكل غير إرادي ويريد معرفة مسار NASpI.', 'NASpI هي إعانة شهرية للبطالة تُطلب من INPS للعاملين بعلاقة عمل تابعة الذين فقدوا العمل بشكل غير إرادي عند استيفاء الشروط.',
                    ['بيانات العمل وعقد العمل السابق', 'بيانات الاشتراكات', 'بيانات الهوية والحساب/طريقة الدفع حسب الطلب'],
                    [['title' => 'تحقق من انتهاء العمل', 'text' => 'الـNASpI مخصصة أساسًا لمن فقد العمل التابع بشكل غير إرادي، مع شروط إضافية.'], ['title' => 'قدّم الطلب إلكترونيًا', 'text' => 'INPS يتيح تقديم الطلب عبر خدمة NASpI.'], ['title' => 'انتبه للمهلة', 'text' => 'صفحة INPS تذكر أن الطلب يُقدّم خلال 68 يومًا من انتهاء علاقة العمل في الحالات المعتادة.'], ['title' => 'تابع Centro per l’Impiego', 'text' => 'تقديم الطلب يرتبط بـDID، وتذكر INPS خطوة التواصل مع مركز التوظيف ضمن المدة المحددة.']],
                    'INPS online أو عبر Patronato عند استخدام وسيط مخول.', 'قواعد الاستحقاق والمبلغ تعتمد على الحالة؛ لا نضع تقديرًا ماليًا هنا.', 'NASpI لها شروط تفصيلية واستثناءات. تحقق من صفحة INPS الحالية قبل التقديم.',
                    'NASpI unemployment benefit', 'A basic guide for people who involuntarily lost subordinate employment.', 'NASpI is a monthly unemployment benefit for eligible subordinate workers who involuntarily lost their job.',
                    ['Previous employment details', 'Contribution information', 'Identity and payment information as required'],
                    [['title' => 'Check the end of employment', 'text' => 'NASpI primarily covers involuntary loss of subordinate employment, subject to further requirements.'], ['title' => 'Apply online', 'text' => 'INPS provides the NASpI application service.'], ['title' => 'Watch the deadline', 'text' => 'INPS states that applications are normally submitted within 68 days of the end of employment.'], ['title' => 'Follow the employment-centre step', 'text' => 'The application is linked to the DID and INPS describes a follow-up with the employment centre.']],
                    'INPS online service or an authorised Patronato.', 'Eligibility and amount depend on the case; no estimate is given here.', 'NASpI has detailed requirements and exclusions. Re-check INPS before applying.',
                    'NASpI: indennità di disoccupazione', 'Guida di base per chi ha perso involontariamente un lavoro subordinato.', 'La NASpI è un’indennità mensile per lavoratori subordinati che hanno perso involontariamente il lavoro e rispettano i requisiti.',
                    ['Dati del rapporto di lavoro', 'Informazioni contributive', 'Dati identificativi e di pagamento richiesti'],
                    [['title' => 'Verifica la cessazione', 'text' => 'La NASpI riguarda principalmente la perdita involontaria del lavoro subordinato.'], ['title' => 'Presenta la domanda', 'text' => 'La domanda è disponibile online sul sito INPS.'], ['title' => 'Controlla il termine', 'text' => 'INPS indica normalmente 68 giorni dalla cessazione del rapporto.'], ['title' => 'Segui il CPI', 'text' => 'La domanda è collegata alla DID e al successivo percorso presso il Centro per l’Impiego.']],
                    'Servizio online INPS o Patronato autorizzato.', 'Requisiti e importo dipendono dal caso.', 'La NASpI ha requisiti ed esclusioni specifici: verifica sempre INPS.',
                ),
                'service' => ['slug' => 'naspi-servizio', 'domain' => 'social_security', 'translations' => [
                    'ar' => ['name' => 'NASpI', 'summary' => 'طلب ومتابعة إعانة البطالة.', 'how_to_apply' => 'قدّم الطلب إلكترونيًا عبر INPS.', 'required_documents' => ['بيانات العمل', 'الاشتراكات', 'الهوية'], 'notes' => 'تحقق من المهلة والشروط الحالية.'],
                    'en' => ['name' => 'NASpI', 'summary' => 'Unemployment-benefit application and tracking.', 'how_to_apply' => 'Apply online through INPS.', 'required_documents' => ['Employment data', 'Contributions', 'Identity'], 'notes' => 'Check current deadline and requirements.'],
                    'it' => ['name' => 'NASpI', 'summary' => 'Domanda e gestione dell’indennità di disoccupazione.', 'how_to_apply' => 'Presenta la domanda online tramite INPS.', 'required_documents' => ['Dati lavorativi', 'Contributi', 'Identità'], 'notes' => 'Verifica termini e requisiti aggiornati.'],
                ]],
            ],
            [
                'slug' => 'isee-2026',
                'category' => 'money',
                'italian_term' => 'ISEE',
                'source_name' => 'INPS',
                'source_url' => 'https://www.inps.it/it/it/dettaglio-approfondimento.schede-informative.49936.tipologie-di-isee.html',
                'translations' => $t(
                    'ISEE: تقييم الوضع الاقتصادي للأسرة', 'ما هو ISEE ولماذا تحتاجه بعض المساعدات والخدمات الاجتماعية.', 'ISEE هو مؤشر يقيّم الوضع الاقتصادي للأسرة مع مراعاة الدخل والثروة وتركيبة الأسرة.',
                    ['بيانات أفراد الأسرة', 'بيانات الدخل', 'بيانات الممتلكات', 'DSU وفق نوع ISEE'],
                    [['title' => 'حدد نوع ISEE', 'text' => 'هناك ISEE عادي وأنواع أخرى بحسب الحالة.'], ['title' => 'جهّز DSU', 'text' => 'DSU تحتوي البيانات المطلوبة لحساب ISEE، وبعض البيانات يمكن استرجاعها من قواعد الإدارة.'], ['title' => 'استخدم Portale unico ISEE', 'text' => 'INPS يوفر خدمات ISEE المسبقة وغيرها.'], ['title' => 'استخدم النتيجة عند الحاجة', 'text' => 'ISEE يستخدم لتقييم الأهلية لعدد من الخدمات والمزايا المرتبطة بالوضع الاقتصادي.']],
                    'INPS Portale unico ISEE أو CAF/وسيط مخول.', 'قد تكون هناك تكلفة لدى CAF أو وسيط خاص، بينما الخدمة الحكومية لها قنواتها الرسمية.', 'قيمة ISEE ليست راتبًا ولا مبلغ إعانة؛ هي مؤشر اقتصادي يستخدم في تقييم بعض المزايا.',
                    'ISEE: household economic indicator', 'What ISEE is and why it is used for means-tested benefits and services.', 'ISEE evaluates a household’s economic situation using income, assets and household composition.',
                    ['Household data', 'Income information', 'Asset information', 'DSU for the applicable ISEE type'],
                    [['title' => 'Identify the ISEE type', 'text' => 'Standard and other ISEE forms exist for different situations.'], ['title' => 'Prepare the DSU', 'text' => 'The DSU contains the information used for the ISEE calculation.'], ['title' => 'Use Portale unico ISEE', 'text' => 'INPS provides pre-filled and other ISEE services.'], ['title' => 'Use the result', 'text' => 'ISEE can be required for services and benefits linked to economic status.']],
                    'INPS Portale unico ISEE or an authorised CAF/intermediary.', 'A CAF or private intermediary may have its own terms; check the channel.', 'ISEE is an economic indicator, not a salary or benefit amount.',
                    'ISEE: indicatore della situazione economica', 'Cos’è l’ISEE e perché viene usato per prestazioni legate alla situazione economica.', 'L’ISEE valuta la situazione economica del nucleo familiare considerando redditi, patrimoni e composizione del nucleo.',
                    ['Dati del nucleo', 'Dati reddituali', 'Dati patrimoniali', 'DSU secondo il tipo di ISEE'],
                    [['title' => 'Individua il tipo di ISEE', 'text' => 'Esistono ISEE ordinario e altre tipologie.'], ['title' => 'Prepara la DSU', 'text' => 'La DSU contiene i dati necessari al calcolo.'], ['title' => 'Usa il Portale unico ISEE', 'text' => 'INPS mette a disposizione servizi ISEE precompilati e non precompilati.'], ['title' => 'Usa l’attestazione', 'text' => 'L’ISEE può essere richiesto per prestazioni sociali collegate alla situazione economica.']],
                    'Portale unico ISEE INPS o CAF/intermediario autorizzato.', 'Le condizioni del CAF/intermediario possono variare.', 'L’ISEE è un indicatore economico e non coincide con stipendio o importo di una prestazione.',
                ),
                'service' => ['slug' => 'isee-servizio', 'domain' => 'social_security', 'translations' => [
                    'ar' => ['name' => 'ISEE', 'summary' => 'خدمة حساب وتقديم ISEE.', 'how_to_apply' => 'استخدم Portale unico ISEE أو CAF.', 'required_documents' => ['بيانات الأسرة', 'الدخل', 'الثروة', 'DSU'], 'notes' => 'اختر نوع ISEE المناسب.'],
                    'en' => ['name' => 'ISEE', 'summary' => 'ISEE calculation and application information.', 'how_to_apply' => 'Use Portale unico ISEE or a CAF.', 'required_documents' => ['Household data', 'Income', 'Assets', 'DSU'], 'notes' => 'Choose the applicable ISEE type.'],
                    'it' => ['name' => 'ISEE', 'summary' => 'Informazioni per ottenere l’ISEE.', 'how_to_apply' => 'Usa il Portale unico ISEE o un CAF.', 'required_documents' => ['Nucleo familiare', 'Redditi', 'Patrimonio', 'DSU'], 'notes' => 'Scegli la tipologia corretta.'],
                ]],
            ],
            [
                'slug' => 'dichiarazione-precompilata-2026',
                'category' => 'money',
                'italian_term' => 'Dichiarazione precompilata',
                'source_name' => 'Agenzia delle Entrate',
                'source_url' => 'https://www.agenziaentrate.gov.it/portale/cittadini/dichiarazioni',
                'translations' => $t(
                    'الإقرار الضريبي المسبق 2026', 'كيف تصل إلى dichiarazione precompilata وتراجعها وترسلها.', 'Agenzia delle Entrate توفر في 2026 نماذج precompilata مثل 730 وRedditi Persone Fisiche مع بيانات جمعتها من مصادر مختلفة.',
                    ['SPID أو CIE أو CNS أو بيانات دخول معتمدة حيث تنطبق', 'بيانات الدخل والمصروفات لمراجعتها', 'CU والمستندات اللازمة للتأكد من البيانات'],
                    [['title' => 'ادخل إلى precompilata', 'text' => 'الوصول متاح عبر SPID أو CIE أو CNS وغيرها من الطرق التي تحددها Agenzia delle Entrate.'], ['title' => 'راجع البيانات', 'text' => 'راجع بيانات الدخل والمصروفات والخصومات قبل الإرسال.'], ['title' => 'عدّل عند الحاجة', 'text' => 'يمكن تعديل أو دمج البيانات عندما تكون المعلومات غير مكتملة أو تحتاج تصحيحًا.'], ['title' => 'أرسل واحتفظ بالإيصال', 'text' => 'بعد الإرسال، احتفظ بالـricevuta وتابع حالة الإقرار.']],
                    'Agenzia delle Entrate — Dichiarazione precompilata.', 'تختلف الالتزامات الضريبية حسب الحالة؛ لا نضع حسابًا ضريبيًا هنا.', 'التواريخ تتغير حسب السنة الضريبية. هذا المحتوى مرتبط بـ2026 ويجب إعادة التحقق في كل موسم.',
                    '2026 pre-filled tax return', 'How to access, review, edit and submit the 2026 pre-filled return.', 'Agenzia delle Entrate provides pre-filled 730 and Redditi PF information using data collected from multiple sources.',
                    ['SPID, CIE or CNS or other supported credentials', 'Income and expense data to review', 'CU and supporting documents'],
                    [['title' => 'Access the pre-filled return', 'text' => 'Use a supported digital identity or credential.'], ['title' => 'Review the data', 'text' => 'Check income, expenses and deductions before submission.'], ['title' => 'Edit when needed', 'text' => 'Correct or integrate information when required.'], ['title' => 'Submit and keep the receipt', 'text' => 'After submission, keep the receipt and check the filing status.']],
                    'Agenzia delle Entrate pre-filled return service.', 'Tax obligations depend on the person’s situation; no tax calculation is provided here.', 'Dates are tax-year specific. This guide is for 2026 and must be re-verified each filing season.',
                    'Dichiarazione precompilata 2026', 'Come accedere, controllare, modificare e inviare la dichiarazione precompilata 2026.', 'L’Agenzia delle Entrate rende disponibili dati precompilati per 730 e Redditi PF tramite informazioni provenienti da diverse fonti.',
                    ['SPID, CIE o CNS o altre credenziali supportate', 'Dati reddituali e spese da verificare', 'CU e documentazione di supporto'],
                    [['title' => 'Accedi alla precompilata', 'text' => 'Usa una modalità di autenticazione supportata.'], ['title' => 'Controlla i dati', 'text' => 'Verifica redditi, spese e detrazioni.'], ['title' => 'Modifica se necessario', 'text' => 'Integra o correggi i dati quando richiesto.'], ['title' => 'Invia e conserva la ricevuta', 'text' => 'Dopo l’invio conserva la ricevuta.']],
                    'Servizio Dichiarazione precompilata dell’Agenzia delle Entrate.', 'Gli obblighi fiscali dipendono dalla situazione individuale.', 'Le date cambiano per anno fiscale. Questa guida riguarda il 2026 e va verificata ogni stagione.',
                ),
                'service' => ['slug' => 'dichiarazione-precompilata-servizio', 'domain' => 'tax', 'translations' => [
                    'ar' => ['name' => 'Dichiarazione precompilata 2026', 'summary' => 'الوصول والمراجعة والإرسال إلكترونيًا.', 'how_to_apply' => 'ادخل عبر SPID/CIE/CNS واختر النموذج المناسب.', 'required_documents' => ['هوية رقمية', 'CU', 'بيانات الدخل والمصروفات'], 'notes' => 'تحقق من المواعيد السنوية.'],
                    'en' => ['name' => '2026 pre-filled tax return', 'summary' => 'Online access, review and submission.', 'how_to_apply' => 'Sign in with SPID/CIE/CNS and choose the relevant return.', 'required_documents' => ['Digital identity', 'CU', 'Income/expense data'], 'notes' => 'Check annual deadlines.'],
                    'it' => ['name' => 'Dichiarazione precompilata 2026', 'summary' => 'Accesso, controllo e invio online.', 'how_to_apply' => 'Accedi con SPID/CIE/CNS e scegli il modello.', 'required_documents' => ['Identità digitale', 'CU', 'Dati reddituali e spese'], 'notes' => 'Controlla le scadenze annuali.'],
                ]],
            ],
            [
                'slug' => 'assegno-unico-2026',
                'category' => 'family',
                'italian_term' => 'Assegno unico e universale',
                'source_name' => 'INPS',
                'source_url' => 'https://www.inps.it/it/it/dettaglio-scheda.it.schede-servizio-strumento.schede-servizi.assegno-unico-e-universale-per-i-figli-a-carico-55984.assegno-unico-e-universale-per-i-figli-a-carico.html',
                'translations' => $t(
                    'Assegno Unico للعائلات في 2026', 'شرح مبسط عن إعانة الأطفال من INPS وما علاقة ISEE بها.', 'Assegno Unico e Universale هو دعم اقتصادي للأسر التي لديها أطفال، وفق شروط الاستحقاق والقواعد السارية.',
                    ['بيانات الأسرة والأطفال', 'ISEE صالح عند الحاجة للاستفادة من القيمة المرتبطة به', 'بيانات الدفع والبنك عند انطباقها'],
                    [['title' => 'تحقق من الأهلية', 'text' => 'الاستحقاق يعتمد على شروط تتعلق بالأطفال والأسرة والإقامة وغيرها.'], ['title' => 'قدّم أو حدّث الطلب', 'text' => 'INPS يوفر خدمة طلب وإدارة AUU.'], ['title' => 'حدّث ISEE', 'text' => 'في 2026 يؤثر ISEE صالح على قيمة الاستحقاق، مع قواعد خاصة عند عدم وجود ISEE.'], ['title' => 'تابع حالة الطلب', 'text' => 'استخدم خدمة INPS لمتابعة الطلب وتحديث البيانات عند تغير وضع الأسرة.']],
                    'INPS — Assegno unico e universale.', 'المبلغ يعتمد على القواعد وISEE والظروف؛ لا نضع رقمًا ثابتًا في هذا الدليل.', 'في 2026 نشرت INPS قواعد ومبالغ محدثة، لذلك يجب إعادة التحقق من القيم في كل سنة.',
                    'Assegno Unico 2026', 'A practical overview of the Italian child benefit and the role of ISEE.', 'Assegno Unico e Universale is financial support for families with dependent children subject to eligibility rules.',
                    ['Household and children information', 'Valid ISEE where applicable', 'Payment/bank information where applicable'],
                    [['title' => 'Check eligibility', 'text' => 'Eligibility depends on children, household and residence-related requirements.'], ['title' => 'Apply or update the claim', 'text' => 'INPS provides the online service for managing AUU.'], ['title' => 'Keep ISEE current', 'text' => 'For 2026, a valid ISEE affects the amount, with specific rules when no ISEE is available.'], ['title' => 'Track the application', 'text' => 'Use the INPS service to check status and update family/payment information when needed.']],
                    'INPS online service.', 'The amount depends on ISEE and the applicable family rules; no fixed amount is stated here.', 'INPS updates amounts and thresholds by year. Re-check the current 2026 page before relying on figures.',
                    'Assegno Unico 2026', 'Panoramica dell’assegno per i figli e del ruolo dell’ISEE.', 'L’Assegno unico e universale è un sostegno economico per famiglie con figli a carico, secondo i requisiti previsti.',
                    ['Dati del nucleo e dei figli', 'ISEE valido quando previsto', 'Dati di pagamento secondo il caso'],
                    [['title' => 'Verifica i requisiti', 'text' => 'L’accesso dipende dai requisiti previsti per figli, nucleo e situazione di soggiorno/residenza.'], ['title' => 'Presenta o aggiorna la domanda', 'text' => 'INPS mette a disposizione il servizio online.'], ['title' => 'Mantieni aggiornato l’ISEE', 'text' => 'Nel 2026 l’ISEE valido incide sull’importo secondo le regole vigenti.'], ['title' => 'Controlla la domanda', 'text' => 'Usa il servizio INPS per lo stato e gli aggiornamenti.']],
                    'Servizio online INPS.', 'L’importo dipende dalla situazione e dall’ISEE.', 'Gli importi e le soglie vengono aggiornati: verifica sempre la pagina INPS dell’anno corrente.',
                ),
                'service' => ['slug' => 'assegno-unico-servizio', 'domain' => 'social_security', 'translations' => [
                    'ar' => ['name' => 'Assegno Unico e Universale', 'summary' => 'طلب ومتابعة دعم الأطفال من INPS.', 'how_to_apply' => 'استخدم خدمة AUU على INPS وحدّث ISEE عند الحاجة.', 'required_documents' => ['بيانات الأطفال', 'ISEE', 'بيانات الدفع'], 'notes' => 'القيم تتغير سنويًا.'],
                    'en' => ['name' => 'Assegno Unico e Universale', 'summary' => 'INPS child-benefit application and management.', 'how_to_apply' => 'Use the INPS AUU service and keep ISEE information updated when applicable.', 'required_documents' => ['Children data', 'ISEE', 'Payment data'], 'notes' => 'Amounts change by year.'],
                    'it' => ['name' => 'Assegno unico e universale', 'summary' => 'Domanda e gestione del sostegno per i figli.', 'how_to_apply' => 'Usa il servizio INPS AUU e aggiorna l’ISEE quando previsto.', 'required_documents' => ['Dati dei figli', 'ISEE', 'Dati di pagamento'], 'notes' => 'Importi e soglie cambiano annualmente.'],
                ]],
            ],
        ];
    }
}
