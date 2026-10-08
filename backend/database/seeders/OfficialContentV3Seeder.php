<?php

namespace Database\Seeders;

use App\Domains\Government\Models\GovernmentService;
use App\Domains\Guides\Models\Guide;
use Illuminate\Database\Seeder;

/**
 * EXPA official content slice v3.
 * Sources checked 2026-10-08. Summarised content only; staging/production enters review.
 */
class OfficialContentV3Seeder extends Seeder
{
    private const VERIFIED_AT = '2026-10-08';

    public function run(): void
    {
        foreach ($this->items() as $i => $item) {
            $guide = Guide::updateOrCreate(['slug' => $item['slug']], [
                'category' => $item['category'],
                'italian_term' => $item['italian_term'],
                'sort_order' => 1000 + ($i * 10),
                'source_name' => $item['source_name'],
                'source_url' => $item['source_url'],
                'source_type' => 'official',
                'last_verified_at' => self::VERIFIED_AT,
            ]);
            $guide->setTranslations($item['translations']);
            $this->lifecycle($guide);

            if ($item['service'] ?? null) {
                $service = GovernmentService::updateOrCreate(['slug' => $item['service']['slug']], [
                    'domain' => $item['service']['domain'],
                    'italian_term' => $item['italian_term'],
                    'guide_id' => $guide->id,
                    'sort_order' => 1000 + ($i * 10),
                    'source_name' => $item['source_name'],
                    'source_url' => $item['source_url'],
                    'source_type' => 'official',
                    'last_verified_at' => self::VERIFIED_AT,
                ]);
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
        $guide = function (
            string $arTitle, string $arSummary, string $arWhat, array $arDocs, array $arSteps, string $arWhere, string $arCost, string $arBody,
            string $enTitle, string $enSummary, string $enWhat, array $enDocs, array $enSteps, string $enWhere, string $enCost, string $enBody,
            string $itTitle, string $itSummary, string $itWhat, array $itDocs, array $itSteps, string $itWhere, string $itCost, string $itBody
        ): array {
            $tr = fn ($title, $summary, $what, $docs, $steps, $where, $cost, $body) => compact('title', 'summary', 'what', 'docs', 'steps', 'where', 'cost', 'body');
            $map = function ($x) {
                return [
                    'title' => $x['title'], 'summary' => $x['summary'], 'what_is' => $x['what'], 'required_documents' => $x['docs'],
                    'steps' => $x['steps'], 'where_to_apply' => $x['where'], 'costs' => $x['cost'], 'body' => $x['body'],
                ];
            };

            return ['ar' => $map($tr($arTitle, $arSummary, $arWhat, $arDocs, $arSteps, $arWhere, $arCost, $arBody)),
                'en' => $map($tr($enTitle, $enSummary, $enWhat, $enDocs, $enSteps, $enWhere, $enCost, $enBody)),
                'it' => $map($tr($itTitle, $itSummary, $itWhat, $itDocs, $itSteps, $itWhere, $itCost, $itBody))];
        };

        $service = fn (string $arName, string $arSummary, string $arHow, array $arDocs, string $arNotes,
            string $enName, string $enSummary, string $enHow, array $enDocs, string $enNotes,
            string $itName, string $itSummary, string $itHow, array $itDocs, string $itNotes) => [
                'ar' => ['name' => $arName, 'summary' => $arSummary, 'how_to_apply' => $arHow, 'required_documents' => $arDocs, 'notes' => $arNotes],
                'en' => ['name' => $enName, 'summary' => $enSummary, 'how_to_apply' => $enHow, 'required_documents' => $enDocs, 'notes' => $enNotes],
                'it' => ['name' => $itName, 'summary' => $itSummary, 'how_to_apply' => $itHow, 'required_documents' => $itDocs, 'notes' => $itNotes],
            ];

        return [
            [
                'slug' => 'registrazione-contratto-affitto',
                'category' => 'housing', 'italian_term' => 'Registrazione contratto di locazione',
                'source_name' => 'Agenzia delle Entrate', 'source_url' => 'https://apptel.agenziaentrate.gov.it/RliWeb/',
                'translations' => $guide(
                    'تسجيل عقد الإيجار في إيطاليا', 'متى وكيف يتم تسجيل عقد الإيجار وما الذي يجب الانتباه إليه.', 'عقود إيجار العقارات يجب تسجيلها وفق القواعد الضريبية، مع استثناءات محددة للعقود القصيرة جدًا.',
                    ['بيانات المؤجر والمستأجر', 'بيانات العقد والعقار', 'نموذج RLI أو القناة الإلكترونية المناسبة', 'المستندات المطلوبة حسب نوع العقد'],
                    [['title' => 'تحقق هل التسجيل إلزامي', 'text' => 'Agenzia delle Entrate تذكر أن عقود الإيجار يجب تسجيلها، مع استثناء العقود التي لا تتجاوز 30 يومًا إجمالًا في السنة.'], ['title' => 'احسب المهلة', 'text' => 'التسجيل يجب أن يتم خلال 30 يومًا من تاريخ توقيع العقد أو من تاريخ بدايته إذا كان أسبق.'], ['title' => 'استخدم RLI Web', 'text' => 'يمكن استخدام RLI Web لتقديم طلب تسجيل العقد وإجراءات لاحقة.'], ['title' => 'احتفظ بالإيصال', 'text' => 'احفظ ricevuta التسجيل وأي رقم تعريف للعقد.']],
                    'Agenzia delle Entrate أو RLI Web.', 'قد توجد imposta di registro وbollo حسب النظام المختار؛ تحقق من الحالة المحددة.', 'لا تعتمد على مدة أو مبلغ خارج المصدر الرسمي. صفحة RLI الرسمية توضح مهلة التسجيل والاستثناء الخاص بالعقود القصيرة.',
                    'Registering a rental contract in Italy', 'When and how a rental contract is registered and what to check.', 'Italian rental contracts generally have to be registered, subject to specific exceptions.',
                    ['Landlord and tenant details', 'Contract and property data', 'RLI form or applicable online channel', 'Documents required for the contract type'],
                    [['title' => 'Check whether registration is required', 'text' => 'Agenzia delle Entrate states that rental contracts must be registered, with an exception for contracts not exceeding 30 total days in the year.'], ['title' => 'Check the deadline', 'text' => 'Registration must normally be completed within 30 days of signing or the earlier effective date.'], ['title' => 'Use RLI Web', 'text' => 'RLI Web can be used to prepare a registration request and later compliance steps.'], ['title' => 'Keep the receipt', 'text' => 'Keep the registration receipt and contract identifier.']],
                    'Agenzia delle Entrate / RLI Web.', 'Registration and stamp taxes can depend on the tax regime; check the specific case.', 'The 30-day rule and short-contract exception come from the cited official source.',
                    'Registrazione del contratto di locazione', 'Quando e come registrare un contratto di locazione.', 'I contratti di locazione devono essere registrati secondo le regole fiscali, con specifiche eccezioni.',
                    ['Dati del locatore e conduttore', 'Dati del contratto e dell’immobile', 'Modello RLI o canale telematico', 'Documentazione richiesta'],
                    [['title' => 'Verifica l’obbligo', 'text' => 'L’Agenzia delle Entrate indica l’obbligo di registrazione, con eccezione per contratti complessivamente non superiori a 30 giorni nell’anno.'], ['title' => 'Controlla il termine', 'text' => 'La registrazione va effettuata entro 30 giorni dalla stipula o dalla decorrenza se anteriore.'], ['title' => 'Usa RLI Web', 'text' => 'RLI Web permette di predisporre la registrazione e gli adempimenti successivi.'], ['title' => 'Conserva la ricevuta', 'text' => 'Conserva la ricevuta e il codice identificativo del contratto.']],
                    'Agenzia delle Entrate / RLI Web.', 'Imposta di registro e bollo dipendono dal regime applicabile.', 'Verifica sempre il regime fiscale e i dati del contratto sulla fonte ufficiale.'
                ),
                'service' => ['slug' => 'registrazione-affitto-rli', 'domain' => 'tax', 'translations' => $service(
                    'تسجيل عقد الإيجار RLI', 'تسجيل عقد الإيجار وإجراءات العقد اللاحقة.', 'استخدم RLI Web أو القناة التي تحددها Agenzia delle Entrate.', ['بيانات العقد', 'RLI', 'بيانات الأطراف'], 'المهلة المعتادة 30 يومًا وفق المصدر الرسمي.',
                    'RLI rental registration', 'Rental-contract registration and later compliance.', 'Use RLI Web or the channel specified by Agenzia delle Entrate.', ['Contract data', 'RLI', 'Party details'], 'The cited official page states the normal 30-day registration deadline.',
                    'Registrazione locazione RLI', 'Registrazione del contratto e adempimenti successivi.', 'Usa RLI Web o il canale indicato dall’Agenzia delle Entrate.', ['Dati contratto', 'RLI', 'Dati delle parti'], 'La fonte indica il termine ordinario di 30 giorni.'
                )],
            ],
            [
                'slug' => 'cedolare-secca-locazioni',
                'category' => 'housing', 'italian_term' => 'Cedolare secca',
                'source_name' => 'Agenzia delle Entrate', 'source_url' => 'https://infoprecompilata.agenziaentrate.gov.it/portale/sl/web/guest/semplificata-mod-fabbricati',
                'translations' => $guide(
                    'Cedolare Secca: ضريبة بديلة على بعض الإيجارات', 'شرح مبسط لنظام Cedolare Secca ومتى يرتبط بعقد سكني.', 'Cedolare secca نظام ضريبي بديل يخص المؤجر المؤهل لبعض عقود الإيجار السكنية.',
                    ['بيانات عقد الإيجار', 'بيانات المؤجر والعقار', 'المعلومات المطلوبة عند التسجيل أو اختيار النظام'],
                    [['title' => 'تحقق من الأهلية', 'text' => 'الخيار يخص المؤجر صاحب حق الملكية أو حق عيني آخر على العقار، وفق الشروط.'], ['title' => 'اختر النظام عند التسجيل', 'text' => 'الخيار يمكن إظهاره عند تسجيل العقد عندما تنطبق الشروط.'], ['title' => 'تابع التجديد', 'text' => 'عند تمديد العقد يجب الانتباه إلى الإجراء المطلوب لاستمرار النظام.'], ['title' => 'راجع تعليمات السنة', 'text' => 'القواعد والنسب يجب مراجعتها في التعليمات الرسمية للسنة الضريبية.']],
                    'Agenzia delle Entrate.', 'لا نضع نسبة عامة هنا لأن النظام قد يختلف حسب نوع العقد والقواعد السارية.', 'Cedolare secca ليست متاحة لكل عقد أو لكل مؤجر. استخدم المصدر الرسمي قبل اتخاذ قرار ضريبي.',
                    'Cedolare secca for rentals', 'A practical explanation of the substitute tax regime for eligible residential rentals.', 'Cedolare secca is an alternative tax regime available to eligible landlords for certain residential leases.',
                    ['Lease details', 'Landlord and property details', 'Information required for registration or election'],
                    [['title' => 'Check eligibility', 'text' => 'The option is available to eligible landlords holding ownership or another qualifying real right.'], ['title' => 'Elect the regime', 'text' => 'The election can be made at registration when the conditions apply.'], ['title' => 'Check extensions', 'text' => 'When a lease is extended, follow the official communication rules to continue the regime.'], ['title' => 'Check the tax year', 'text' => 'Rates and detailed rules must be verified against current official instructions.']],
                    'Agenzia delle Entrate.', 'No universal rate is stated here because the applicable regime can depend on the contract.', 'Cedolare secca is not available for every lease or landlord.',
                    'Cedolare secca sulle locazioni', 'Spiegazione del regime sostitutivo per le locazioni abitative ammesse.', 'La cedolare secca è un regime fiscale alternativo per determinati contratti abitativi.',
                    ['Dati del contratto', 'Dati del locatore e dell’immobile', 'Informazioni richieste per registrazione/opzione'],
                    [['title' => 'Verifica i requisiti', 'text' => 'L’opzione spetta al locatore che possiede i requisiti previsti.'], ['title' => 'Esercita l’opzione', 'text' => 'Può essere esercitata in sede di registrazione quando applicabile.'], ['title' => 'Controlla le proroghe', 'text' => 'Per mantenere il regime durante la proroga, verifica la comunicazione richiesta.'], ['title' => 'Controlla l’anno fiscale', 'text' => 'Aliquote e regole vanno verificate nelle istruzioni aggiornate.']],
                    'Agenzia delle Entrate.', 'L’imposizione dipende dal regime applicabile.', 'Non tutte le locazioni rientrano nella cedolare secca.'
                ),
            ],
            [
                'slug' => 'bonus-asilo-nido-2026',
                'category' => 'family', 'italian_term' => 'Bonus asilo nido 2026',
                'source_name' => 'INPS', 'source_url' => 'https://www.inps.it/it/it/inps-comunica/notizie/dettaglio-news-page.news.2026.03.bonus-asilo-nido-2026-attivo-il-servizio-per-la-domanda.html',
                'translations' => $guide(
                    'Bonus الحضانة 2026', 'دليل عملي لطلب Bonus asilo nido في 2026.', 'مساهمة من INPS للمصاريف المرتبطة بدور الحضانة المؤهلة، مع مسار دعم منزلي لبعض الأطفال ذوي الأمراض المزمنة الخطيرة.',
                    ['بيانات الطفل', 'بيانات الحضانة ومعلومات اعتمادها', 'مستندات المصروفات الشهرية', 'ISEE الخاص بالخدمات الأسرية عند انطباقه'],
                    [['title' => 'تحقق من الحضانة', 'text' => 'INPS يتحقق من أن المنشأة مؤهلة لتقديم خدمات الأطفال 0–3 وفق القواعد الإقليمية.'], ['title' => 'قدّم الطلب', 'text' => 'الطلب يتم أونلاين عبر INPS أو من خلال Patronato.'], ['title' => 'حدد الأشهر', 'text' => 'في طلب الحضانة تختار الأشهر التي تطلب عنها المساهمة.'], ['title' => 'ارفع إثبات المصروفات', 'text' => 'يجب تحميل مستندات المصروفات وفق المواعيد التي تحددها INPS.']],
                    'INPS أو Patronato.', 'يمكن أن يصل الدعم إلى 3,600 يورو سنويًا وفق شروط وISEE محدد؛ تحقق من الحالة قبل الاعتماد على المبلغ.', 'لـ2026 أوضحت INPS أن الطلب يستمر حتى أغسطس من سنة إتمام الطفل ثلاث سنوات، مع تحديث سنوي للبيانات المطلوبة.',
                    '2026 nursery bonus', 'How to apply for the 2026 INPS nursery contribution.', 'A contribution for eligible nursery fees, with a home-support route for certain children with serious chronic conditions.',
                    ['Child data', 'Nursery accreditation details', 'Monthly expense evidence', 'Applicable family-benefit ISEE'],
                    [['title' => 'Check the nursery', 'text' => 'INPS verifies that the facility is authorised under the applicable regional rules.'], ['title' => 'Apply', 'text' => 'Apply online through INPS or via a patronato.'], ['title' => 'Select months', 'text' => 'For nursery attendance, select the months for which you request the contribution.'], ['title' => 'Upload expenses', 'text' => 'Upload the required expense evidence within the applicable deadlines.']],
                    'INPS or patronato.', 'The contribution can reach €3,600 per year under the applicable conditions; verify the current case.', 'For 2026, INPS states that applications remain valid until August of the year the child turns three, with annual updates.',
                    'Bonus asilo nido 2026', 'Come richiedere il contributo INPS per il nido nel 2026.', 'Contributo per rette di strutture educative 0–3 abilitate e, in alcuni casi, supporto domiciliare.',
                    ['Dati del bambino', 'Dati di abilitazione della struttura', 'Documenti di spesa', 'ISEE specifico quando previsto'],
                    [['title' => 'Verifica la struttura', 'text' => 'INPS controlla l’abilitazione della struttura secondo le regole regionali.'], ['title' => 'Presenta la domanda', 'text' => 'La domanda è online o tramite patronato.'], ['title' => 'Indica le mensilità', 'text' => 'Seleziona le mensilità richieste.'], ['title' => 'Carica le spese', 'text' => 'Carica la documentazione di spesa secondo le scadenze.']],
                    'INPS o patronato.', 'Il contributo può arrivare a €3.600 annui secondo i requisiti.', 'Nel 2026 la domanda è valida fino ad agosto dell’anno in cui il bambino compie tre anni, con aggiornamento annuale.'
                ),
                'service' => ['slug' => 'bonus-asilo-nido-2026-servizio', 'domain' => 'social_security', 'translations' => $service(
                    'Bonus asilo nido 2026', 'مساهمة الحضانة من INPS.', 'قدّم الطلب عبر INPS أو Patronato.', ['بيانات الطفل', 'بيانات الحضانة', 'مصروفات'], 'تحقق من اعتماد الحضانة.',
                    '2026 nursery bonus', 'INPS nursery contribution.', 'Apply through INPS or a patronato.', ['Child data', 'Nursery details', 'Expense evidence'], 'Check facility authorisation.',
                    'Bonus asilo nido 2026', 'Contributo INPS per il nido.', 'Presenta la domanda tramite INPS o patronato.', ['Dati bambino', 'Struttura', 'Spese'], 'Verifica l’abilitazione della struttura.'
                )],
            ],
            [
                'slug' => 'bonus-nuovi-nati-2026',
                'category' => 'family', 'italian_term' => 'Bonus nuovi nati 2026',
                'source_name' => 'INPS', 'source_url' => 'https://www.inps.it/it/it/inps-comunica/notizie/dettaglio-news-page.news.2026.04.bonus-nuovi-nati-2026-al-via-le-domande.html',
                'translations' => $guide(
                    'Bonus المواليد الجدد 2026', 'دليل طلب Bonus nuovi nati للمواليد أو حالات التبني/الرعاية قبل التبني في 2026.', 'مساهمة لمرة واحدة قدرها 1,000 يورو لكل طفل عند استيفاء شروط البرنامج في 2026.',
                    ['بيانات الطفل أو واقعة التبني/الرعاية', 'ISEE الخاص بالخدمات الأسرية للطفل', 'بيانات مقدم الطلب والدفع'],
                    [['title' => 'تحقق من الحد الاقتصادي', 'text' => 'INPS يشترط ISEE محددًا للطفل لا يتجاوز 40,000 يورو وفق الصفحة الرسمية.'], ['title' => 'تحقق من تاريخ الواقعة', 'text' => 'البرنامج يغطي الأحداث الواقعة من 1 يناير إلى 31 ديسمبر 2026 وفق الشروط.'], ['title' => 'قدّم الطلب في الموعد', 'text' => 'المهلة العادية 120 يومًا من الولادة أو دخول الطفل للأسرة في الحالات المحددة.'], ['title' => 'قدّم الطلب أونلاين', 'text' => 'يمكن استخدام الخدمة المخصصة أو تطبيق INPS Mobile أو Contact Center أو Patronato وفق التحديثات الرسمية.']],
                    'INPS.', '1,000 يورو لمرة واحدة عند استيفاء الشروط.', 'المواعيد حساسة جدًا: بالنسبة لبعض أحداث 2026 السابقة لفتح الخدمة، INPS حددت مهلة خاصة؛ لا تستخدم تاريخًا عامًا دون التحقق من صفحة INPS.',
                    '2026 new-birth bonus', 'How to apply for the 2026 Bonus nuovi nati.', 'A one-off €1,000 contribution for each eligible child born, adopted or placed for pre-adoption foster care in 2026.',
                    ['Child/event details', 'Specific family-benefit ISEE', 'Applicant and payment details'],
                    [['title' => 'Check the economic threshold', 'text' => 'INPS states an applicable ISEE threshold of €40,000 for the child.'], ['title' => 'Check the event date', 'text' => 'The 2026 measure covers qualifying events from 1 January to 31 December 2026.'], ['title' => 'Watch the deadline', 'text' => 'The ordinary deadline is 120 days from the event in the applicable cases.'], ['title' => 'Submit the application', 'text' => 'Use the dedicated INPS service, app, Contact Center or patronato as currently supported.']],
                    'INPS.', '€1,000 one-off when eligible.', 'Deadlines are time-sensitive; special transitional timing applied to events before the service opened.',
                    'Bonus nuovi nati 2026', 'Come richiedere il Bonus nuovi nati per il 2026.', 'Contributo una tantum di €1.000 per ogni figlio nato, adottato o in affidamento preadottivo quando ricorrono i requisiti.',
                    ['Dati del minore/evento', 'ISEE per specifiche prestazioni familiari', 'Dati del richiedente e pagamento'],
                    [['title' => 'Verifica l’ISEE', 'text' => 'INPS indica un valore ISEE non superiore a €40.000 per il minore.'], ['title' => 'Verifica la data', 'text' => 'La misura 2026 riguarda gli eventi previsti dal 1° gennaio al 31 dicembre 2026.'], ['title' => 'Controlla il termine', 'text' => 'Il termine ordinario è di 120 giorni dall’evento nei casi previsti.'], ['title' => 'Presenta la domanda', 'text' => 'Usa il servizio INPS, l’app, il Contact Center o un patronato secondo le modalità aggiornate.']],
                    'INPS.', '€1.000 una tantum quando spettante.', 'Le scadenze sono sensibili: per alcuni eventi precedenti all’apertura del servizio sono state previste regole transitorie.'
                ),
                'service' => ['slug' => 'bonus-nuovi-nati-2026-servizio', 'domain' => 'social_security', 'translations' => $service(
                    'Bonus nuovi nati 2026', 'دعم لمرة واحدة للمواليد الجدد المؤهلين.', 'قدّم الطلب عبر خدمة INPS المخصصة.', ['بيانات الطفل', 'ISEE', 'بيانات مقدم الطلب'], 'المهلة العادية 120 يومًا.',
                    '2026 new-birth bonus', 'One-off support for eligible births/adoptions.', 'Apply through the dedicated INPS service.', ['Child data', 'ISEE', 'Applicant data'], 'Ordinary deadline: 120 days.',
                    'Bonus nuovi nati 2026', 'Contributo una tantum per i nuovi nati.', 'Presenta la domanda tramite il servizio INPS.', ['Dati minore', 'ISEE', 'Dati richiedente'], 'Termine ordinario: 120 giorni.'
                )],
            ],
            [
                'slug' => 'assegno-inclusione-2026',
                'category' => 'money', 'italian_term' => 'Assegno di Inclusione (ADI)',
                'source_name' => 'INPS', 'source_url' => 'https://www.inps.it/it/it/inps-comunica/notizie/dettaglio-news-page.news.2026.02.assegno-di-inclusione-le-novit-2026.html',
                'translations' => $guide(
                    'Assegno di Inclusione (ADI) في 2026', 'معلومات محدثة عن دعم ADI وشروطه العامة في 2026.', 'ADI هو دعم اقتصادي وإدماج اجتماعي ومهني للأسر التي تستوفي شروط الإقامة/المواطنة/الإقامة القانونية والدخل وبنية الأسرة والمسار المطلوب.',
                    ['ISEE المناسب', 'بيانات الأسرة والدخل والثروة', 'وثائق الإقامة والمواطنة عند انطباقها', 'Patto di Attivazione Digitale عند طلبه'],
                    [['title' => 'تحقق من فئة الأسرة', 'text' => 'يستهدف ADI أسرًا فيها على الأقل شخص من الفئات المحددة مثل القاصر أو شخص ذي إعاقة أو من بلغ 60 عامًا أو حالات ضعف محددة.'], ['title' => 'تحقق من شروط الإقامة والدخل', 'text' => 'هناك شروط مرتبطة بالإقامة والمواطنة/تصريح الإقامة والاختبار الاقتصادي.'], ['title' => 'قدّم الطلب', 'text' => 'يتم تقديم الطلب عبر INPS، مع استكمال الخطوات الرقمية المطلوبة.'], ['title' => 'تابع التجديد', 'text' => 'في 2026 أزيل شهر التعليق بين فترة الـ18 شهرًا والتجديد، مع بقاء قواعد المدة والتجديد المنشورة.']],
                    'INPS / Ministero del Lavoro.', 'القيمة تعتمد على الحالة والـISEE والقواعد السارية؛ لا نضع مبلغًا ثابتًا.', 'ADI برنامج حساس ماليًا وقانونيًا. يجب إعادة التحقق من قواعد 2026 قبل استخدامه في قرار مالي.',
                    'Assegno di Inclusione (ADI) in 2026', 'Updated 2026 overview of ADI and its general eligibility path.', 'ADI is economic and social inclusion support for eligible households subject to residence/status, means-testing and household conditions.',
                    ['Applicable ISEE', 'Household income and asset data', 'Residence/status documents', 'Digital activation steps where required'],
                    [['title' => 'Check household eligibility', 'text' => 'ADI targets households containing at least one person in specified categories, including minors, disability, age 60+ or qualifying disadvantage.'], ['title' => 'Check residence and means tests', 'text' => 'Eligibility includes residence/status and economic conditions.'], ['title' => 'Apply through INPS', 'text' => 'Use the INPS application process and complete the required digital steps.'], ['title' => 'Check renewal rules', 'text' => 'In 2026 the suspension month after the first 18 months was removed, while the published duration and renewal rules remain.']],
                    'INPS / Ministry of Labour.', 'The amount depends on the household and applicable rules; no fixed amount is stated here.', 'Re-check the official 2026 rules before relying on ADI for a financial decision.',
                    'Assegno di Inclusione (ADI) 2026', 'Panoramica aggiornata sull’ADI e sui requisiti generali nel 2026.', 'Misura di sostegno economico e inclusione sociale e lavorativa per nuclei che rispettano i requisiti.',
                    ['ISEE applicabile', 'Dati del nucleo, redditi e patrimonio', 'Documenti di soggiorno/status', 'Passaggi digitali richiesti'],
                    [['title' => 'Verifica il nucleo', 'text' => 'L’ADI riguarda nuclei con almeno un componente nelle categorie previste.'], ['title' => 'Verifica residenza e situazione economica', 'text' => 'Sono richiesti requisiti di residenza/status e prova dei mezzi.'], ['title' => 'Presenta la domanda', 'text' => 'La domanda passa dall’INPS con gli adempimenti digitali previsti.'], ['title' => 'Controlla il rinnovo', 'text' => 'Nel 2026 è stato eliminato il mese di sospensione dopo i primi 18 mesi, secondo le nuove regole.']],
                    'INPS / Ministero del Lavoro.', 'L’importo dipende dal caso e dalle regole vigenti.', 'Verifica sempre le regole 2026 prima di fare affidamento sull’ADI.'
                ),
                'service' => ['slug' => 'adi-2026-servizio', 'domain' => 'social_security', 'translations' => $service(
                    'Assegno di Inclusione 2026', 'دعم اقتصادي واجتماعي للأسر المؤهلة.', 'استخدم خدمة INPS وتحقق من ISEE وشروط الإقامة.', ['ISEE', 'بيانات الأسرة', 'بيانات الإقامة'], 'القواعد تتغير؛ تحقق من 2026.',
                    'ADI 2026', 'Economic and social inclusion support.', 'Use INPS and check ISEE/status requirements.', ['ISEE', 'Household data', 'Status data'], 'Rules are time-sensitive.',
                    'ADI 2026', 'Sostegno economico e inclusione.', 'Usa il servizio INPS e verifica ISEE e requisiti.', ['ISEE', 'Dati nucleo', 'Dati status'], 'Le regole sono aggiornate.'
                )],
            ],
            [
                'slug' => 'isee-specifiche-prestazioni-2026',
                'category' => 'money', 'italian_term' => 'ISEE per specifiche prestazioni familiari e per l’inclusione',
                'source_name' => 'Ministero del Lavoro e delle Politiche Sociali', 'source_url' => 'https://www.lavoro.gov.it/notizie/pagine/nuovo-isee-specifiche-prestazioni-familiari-e-linclusione',
                'translations' => $guide(
                    'ISEE الخاص بالخدمات الأسرية والإدماج 2026', 'ما الجديد في ISEE 2026 لبعض المزايا العائلية والاجتماعية.', 'من 1 يناير 2026 توجد طريقة حساب خاصة لبعض المزايا: ADI وSFL وAUU وBonus nido وBonus nuovi nati.',
                    ['DSU', 'بيانات الأسرة والدخل والثروة', 'بيانات المسكن عند انطباقها'],
                    [['title' => 'حدد هل الميزة مشمولة', 'text' => 'هذا النوع الخاص من ISEE يطبق فقط على مجموعة محددة من المزايا المذكورة رسميًا.'], ['title' => 'قدّم DSU', 'text' => 'تُستخدم DSU لإعداد ISEE، مع البيانات المطلوبة حسب الحالة.'], ['title' => 'تحقق من النتيجة', 'text' => 'استخدم النتيجة المناسبة للميزة التي تتقدم لها.'], ['title' => 'لا تستخدمه لكل شيء', 'text' => 'إذا كانت الميزة خارج القائمة الرسمية، لا تفترض أن ISEE الخاص بها هو المستخدم.']],
                    'INPS / Ministero del Lavoro.', 'لا نضع حسابًا أو قيمة ISEE تقديرية داخل هذا الدليل.', 'هذا محتوى 2026 ويجب إعادة التحقق عند تغير القانون أو السنة الضريبية.',
                    '2026 ISEE for specific family and inclusion benefits', 'What changed in ISEE 2026 for selected family and inclusion benefits.', 'From 1 January 2026 a special ISEE calculation applies to selected benefits including ADI, SFL, AUU, nursery bonus and new-birth bonus.',
                    ['DSU', 'Household income and asset data', 'Housing data where applicable'],
                    [['title' => 'Check whether the benefit is covered', 'text' => 'The special ISEE applies only to the benefits listed by the Ministry.'], ['title' => 'Submit the DSU', 'text' => 'Use the DSU process with the required household information.'], ['title' => 'Use the appropriate result', 'text' => 'Use the applicable ISEE result for the benefit.'], ['title' => 'Do not generalise', 'text' => 'Do not assume this special ISEE applies to every service.']],
                    'INPS / Ministry of Labour.', 'No personal ISEE calculation is provided here.', 'This is 2026-sensitive content and must be re-verified when rules change.',
                    'ISEE per specifiche prestazioni 2026', 'Cosa cambia nel 2026 per alcune prestazioni familiari e di inclusione.', 'Dal 1° gennaio 2026 una modalità specifica di ISEE si applica a determinate prestazioni.',
                    ['DSU', 'Dati reddituali e patrimoniali del nucleo', 'Dati abitativi quando previsti'],
                    [['title' => 'Verifica la prestazione', 'text' => 'L’ISEE specifico vale solo per le prestazioni indicate dal Ministero.'], ['title' => 'Presenta la DSU', 'text' => 'Segui la procedura DSU con i dati richiesti.'], ['title' => 'Usa l’attestazione corretta', 'text' => 'Utilizza il risultato relativo alla prestazione.'], ['title' => 'Non generalizzare', 'text' => 'Non vale automaticamente per ogni servizio.']],
                    'INPS / Ministero del Lavoro.', 'Non viene calcolato un ISEE personale in questa guida.', 'Contenuto sensibile all’anno 2026: verificare a ogni modifica normativa.'
                ),
            ],
            [
                'slug' => 'certificati-roma-online',
                'category' => 'daily_life', 'italian_term' => 'Certificati anagrafici e di stato civile online — Roma',
                'source_name' => 'Roma Capitale', 'source_url' => 'https://www.comune.roma.it/web/it/scheda-servizi.page?contentId=INF138579&tipo=onl',
                'translations' => $guide(
                    'شهادات الحالة المدنية أونلاين في روما', 'استخراج شهادات Anagrafe وStato Civile عبر بوابة Roma Capitale.', 'الخدمة تسمح لسكان Roma Capitale وAIRE di Roma بطلب بعض الشهادات أونلاين لأنفسهم أو لأفراد أسرتهم المسجلين.',
                    ['SPID أو CIE أو CNS', 'بيانات الشخص أو الأسرة', 'وسيلة دفع عند وجود مبلغ مستحق'],
                    [['title' => 'ادخل إلى الخدمة', 'text' => 'استخدم SPID أو CIE أو CNS للتحقق من الهوية.'], ['title' => 'اختر الشهادة', 'text' => 'اختر الشهادة الشخصية أو الخاصة بأحد أفراد الأسرة المسموح بهم.'], ['title' => 'ادفع إذا لزم', 'text' => 'قد توجد رسوم حسب نوع الشهادة والاستخدام.'], ['title' => 'نزّل PDF', 'text' => 'الشهادة الإلكترونية تصدر PDF ويمكن الوصول إليها مباشرة بعد الطلب والدفع إذا كان مطلوبًا.']],
                    'Roma Capitale — Servizi online.', 'قد يكون الدفع مطلوبًا حسب الشهادة؛ تحقق قبل الإرسال.', 'الخدمة لا تسمح بطلب شهادات أشخاص من خارج الأسرة عبر البوابة وفق الصفحة الرسمية.',
                    'Online civil and registry certificates — Rome', 'How to obtain eligible registry and civil-status certificates online in Rome.', 'Rome Capital allows eligible residents and Rome AIRE members to request certificates online for themselves or their registry household.',
                    ['SPID, CIE or CNS', 'Personal/family information', 'Payment method where required'],
                    [['title' => 'Sign in', 'text' => 'Use SPID, CIE or CNS.'], ['title' => 'Choose the certificate', 'text' => 'Select a certificate for yourself or an eligible household member.'], ['title' => 'Pay if required', 'text' => 'Some certificates can require payment.'], ['title' => 'Download PDF', 'text' => 'Online certificates are issued in PDF after the request and payment where due.']],
                    'Roma Capitale online services.', 'Depends on the certificate and intended use.', 'The Rome portal does not allow online requests for third-party certificates through this service.',
                    'Certificati anagrafici online — Roma', 'Come richiedere certificati anagrafici e di stato civile online a Roma.', 'Roma Capitale consente ai residenti e agli iscritti AIRE di Roma di richiedere determinati certificati online.',
                    ['SPID, CIE o CNS', 'Dati personali/familiari', 'Metodo di pagamento quando previsto'],
                    [['title' => 'Accedi', 'text' => 'Usa SPID, CIE o CNS.'], ['title' => 'Scegli il certificato', 'text' => 'Seleziona il certificato personale o familiare ammesso.'], ['title' => 'Paga se previsto', 'text' => 'Alcuni certificati possono richiedere un pagamento.'], ['title' => 'Scarica il PDF', 'text' => 'Il certificato viene reso disponibile nell’area riservata.']],
                    'Servizi online di Roma Capitale.', 'Dipende dal certificato e dall’uso.', 'Il servizio online non consente richieste per soggetti terzi.'
                ),
                'service' => ['slug' => 'certificati-roma-online-servizio', 'domain' => 'civil_registry', 'translations' => $service(
                    'شهادات روما أونلاين', 'شهادات Anagrafe وStato Civile لسكان روما.', 'ادخل بـSPID/CIE/CNS واختر الشهادة.', ['SPID/CIE/CNS', 'بيانات الأسرة'], 'للاستخدام الشخصي أو الأسرة المسجلة.',
                    'Rome online certificates', 'Registry and civil-status certificates.', 'Sign in with SPID/CIE/CNS and select the certificate.', ['SPID/CIE/CNS', 'Family data'], 'For eligible personal/household requests.',
                    'Certificati online Roma', 'Certificati anagrafici e di stato civile.', 'Accedi con SPID/CIE/CNS e scegli il certificato.', ['SPID/CIE/CNS', 'Dati familiari'], 'Per richieste personali/familiari ammesse.'
                )],
            ],
            [
                'slug' => 'oepac-roma-2026-2027',
                'category' => 'family', 'italian_term' => 'OEPAC Roma',
                'source_name' => 'Roma Capitale', 'source_url' => 'https://www.marcoaurelio.comune.roma.it/web/guest/w/domande-online-per-il-servizio-oepac-a.s.-2026-27',
                'translations' => $guide(
                    'خدمة OEPAC في روما للعام الدراسي 2026/27', 'معلومات عن طلب خدمة الدعم التعليمي OEPAC في مدارس روما.', 'OEPAC هو Operatore Educativo per l’Autonomia e la Comunicazione لدعم الطلاب ذوي الإعاقة المعتمدة في مراحل دراسية محددة.',
                    ['شهادة إعاقة معتمدة', 'بيانات الطالب والمدرسة', 'SPID أو CIE أو CNS لتقديم الطلب أونلاين'],
                    [['title' => 'تحقق من الفئة', 'text' => 'الخدمة مخصصة لطلاب ذوي إعاقة معتمدة في رياض الأطفال والابتدائي والإعدادي وفق الإعلان.'], ['title' => 'تحقق من الإقامة', 'text' => 'إعلان 2026/27 يحدد شروط الإقامة في Roma Capitale أو Comuni della Città Metropolitana.'], ['title' => 'قدّم الطلب أونلاين', 'text' => 'يتم التقديم إلكترونيًا باستخدام SPID أو CIE أو CNS.'], ['title' => 'تابع المدرسة/الجهة', 'text' => 'بعد التقديم، اتبع تعليمات Roma Capitale والمدرسة حول تفعيل الخدمة.']],
                    'Roma Capitale — Dipartimento Scuola.', 'لم يضع الإعلان المعروض مبلغًا عامًا للخدمة؛ لا نضع رقمًا.', 'هذا محتوى محلي ومحدد للعام الدراسي 2026/27 ويجب إعادة التحقق في كل سنة دراسية.',
                    'OEPAC service in Rome — 2026/27', 'Information on applying for Rome’s educational autonomy and communication support service.', 'OEPAC provides educational support for students with certified disabilities in specified school levels.',
                    ['Certified disability documentation', 'Student and school details', 'SPID, CIE or CNS'],
                    [['title' => 'Check eligibility', 'text' => 'The service is for students with certified disabilities in the school levels listed in the announcement.'], ['title' => 'Check residence rules', 'text' => 'The 2026/27 notice includes residents of Rome and the Metropolitan City under its eligibility rules.'], ['title' => 'Apply online', 'text' => 'Applications are submitted online with SPID, CIE or CNS.'], ['title' => 'Follow the school process', 'text' => 'After submission, follow the instructions from Roma Capitale and the school.']],
                    'Roma Capitale — school services.', 'No general fee is stated in the cited notice.', 'This is local, school-year-specific content for 2026/27.',
                    'Servizio OEPAC Roma 2026/27', 'Informazioni per richiedere il servizio OEPAC a Roma.', 'OEPAC offre supporto educativo agli alunni con disabilità certificata nei livelli scolastici previsti.',
                    ['Documentazione di disabilità certificata', 'Dati alunno e scuola', 'SPID, CIE o CNS'],
                    [['title' => 'Verifica i requisiti', 'text' => 'Il servizio è rivolto agli alunni con disabilità certificata nei livelli indicati.'], ['title' => 'Verifica la residenza', 'text' => 'L’avviso 2026/27 include residenti a Roma e nella Città Metropolitana secondo i requisiti.'], ['title' => 'Presenta online', 'text' => 'La domanda è esclusivamente online con SPID, CIE o CNS.'], ['title' => 'Segui la scuola', 'text' => 'Dopo la domanda, segui le indicazioni di Roma Capitale e della scuola.']],
                    'Roma Capitale — servizi scolastici.', 'Non è indicato un costo generale nella fonte citata.', 'Contenuto locale e valido per l’anno scolastico 2026/27.'
                ),
                'service' => ['slug' => 'oepac-roma-2026-servizio', 'domain' => 'education', 'translations' => $service(
                    'OEPAC Roma 2026/27','دعم تعليمي للطلاب ذوي الإعاقة المعتمدة.','قدّم الطلب أونلاين بـSPID/CIE/CNS.',['شهادة إعاقة', 'بيانات الطالب', 'SPID/CIE/CNS'],'محدد للعام الدراسي 2026/27.',
                    'OEPAC Rome 2026/27','Educational support service for eligible students.','Apply online with SPID/CIE/CNS.',['Disability certification', 'Student data', 'SPID/CIE/CNS'],'School-year-specific.',
                    'OEPAC Roma 2026/27','Servizio di supporto educativo.','Presenta online con SPID/CIE/CNS.',['Certificazione', 'Dati alunno', 'SPID/CIE/CNS'],'Specifico per l’anno 2026/27.'
                )],
            ],
        ];
    }
}
