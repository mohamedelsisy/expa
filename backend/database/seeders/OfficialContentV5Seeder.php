<?php

namespace Database\Seeders;

use App\Domains\Guides\Models\Guide;
use Illuminate\Database\Seeder;

/**
 * EXPA content expansion V5: practical guides for health, housing, money,
 * family, study, work and self-employment. Summaries are original, not copied.
 * Sources were checked on 2026-10-10. Staging/production remains in review.
 */
class OfficialContentV5Seeder extends Seeder
{
    private const VERIFIED_AT = '2026-10-10';

    public function run(): void
    {
        foreach ($this->items() as $index => $item) {
            $guide = Guide::updateOrCreate(
                ['slug' => $item['slug']],
                [
                    'category' => $item['category'],
                    'italian_term' => $item['italian_term'],
                    'sort_order' => 2000 + ($index * 10),
                    'source_name' => $item['source_name'],
                    'source_url' => $item['source_url'],
                    'source_type' => 'official',
                    'last_verified_at' => self::VERIFIED_AT,
                ]
            );

            $guide->setTranslations($item['translations']);
            $live = app()->environment('local', 'testing');
            $guide->forceFill([
                'status' => $live ? 'published' : 'review',
                'published_at' => $live ? ($guide->published_at ?? now()) : null,
            ])->save();
        }
    }

    private function tr(array $ar, array $en, array $it): array
    {
        return ['ar' => $ar, 'en' => $en, 'it' => $it];
    }

    private function items(): array
    {
        return [
            [
                'slug' => 'ssn-healthcare-registration-foreigners',
                'category' => 'healthcare',
                'italian_term' => 'Iscrizione al Servizio Sanitario Nazionale (SSN)',
                'source_name' => 'Ministero della Salute',
                'source_url' => 'https://www.salute.gov.it/new/it/tema/iscrizione-al-ssn/iscrizione-dei-cittadini-stranieri-al-servizio-sanitario-nazionale-ssn/',
                'translations' => $this->tr(
                    [
                        'title' => 'التسجيل في النظام الصحي الإيطالي SSN',
                        'summary' => 'دليل عملي لفهم التسجيل في الخدمة الصحية الوطنية واختيار طبيب الأسرة، مع توضيح أن الأهلية والمستندات تختلف حسب وضع الإقامة.',
                        'what_is' => 'Servizio Sanitario Nazionale (SSN) هو النظام الصحي العام في إيطاليا. بعد التسجيل، يمكن للمؤهلين اختيار طبيب أسرة (medico di medicina generale) والاستفادة من الخدمات وفق القواعد الوطنية والإقليمية.',
                        'who_needs' => 'الأجانب المقيمون أو الموجودون في إيطاليا الذين يحتاجون إلى معرفة هل يحق لهم التسجيل الإلزامي أو الاختياري، وما الجهة التي يجب التواصل معها.',
                        'required_documents' => ['جواز سفر أو وثيقة هوية سارية', 'تصريح الإقامة أو إيصال طلب الإصدار/التجديد عند انطباقه', 'Codice Fiscale', 'إثبات الإقامة أو تصريح بالسكن الفعلي إذا طلبته ASL', 'مستندات إضافية بحسب نوع التصريح والحالة'],
                        'steps' => [
                            ['title' => 'حدد نوع استحقاقك', 'text' => 'التسجيل قد يكون إلزاميًا أو اختياريًا. يعتمد ذلك على الجنسية وسبب الإقامة ونوع تصريح الإقامة؛ لا تفترض أن القواعد واحدة للجميع.'],
                            ['title' => 'تواصل مع ASL المختصة', 'text' => 'راجع موقع ASL في منطقتك لمعرفة مكتب التسجيل، والحجز إن كان مطلوبًا، والمستندات المقبولة.'],
                            ['title' => 'جهّز المستندات', 'text' => 'استخدم قائمة المستندات كتحضير أولي فقط؛ قد تطلب ASL وثائق إضافية بحسب حالتك.'],
                            ['title' => 'اختر طبيب الأسرة', 'text' => 'بعد إتمام التسجيل، اسأل ASL عن طريقة اختيار medico di base أو طبيب الأطفال عند الحاجة.'],
                            ['title' => 'تابع التجديد', 'text' => 'مدة التسجيل قد ترتبط بمدة تصريح الإقامة. تحقق من موعد التجديد ومن المستندات المطلوبة عند تجديد التصريح.'],
                        ],
                        'where_to_apply' => 'في ASL المختصة بمحل الإقامة المسجل أو محل السكن الفعلي وفق الحالة. في روما، راجع ASL Roma المختصة بمنطقتك.',
                        'costs' => 'التسجيل الإلزامي يكون مجانيًا عادةً للفئات التي ينطبق عليها. قد يتطلب التسجيل الاختياري مساهمة مالية؛ تحقق من القواعد الحالية في حالتك قبل الدفع.',
                        'processing_time' => 'لا توجد مدة واحدة مناسبة لكل المناطق والحالات. اسأل ASL عن وقت إصدار التسجيل أو Tessera Sanitaria.',
                        'body' => 'مهم: هذا دليل إداري وليس نصيحة طبية. تختلف الأهلية بين العمل والدراسة والإقامة الاختيارية والحماية الدولية وغيرها. المصدر الرسمي لوزارة الصحة يشرح الفئات والمستندات؛ تحقّق أيضًا من موقع ASL المحلي قبل الذهاب.',
                    ],
                    [
                        'title' => 'Registering with Italy’s National Health Service (SSN)',
                        'summary' => 'A practical guide to SSN registration and choosing a family doctor. Eligibility and documents depend on residence status.',
                        'what_is' => 'The Servizio Sanitario Nazionale (SSN) is Italy’s public health service. Eligible members can choose a family doctor and access services under national and regional rules.',
                        'who_needs' => 'Foreign nationals who need to understand whether registration is mandatory or voluntary and which local health authority to contact.',
                        'required_documents' => ['Valid passport or identity document', 'Residence permit or application/renewal receipt where applicable', 'Codice Fiscale', 'Proof of residence or a declaration of actual domicile if requested', 'Additional documents depending on status'],
                        'steps' => [
                            ['title' => 'Check your eligibility', 'text' => 'Registration can be mandatory or voluntary depending on nationality, reason for stay and residence status. Do not assume the same rules apply to everyone.'],
                            ['title' => 'Contact your local ASL', 'text' => 'Check the local health authority website for the registration office, booking rules and accepted documents.'],
                            ['title' => 'Prepare your documents', 'text' => 'Use this checklist as a starting point; the ASL may request additional evidence for your specific case.'],
                            ['title' => 'Choose a family doctor', 'text' => 'After registration, ask the ASL how to choose a medico di base or paediatrician if needed.'],
                            ['title' => 'Track renewal dates', 'text' => 'Registration validity may be linked to your residence permit. Check what is required when your permit is renewed.'],
                        ],
                        'where_to_apply' => 'At the ASL responsible for your registered residence or actual domicile, depending on the case. In Rome, identify the ASL serving your area.',
                        'costs' => 'Mandatory registration is generally free for eligible categories. Voluntary registration may require a contribution; verify the current rule for your case before paying.',
                        'processing_time' => 'There is no single processing time for every region and case. Ask your ASL about registration and health-card issuance times.',
                        'body' => 'This is administrative guidance, not medical advice. Eligibility differs for workers, students, elective residence, international protection and other statuses. Check the Ministry of Health page and your local ASL before visiting.',
                    ],
                    [
                        'title' => 'Iscrizione al Servizio Sanitario Nazionale (SSN)',
                        'summary' => 'Guida pratica all’iscrizione al SSN e alla scelta del medico di base. Requisiti e documenti dipendono dal titolo di soggiorno.',
                        'what_is' => 'Il Servizio Sanitario Nazionale è il sistema pubblico di assistenza sanitaria italiano. Le persone aventi diritto possono scegliere un medico di medicina generale secondo le regole nazionali e regionali.',
                        'who_needs' => 'Cittadini stranieri che devono capire se l’iscrizione è obbligatoria o volontaria e quale ASL contattare.',
                        'required_documents' => ['Passaporto o documento d’identità valido', 'Permesso di soggiorno o ricevuta di richiesta/rinnovo, quando applicabile', 'Codice Fiscale', 'Prova di residenza o dichiarazione di effettiva dimora se richiesta', 'Altri documenti in base al caso'],
                        'steps' => [
                            ['title' => 'Verifica il diritto all’iscrizione', 'text' => 'L’iscrizione può essere obbligatoria o volontaria in base a cittadinanza, motivo del soggiorno e titolo di soggiorno.'],
                            ['title' => 'Contatta la ASL competente', 'text' => 'Consulta il sito della ASL locale per ufficio, prenotazione e documenti accettati.'],
                            ['title' => 'Prepara i documenti', 'text' => 'La lista è indicativa: la ASL può chiedere altri documenti in base alla situazione individuale.'],
                            ['title' => 'Scegli il medico', 'text' => 'Dopo l’iscrizione, chiedi come scegliere il medico di medicina generale o il pediatra.'],
                            ['title' => 'Controlla il rinnovo', 'text' => 'La validità può essere collegata al permesso di soggiorno. Verifica cosa presentare al rinnovo.'],
                        ],
                        'where_to_apply' => 'Presso la ASL competente per la residenza o il domicilio effettivo, secondo il caso. A Roma, individua la ASL della tua zona.',
                        'costs' => 'L’iscrizione obbligatoria è generalmente gratuita per le categorie aventi diritto. Quella volontaria può prevedere un contributo: verifica la regola applicabile prima di pagare.',
                        'processing_time' => 'I tempi variano in base alla regione e alla pratica. Chiedi alla ASL i tempi per l’iscrizione e la tessera sanitaria.',
                        'body' => 'Questa guida offre informazioni amministrative, non consigli medici. Le regole cambiano per lavoratori, studenti, soggiorno elettivo, protezione internazionale e altre categorie. Consulta il Ministero della Salute e la ASL locale.',
                    ]
                ),
            ],
            [
                'slug' => 'isee-dsu-how-to-apply',
                'category' => 'money',
                'italian_term' => 'ISEE e Dichiarazione Sostitutiva Unica (DSU)',
                'source_name' => 'INPS',
                'source_url' => 'https://www.inps.it/it/it/dettaglio-scheda.it.schede-servizio-strumento.schede-servizi.Portale-unico-ISEE.html',
                'translations' => $this->tr(
                    [
                        'title' => 'ISEE وDSU: دليل التقديم والمستندات',
                        'summary' => 'افهم ما الذي يقيسه ISEE، ولماذا تحتاج إلى DSU، وكيف تجهز بيانات الأسرة والدخل والأصول قبل التقديم.',
                        'what_is' => 'ISEE هو مؤشر يستخدم لتقييم الوضع الاقتصادي للأسرة عند طلب خدمات ومزايا معينة. للحصول على الشهادة، يجب تقديم DSU التي تتضمن بيانات الأسرة والدخل والأصول المطلوبة.',
                        'who_needs' => 'الأسر أو الأفراد الذين تطلب منهم جامعة أو جهة عامة أو برنامج دعم شهادة ISEE لتحديد الأهلية أو مستوى المساهمة.',
                        'required_documents' => ['Codice Fiscale ووثائق هوية أفراد الأسرة', 'بيانات تكوين الأسرة والإقامة', 'بيانات الدخل للفترة المرجعية التي تحددها قواعد ISEE', 'بيانات الحسابات والأصول المالية والعقارات وفق الفترة المطلوبة', 'معلومات الإيجار أو أي بيانات إضافية يطلبها نموذج DSU'],
                        'steps' => [
                            ['title' => 'حدد نوع ISEE المطلوب', 'text' => 'بعض المزايا تتطلب نوعًا محددًا من ISEE أو مستندات إضافية. اقرأ شروط الجهة التي ستقدم لها الطلب.'],
                            ['title' => 'اجمع بيانات الأسرة', 'text' => 'تحقق من أفراد النواة الأسرية والبيانات الشخصية قبل إدخال DSU. قد تختلف النواة المستخدمة عن تصورك اليومي للأسرة.'],
                            ['title' => 'جهز بيانات الدخل والأصول', 'text' => 'استخدم الفترات المرجعية الموضحة في تعليمات INPS للسنة المعنية؛ لا تفترض أن البيانات تخص السنة الحالية.'],
                            ['title' => 'قدم DSU', 'text' => 'يمكن استخدام Portale Unico ISEE لدى INPS أو الاستعانة بـ CAF. إذا استخدمت النسخة المعبأة مسبقًا، راجع البيانات وأكمل ما ينقص.'],
                            ['title' => 'راجع الشهادة قبل استخدامها', 'text' => 'تحقق من البيانات والقيمة والسنة ونوع ISEE، ثم اتبع تعليمات الجامعة أو الجهة التي طلبتها.'],
                        ],
                        'where_to_apply' => 'من خلال Portale Unico ISEE على موقع INPS أو عبر CAF. قد توفر الجهة التي تطلب الشهادة تعليمات خاصة بها.',
                        'costs' => 'لا تفترض أن كل خدمة CAF مجانية أو أن كل طلب له رسوم واحدة. تحقق من شروط الخدمة قبل الموعد.',
                        'processing_time' => 'يعتمد إصدار الشهادة على اكتمال البيانات والتحقق منها. راجع حالة الطلب في INPS ولا تعتمد على مدة عامة.',
                        'body' => 'قد تؤثر شهادة ISEE في رسوم الجامعة أو بعض الخدمات والمزايا، لكن الأهلية النهائية يحددها البرنامج نفسه. استخدم تعليمات INPS للسنة الحالية، وأدخل البيانات بدقة لأن مقدم DSU مسؤول عن صحة ما يصرح به.',
                    ],
                    [
                        'title' => 'ISEE and DSU: application and document guide',
                        'summary' => 'Understand what ISEE measures, why a DSU is needed, and how to prepare household, income and asset information.',
                        'what_is' => 'ISEE is an indicator used to assess a household’s economic situation for certain services and benefits. To obtain the certificate, you submit a DSU containing the required household, income and asset information.',
                        'who_needs' => 'Households or individuals asked by a university, public body or benefit programme to provide an ISEE certificate for eligibility or contribution calculations.',
                        'required_documents' => ['Codice Fiscale and identity documents for household members', 'Household composition and residence information', 'Income information for the reference period specified by ISEE rules', 'Bank, financial and property asset information for the required reference period', 'Rent details and any other information requested by the DSU form'],
                        'steps' => [
                            ['title' => 'Identify the required ISEE type', 'text' => 'Some benefits require a specific ISEE type or extra documents. Read the rules of the organisation requesting it.'],
                            ['title' => 'Confirm household details', 'text' => 'Check household members and personal details before completing the DSU. The relevant household unit may differ from your everyday understanding of family.'],
                            ['title' => 'Collect income and asset data', 'text' => 'Follow INPS instructions for the relevant reference periods; do not assume every figure refers to the current year.'],
                            ['title' => 'Submit the DSU', 'text' => 'Use the INPS Portale Unico ISEE or seek help from a CAF. If using a pre-filled DSU, review the imported data and complete missing information.'],
                            ['title' => 'Check the certificate', 'text' => 'Verify the data, value, year and ISEE type before submitting it to the university or authority.'],
                        ],
                        'where_to_apply' => 'Through the INPS Portale Unico ISEE or a CAF. The organisation requesting the certificate may provide additional instructions.',
                        'costs' => 'Do not assume every CAF service is free or that every application has the same fee. Confirm service terms before booking.',
                        'processing_time' => 'Issuance depends on complete and validated information. Track the request with INPS rather than relying on a generic time estimate.',
                        'body' => 'ISEE may affect university fees or access to certain benefits, but each programme sets its own eligibility rules. Use the current-year INPS instructions and provide accurate information; the person submitting the DSU is responsible for their declarations.',
                    ],
                    [
                        'title' => 'ISEE e DSU: guida alla domanda e ai documenti',
                        'summary' => 'Scopri cosa misura l’ISEE, perché serve la DSU e come preparare i dati familiari, reddituali e patrimoniali.',
                        'what_is' => 'L’ISEE è un indicatore utilizzato per valutare la situazione economica del nucleo familiare ai fini di determinati servizi e agevolazioni. Per ottenere l’attestazione occorre presentare la DSU con i dati richiesti.',
                        'who_needs' => 'Famiglie o persone a cui università, enti pubblici o programmi di agevolazione chiedono un’attestazione ISEE per valutare requisiti o contributi.',
                        'required_documents' => ['Codice Fiscale e documenti d’identità dei componenti', 'Composizione del nucleo e informazioni sulla residenza', 'Dati reddituali relativi al periodo di riferimento previsto', 'Dati su conti, patrimonio finanziario e immobili per il periodo richiesto', 'Canone di locazione e ulteriori informazioni richieste dalla DSU'],
                        'steps' => [
                            ['title' => 'Individua il tipo di ISEE', 'text' => 'Alcune prestazioni richiedono un ISEE specifico o documenti aggiuntivi. Leggi le regole dell’ente che lo richiede.'],
                            ['title' => 'Controlla i dati del nucleo', 'text' => 'Verifica i componenti e i dati anagrafici prima di compilare la DSU. Il nucleo rilevante può essere diverso da quello che consideri famiglia nella vita quotidiana.'],
                            ['title' => 'Raccogli redditi e patrimoni', 'text' => 'Segui le istruzioni INPS sui periodi di riferimento: non tutti i dati riguardano l’anno in corso.'],
                            ['title' => 'Presenta la DSU', 'text' => 'Usa il Portale Unico ISEE dell’INPS oppure rivolgiti a un CAF. Con la DSU precompilata controlla i dati importati e completa quelli mancanti.'],
                            ['title' => 'Controlla l’attestazione', 'text' => 'Verifica dati, valore, anno e tipo di ISEE prima di consegnarla all’università o all’ente.'],
                        ],
                        'where_to_apply' => 'Tramite il Portale Unico ISEE INPS o un CAF. L’ente che richiede l’attestazione può fornire istruzioni aggiuntive.',
                        'costs' => 'Non dare per scontato che ogni servizio CAF sia gratuito o abbia lo stesso costo. Verifica le condizioni prima dell’appuntamento.',
                        'processing_time' => 'I tempi dipendono dalla completezza e dalla verifica dei dati. Controlla lo stato della pratica con INPS.',
                        'body' => 'L’ISEE può incidere sulle tasse universitarie o su alcune agevolazioni, ma ogni programma definisce i propri requisiti. Usa le istruzioni INPS aggiornate e inserisci dati corretti: chi presenta la DSU è responsabile delle dichiarazioni.',
                    ]
                ),
            ],
            [
                'slug' => 'register-rental-contract-italy',
                'category' => 'housing',
                'italian_term' => 'Registrazione del contratto di locazione',
                'source_name' => 'Agenzia delle Entrate',
                'source_url' => 'https://www.agenziaentrate.gov.it/portale/documents/20143/267587/RLI_modello.pdf',
                'translations' => $this->tr(
                    [
                        'title' => 'تسجيل عقد الإيجار في إيطاليا',
                        'summary' => 'دليل لفهم تسجيل عقد الإيجار، ودور نموذج RLI، وما الذي يجب الاحتفاظ به بعد إتمام الإجراء.',
                        'what_is' => 'تسجيل عقد الإيجار هو إجراء ضريبي وإداري لدى Agenzia delle Entrate. يستخدم نموذج RLI لتسجيل عقود الإيجار والعقارات وبعض الإجراءات اللاحقة المتعلقة بالعقد.',
                        'who_needs' => 'المستأجرون والمؤجرون الذين يوقعون عقد إيجار ويريدون معرفة الإجراء الرسمي والمستندات التي ينبغي تجهيزها.',
                        'required_documents' => ['نسخة العقد الموقّع وجميع الملاحق', 'بيانات الهوية وCodice Fiscale للأطراف', 'بيانات العقار والعنوان والمدة والإيجار', 'نموذج RLI والبيانات المطلوبة بحسب الإجراء', 'بيانات الدفع أو اختيار النظام الضريبي عند انطباقه'],
                        'steps' => [
                            ['title' => 'راجع العقد قبل التوقيع', 'text' => 'تحقق من أسماء الأطراف والعنوان والمدة والإيجار وشروط الإنهاء، واطلب توضيح أي بند غير مفهوم قبل الالتزام.'],
                            ['title' => 'حدد طريقة التسجيل', 'text' => 'راجع تعليمات Agenzia delle Entrate لمعرفة إن كان التسجيل إلكترونيًا أو عبر المكتب أو بواسطة وسيط مؤهل.'],
                            ['title' => 'أكمل نموذج RLI', 'text' => 'استخدم النسخة الرسمية الحالية، وأدخل بيانات الأطراف والعقار والعقد بدقة. تختلف الحقول بحسب نوع الطلب.'],
                            ['title' => 'تحقق من الضرائب وطريقة الدفع', 'text' => 'تختلف الالتزامات حسب نوع العقد وأي اختيار ضريبي مثل cedolare secca. لا تعتمد على مبلغ عام دون مراجعة حالتك.'],
                            ['title' => 'احتفظ بالإيصال ورقم التسجيل', 'text' => 'احتفظ بنسخة العقد وإثبات التسجيل والإيصالات؛ قد تحتاج إلى رقم العقد في الإجراءات اللاحقة.'],
                        ],
                        'where_to_apply' => 'من خلال خدمات Agenzia delle Entrate الإلكترونية أو القنوات المحددة في التعليمات الرسمية، ويمكن الاستعانة بوسيط مؤهل.',
                        'costs' => 'الضرائب والرسوم تعتمد على نوع العقد والنظام الضريبي والظروف. تحقق من تعليمات Agenzia delle Entrate قبل الدفع.',
                        'processing_time' => 'يعتمد على طريقة التقديم واكتمال البيانات. احتفظ بإثبات الإرسال وتحقق من نتيجة التسجيل.',
                        'body' => 'هذا الدليل لا يحل محل مراجعة العقد أو المشورة القانونية. لا تسلّم مبالغ غير موثقة، واحتفظ بإثباتات الدفع والمراسلات. إذا كانت هناك مشكلة في صلاحية العقد أو شروطه، استشر مختصًا.',
                    ],
                    [
                        'title' => 'Registering a rental contract in Italy',
                        'summary' => 'Understand rental-contract registration, the purpose of the RLI form, and which records to keep after registration.',
                        'what_is' => 'Rental-contract registration is a tax and administrative procedure handled by Agenzia delle Entrate. The RLI form is used for registering leases and certain later contract events.',
                        'who_needs' => 'Tenants and landlords signing a lease who need to understand the official process and prepare the relevant documents.',
                        'required_documents' => ['Signed contract and all attachments', 'Identity details and Codice Fiscale for the parties', 'Property address, term and rent details', 'The current RLI form and information required for the specific procedure', 'Payment details or tax-regime selection where applicable'],
                        'steps' => [
                            ['title' => 'Review the contract', 'text' => 'Check names, address, duration, rent and termination terms. Ask for clarification of any unclear clause before committing.'],
                            ['title' => 'Choose the registration channel', 'text' => 'Check Agenzia delle Entrate instructions to see whether online filing, an office or an authorised intermediary is appropriate.'],
                            ['title' => 'Complete the RLI form', 'text' => 'Use the current official form and enter party, property and contract data carefully. Fields vary by procedure.'],
                            ['title' => 'Check taxes and payment', 'text' => 'Obligations depend on the contract and any tax option, such as cedolare secca. Do not rely on a generic amount without checking your case.'],
                            ['title' => 'Keep the receipt and registration code', 'text' => 'Keep the contract, registration evidence and receipts; the contract code may be needed for later procedures.'],
                        ],
                        'where_to_apply' => 'Through Agenzia delle Entrate online services or the channels specified in its official instructions. An authorised intermediary may also assist.',
                        'costs' => 'Taxes and fees depend on contract type, tax regime and circumstances. Check Agenzia delle Entrate instructions before paying.',
                        'processing_time' => 'Timing depends on the channel and completeness of the submission. Keep proof of filing and verify the registration result.',
                        'body' => 'This guide does not replace contract review or legal advice. Avoid undocumented payments and keep receipts and correspondence. Consult a qualified professional if you are unsure about a clause or the contract’s validity.',
                    ],
                    [
                        'title' => 'Registrazione del contratto di locazione in Italia',
                        'summary' => 'Scopri a cosa serve la registrazione, come si usa il modello RLI e quali ricevute conservare.',
                        'what_is' => 'La registrazione del contratto di locazione è un adempimento fiscale e amministrativo presso l’Agenzia delle Entrate. Il modello RLI serve per registrare i contratti e gestire alcuni adempimenti successivi.',
                        'who_needs' => 'Inquilini e proprietari che stipulano un contratto e vogliono conoscere la procedura ufficiale e i documenti da preparare.',
                        'required_documents' => ['Contratto firmato e allegati', 'Dati identificativi e Codice Fiscale delle parti', 'Indirizzo dell’immobile, durata e canone', 'Modello RLI aggiornato e dati richiesti per la pratica', 'Dati di pagamento o scelta del regime fiscale, quando applicabile'],
                        'steps' => [
                            ['title' => 'Controlla il contratto', 'text' => 'Verifica nomi, indirizzo, durata, canone e condizioni di recesso. Chiedi chiarimenti sulle clausole poco chiare prima di firmare.'],
                            ['title' => 'Scegli il canale', 'text' => 'Consulta le istruzioni dell’Agenzia delle Entrate per capire se usare il servizio online, un ufficio o un intermediario abilitato.'],
                            ['title' => 'Compila il modello RLI', 'text' => 'Usa il modello ufficiale aggiornato e inserisci con attenzione i dati delle parti, dell’immobile e del contratto.'],
                            ['title' => 'Verifica imposte e pagamento', 'text' => 'Gli obblighi cambiano in base al contratto e alle opzioni fiscali, come la cedolare secca. Non usare un importo generico senza verificare il caso.'],
                            ['title' => 'Conserva ricevuta e codice', 'text' => 'Conserva contratto, prova di registrazione e ricevute: il codice identificativo può servire per gli adempimenti successivi.'],
                        ],
                        'where_to_apply' => 'Tramite i servizi online dell’Agenzia delle Entrate o i canali indicati nelle istruzioni ufficiali. Può assistere anche un intermediario abilitato.',
                        'costs' => 'Imposte e costi dipendono dal tipo di contratto, dal regime fiscale e dalle circostanze. Verifica le istruzioni prima di pagare.',
                        'processing_time' => 'I tempi dipendono dal canale e dalla completezza della pratica. Conserva la prova di invio e verifica l’esito.',
                        'body' => 'La guida non sostituisce una revisione del contratto o una consulenza legale. Evita pagamenti non documentati e conserva ricevute e comunicazioni. In caso di dubbi sulla validità o sulle clausole, consulta un professionista.',
                    ]
                ),
            ],
            [
                'slug' => 'family-reunification-italy',
                'category' => 'family',
                'italian_term' => 'Ricongiungimento familiare',
                'source_name' => 'Portale Integrazione Migranti',
                'source_url' => 'https://integrazionemigranti.gov.it/it-it/Dettaglio-approfondimento/id/65',
                'translations' => $this->tr(
                    [
                        'title' => 'لمّ الشمل العائلي في إيطاليا',
                        'summary' => 'نظرة عملية على مراحل لمّ الشمل: التحقق من الأهلية، طلب nulla osta، ثم إجراءات التأشيرة والوثائق العائلية.',
                        'what_is' => 'Ricongiungimento familiare هو إجراء يتيح، عند استيفاء الشروط، طلب انضمام بعض أفراد الأسرة المقيمين خارج إيطاليا إلى فرد الأسرة المقيم قانونيًا في إيطاليا.',
                        'who_needs' => 'المقيمون الذين يريدون معرفة الخطوات الأولية لجلب الزوج أو الزوجة أو أحد أفراد الأسرة المؤهلين وفق القواعد الحالية.',
                        'required_documents' => ['وثيقة إقامة سارية أو مستندات الوضع القانوني حسب الحالة', 'جوازات السفر ووثائق الهوية', 'وثائق تثبت صلة القرابة، مترجمة ومصدقة عند طلب ذلك', 'إثباتات الدخل والسكن عندما تكون مطلوبة', 'مستندات إضافية تحددها Sportello Unico أو القنصلية'],
                        'steps' => [
                            ['title' => 'تحقق من الأهلية الحالية', 'text' => 'تختلف الشروط حسب صلة القرابة ونوع الإقامة والاستثناءات القانونية. تحقق من مدة الإقامة المطلوبة والمتطلبات الحالية قبل البدء.'],
                            ['title' => 'راجع الدخل والسكن', 'text' => 'قد تحتاج إلى إثبات دخل وسكن مناسب، مع استثناءات لبعض الحالات. راجع القواعد الرسمية بدل استخدام رقم قديم.'],
                            ['title' => 'قدم طلب nulla osta', 'text' => 'يتم تقديم الطلب عبر البوابة الرسمية لوزارة الداخلية وفق الإجراء المتاح، ثم يتابع Sportello Unico الملف.'],
                            ['title' => 'جهز وثائق القرابة', 'text' => 'تحقق من متطلبات الترجمة والتصديق في بلد إصدار الوثيقة ومن القنصلية الإيطالية المختصة.'],
                            ['title' => 'تابع التأشيرة وما بعد الوصول', 'text' => 'بعد صدور الموافقة، يتابع فرد الأسرة إجراءات التأشيرة لدى القنصلية، ثم إجراءات الإقامة بعد الوصول وفق التعليمات الرسمية.'],
                        ],
                        'where_to_apply' => 'تبدأ إجراءات nulla osta عبر البوابة الرسمية لوزارة الداخلية وSportello Unico competente؛ التأشيرة تتم عبر القنصلية الإيطالية المختصة.',
                        'costs' => 'تختلف التكاليف حسب الوثائق والترجمة والتصديق والتأشيرة. لا تستخدم مبلغًا عامًا دون مراجعة القنصلية والجهات الرسمية.',
                        'processing_time' => 'المدة القانونية والإجرائية قد تتغير. تحقق من النص الرسمي الحالي، وتابع حالة الملف من القناة التي قدمت من خلالها.',
                        'body' => 'لمّ الشمل موضوع قانوني حساس. لا تحجز أو تدفع بناءً على منشور غير رسمي. تحقّق من الشروط الحالية، لأن قواعد الأهلية والمدة والدخل والسكن قد تتغير، واطلب مساعدة patronato أو محامٍ مختص إذا كانت حالتك معقدة.',
                    ],
                    [
                        'title' => 'Family reunification in Italy',
                        'summary' => 'An overview of the process: check eligibility, request a nulla osta, then follow visa and family-document procedures.',
                        'what_is' => 'Ricongiungimento familiare is a procedure that may allow eligible family members living abroad to join a relative lawfully residing in Italy, subject to current requirements.',
                        'who_needs' => 'Residents who want to understand the first steps for a spouse or another eligible family member under current rules.',
                        'required_documents' => ['Valid residence permit or evidence of legal status, as applicable', 'Passports and identity documents', 'Proof of family relationship, translated and legalised where required', 'Income and suitable-housing evidence where required', 'Additional documents requested by the Sportello Unico or consulate'],
                        'steps' => [
                            ['title' => 'Check current eligibility', 'text' => 'Requirements depend on relationship, residence status and legal exceptions. Verify any required period of lawful residence before starting.'],
                            ['title' => 'Review income and housing', 'text' => 'Proof of income and suitable housing may be required, with exceptions for some categories. Check current official rules rather than relying on an old figure.'],
                            ['title' => 'Submit the nulla osta request', 'text' => 'Submit through the Ministry of the Interior’s official portal under the available procedure, then follow the file with the competent Sportello Unico.'],
                            ['title' => 'Prepare relationship documents', 'text' => 'Check translation and legalisation requirements in the issuing country and with the competent Italian consulate.'],
                            ['title' => 'Follow the visa and arrival steps', 'text' => 'After approval, the family member follows the visa process with the consulate and then the applicable residence procedures after arrival.'],
                        ],
                        'where_to_apply' => 'The nulla osta process starts through the Ministry of the Interior portal and competent Sportello Unico; the visa is handled by the relevant Italian consulate.',
                        'costs' => 'Costs depend on civil documents, translation, legalisation and visa procedures. Check the consulate and official authorities rather than relying on a generic amount.',
                        'processing_time' => 'Legal and administrative timelines can change. Check the current official rules and track the application through the channel used.',
                        'body' => 'Family reunification is a legal matter. Do not book or pay based on unofficial posts. Requirements for eligibility, timing, income and housing can change; seek help from a patronato or immigration lawyer if your case is complex.',
                    ],
                    [
                        'title' => 'Ricongiungimento familiare in Italia',
                        'summary' => 'Panoramica delle fasi: verifica dei requisiti, domanda di nulla osta e successive procedure per il visto e i documenti familiari.',
                        'what_is' => 'Il ricongiungimento familiare è una procedura che, in presenza dei requisiti, può consentire ad alcuni familiari all’estero di raggiungere un parente regolarmente soggiornante in Italia.',
                        'who_needs' => 'Persone residenti in Italia che vogliono conoscere i primi passaggi per il coniuge o un altro familiare ammesso dalle regole vigenti.',
                        'required_documents' => ['Permesso di soggiorno valido o documentazione dello status, secondo il caso', 'Passaporti e documenti d’identità', 'Prova del rapporto familiare, tradotta e legalizzata quando richiesto', 'Documenti su reddito e alloggio idoneo quando richiesti', 'Ulteriori documenti indicati dallo Sportello Unico o dal consolato'],
                        'steps' => [
                            ['title' => 'Verifica i requisiti aggiornati', 'text' => 'I requisiti dipendono dal rapporto familiare, dal titolo di soggiorno e dalle eccezioni previste. Verifica l’eventuale periodo minimo di soggiorno legale.'],
                            ['title' => 'Controlla reddito e alloggio', 'text' => 'Possono essere richieste prove di reddito e alloggio idoneo, con eccezioni per alcune categorie. Usa le regole ufficiali aggiornate.'],
                            ['title' => 'Presenta la domanda di nulla osta', 'text' => 'La domanda si presenta tramite il portale ufficiale del Ministero dell’Interno secondo la procedura disponibile; segui poi la pratica presso lo Sportello Unico competente.'],
                            ['title' => 'Prepara i documenti familiari', 'text' => 'Verifica traduzione e legalizzazione nel Paese che ha rilasciato l’atto e presso il consolato italiano competente.'],
                            ['title' => 'Segui visto e arrivo', 'text' => 'Dopo il nulla osta, il familiare segue la procedura per il visto presso il consolato e gli adempimenti di soggiorno dopo l’arrivo.'],
                        ],
                        'where_to_apply' => 'La richiesta di nulla osta inizia dal portale del Ministero dell’Interno e dallo Sportello Unico competente; il visto è gestito dal consolato italiano competente.',
                        'costs' => 'I costi dipendono da certificati, traduzioni, legalizzazioni e visto. Verifica le indicazioni ufficiali senza affidarti a un importo generico.',
                        'processing_time' => 'I termini legali e amministrativi possono cambiare. Consulta le regole aggiornate e monitora la pratica attraverso il canale utilizzato.',
                        'body' => 'Il ricongiungimento familiare è una materia legale. Non prenotare né pagare sulla base di informazioni non ufficiali. I requisiti di accesso, tempi, reddito e alloggio possono cambiare; per casi complessi chiedi supporto a un patronato o a un avvocato specializzato.',
                    ]
                ),
            ],
            [
                'slug' => 'study-finder-universitaly-international-students',
                'category' => 'study',
                'italian_term' => 'Universitaly e studenti internazionali',
                'source_name' => 'Universitaly / Ministero dell’Università e della Ricerca',
                'source_url' => 'https://www.universitaly.it/it',
                'translations' => $this->tr(
                    [
                        'title' => 'الدراسة في إيطاليا: البحث عن جامعة والتقديم',
                        'summary' => 'ابدأ البحث عن الجامعة والبرنامج، وافهم الفرق بين القبول الجامعي والتسجيل المسبق وإجراءات التأشيرة للطلاب الدوليين.',
                        'what_is' => 'Universitaly هي البوابة الرسمية التي تساعد الطلاب على استكشاف المؤسسات والبرامج والمعلومات المتعلقة بالدراسة في إيطاليا، بما في ذلك مسارات الطلاب الدوليين.',
                        'who_needs' => 'الطلاب الذين يقارنون الجامعات أو البرامج أو المنح، والطلاب الدوليون الذين يحتاجون إلى معرفة إجراءات التسجيل المسبق ذات الصلة بحالتهم.',
                        'required_documents' => ['جواز سفر ساري', 'الشهادة الدراسية وكشف الدرجات', 'ترجمة أو تصديق المستندات إذا طلبته الجامعة', 'إثبات اللغة أو مستندات الاختبار عند اشتراطها', 'مستندات إضافية خاصة بالبرنامج أو التأشيرة'],
                        'steps' => [
                            ['title' => 'حدد البرنامج وشروطه', 'text' => 'تحقق من لغة الدراسة، وشروط القبول، ومواعيد التقديم، والرسوم مباشرة لدى الجامعة؛ تختلف المتطلبات بين البرامج.'],
                            ['title' => 'جهز الوثائق الدراسية', 'text' => 'راجع متطلبات الشهادة والترجمة والتصديق والاعتراف بالمؤهل، ولا تفترض أن وثيقة واحدة مقبولة في جميع الجامعات.'],
                            ['title' => 'قدم للجامعة', 'text' => 'اتبع نظام التقديم الخاص بالجامعة. قد يكون طلب القبول منفصلًا عن التسجيل المسبق أو الإجراءات المطلوبة للتأشيرة.'],
                            ['title' => 'استخدم Universitaly عند الحاجة', 'text' => 'الطلاب الدوليون الذين يحتاجون إلى التسجيل المسبق يتبعون التعليمات الرسمية الحالية على Universitaly وعلى موقع الجامعة.'],
                            ['title' => 'تحقق من المنح والتكاليف', 'text' => 'راجع صفحة المنح والرسوم ومواعيدها لدى الجامعة أو الجهة المانحة؛ لا تعتمد على إعلان قديم أو مبلغ غير مؤرخ.'],
                        ],
                        'where_to_apply' => 'ابدأ من Universitaly ثم اتبع موقع الجامعة والجهات الرسمية ذات الصلة. القواعد تختلف حسب الجنسية والبرنامج ونوع التأشيرة.',
                        'costs' => 'الرسوم والمنح تختلف حسب الجامعة والمنطقة والبرنامج والوضع الشخصي. تحقق من الجداول الرسمية للسنة الأكاديمية المقصودة.',
                        'processing_time' => 'مواعيد القبول والتسجيل المسبق والتأشيرة منفصلة وقد تكون لها آجال مختلفة. ضع تقويمًا لكل جهة وتابع الصفحات الرسمية.',
                        'body' => 'القبول الجامعي لا يعني تلقائيًا صدور التأشيرة، والتسجيل المسبق لا يضمن القبول النهائي. استخدم هذا الدليل كبداية، ثم تحقق من شروط الجامعة والقنصلية للعام الدراسي الذي تتقدم إليه.',
                    ],
                    [
                        'title' => 'Studying in Italy: find a university and apply',
                        'summary' => 'Start comparing universities and programmes, and understand the difference between admission, pre-enrolment and visa procedures for international students.',
                        'what_is' => 'Universitaly is the official portal for exploring institutions and programmes and accessing study-related information, including pathways for international students.',
                        'who_needs' => 'Students comparing universities, programmes or scholarships, and international students who need to understand whether pre-enrolment applies to their case.',
                        'required_documents' => ['Valid passport', 'School or university qualification and transcripts', 'Translations or legalisation if required by the institution', 'Language evidence or test documents where required', 'Additional programme-specific or visa documents'],
                        'steps' => [
                            ['title' => 'Choose a programme and check requirements', 'text' => 'Confirm teaching language, admission requirements, deadlines and tuition directly with the university; requirements vary by programme.'],
                            ['title' => 'Prepare academic documents', 'text' => 'Check qualification, translation, legalisation and recognition requirements. Do not assume one document set is accepted by every university.'],
                            ['title' => 'Apply to the university', 'text' => 'Follow the institution’s application system. Admission can be separate from pre-enrolment or visa-related steps.'],
                            ['title' => 'Use Universitaly where applicable', 'text' => 'International students who need pre-enrolment should follow the current official instructions on Universitaly and the university website.'],
                            ['title' => 'Check scholarships and costs', 'text' => 'Review current scholarship, tuition and deadline information with the university or funding body; do not rely on undated announcements.'],
                        ],
                        'where_to_apply' => 'Start with Universitaly, then follow the university and relevant official authorities. Rules vary by nationality, programme and visa type.',
                        'costs' => 'Tuition and scholarships vary by institution, region, programme and personal circumstances. Check the official amounts for the intended academic year.',
                        'processing_time' => 'Admission, pre-enrolment and visa deadlines are separate and may differ. Keep a calendar for each authority and check official updates.',
                        'body' => 'University admission does not automatically grant a visa, and pre-enrolment does not guarantee final admission. Use this guide as a starting point, then verify university and consular requirements for your intake year.',
                    ],
                    [
                        'title' => 'Studiare in Italia: trovare un’università e candidarsi',
                        'summary' => 'Inizia a confrontare università e corsi e distingui ammissione, preiscrizione e procedure per il visto degli studenti internazionali.',
                        'what_is' => 'Universitaly è il portale ufficiale per esplorare istituzioni e corsi e consultare informazioni sullo studio in Italia, comprese le procedure per studenti internazionali.',
                        'who_needs' => 'Studenti che confrontano università, corsi o borse di studio e studenti internazionali che devono capire se è prevista la preiscrizione.',
                        'required_documents' => ['Passaporto valido', 'Titolo di studio e certificato degli esami', 'Traduzioni o legalizzazioni se richieste dall’ateneo', 'Certificazione linguistica o documenti di test se previsti', 'Ulteriori documenti specifici per il corso o il visto'],
                        'steps' => [
                            ['title' => 'Scegli il corso e verifica i requisiti', 'text' => 'Controlla lingua, requisiti di ammissione, scadenze e tasse direttamente presso l’università: cambiano da corso a corso.'],
                            ['title' => 'Prepara i documenti scolastici', 'text' => 'Verifica requisiti di titolo, traduzione, legalizzazione e riconoscimento. Non presumere che tutti gli atenei accettino gli stessi documenti.'],
                            ['title' => 'Presenta la candidatura', 'text' => 'Segui la procedura dell’ateneo. L’ammissione può essere distinta dalla preiscrizione o dagli adempimenti per il visto.'],
                            ['title' => 'Usa Universitaly quando necessario', 'text' => 'Gli studenti internazionali che devono effettuare la preiscrizione seguono le istruzioni aggiornate su Universitaly e sul sito dell’ateneo.'],
                            ['title' => 'Verifica borse e costi', 'text' => 'Consulta importi, borse e scadenze aggiornati presso l’università o l’ente finanziatore; evita annunci senza data.'],
                        ],
                        'where_to_apply' => 'Inizia da Universitaly e poi segui il sito dell’università e delle autorità competenti. Le regole variano per cittadinanza, corso e visto.',
                        'costs' => 'Tasse e borse variano in base ad ateneo, regione, corso e situazione personale. Verifica gli importi ufficiali dell’anno accademico interessato.',
                        'processing_time' => 'Ammissione, preiscrizione e visto hanno scadenze distinte. Organizza un calendario per ogni ente e controlla gli aggiornamenti ufficiali.',
                        'body' => 'L’ammissione universitaria non comporta automaticamente il rilascio del visto e la preiscrizione non garantisce l’ammissione definitiva. Verifica sempre i requisiti dell’ateneo e del consolato per l’anno di ingresso.',
                    ]
                ),
            ],
            [
                'slug' => 'employment-contract-and-payslip-basics',
                'category' => 'work',
                'italian_term' => 'Contratto di lavoro e busta paga',
                'source_name' => 'Ministero del Lavoro e delle Politiche Sociali',
                'source_url' => 'https://www.lavoro.gov.it/sportello-unico-digitale/termini-e-condizioni-di-impiego/informazioni-sui-contratti-di-lavoro',
                'translations' => $this->tr(
                    [
                        'title' => 'فهم عقد العمل وbusta paga',
                        'summary' => 'تعرف على أهم البيانات التي يجب مراجعتها في عقد العمل وكشف الراتب، وكيف تحتفظ بالأدلة عند وجود اختلاف.',
                        'what_is' => 'عقد العمل يوضح شروط العلاقة بين العامل وصاحب العمل، بينما تعرض busta paga تفاصيل الراتب والاستقطاعات والبيانات المحاسبية للفترة. التفاصيل تعتمد على نوع العقد والقطاع والاتفاقية الجماعية المطبقة.',
                        'who_needs' => 'العاملون في إيطاليا، خصوصًا من بدأوا وظيفة جديدة أو يريدون مراجعة الساعات والراتب والإجازات والاستقطاعات.',
                        'required_documents' => ['نسخة عقد العمل أو خطاب التوظيف', 'كل كشوف الراتب buste paga', 'سجل ساعات العمل والمناوبات والإجازات', 'رسائل أو تعليمات صاحب العمل المتعلقة بالدوام', 'إيصالات التحويل البنكي عند الحاجة للمقارنة'],
                        'steps' => [
                            ['title' => 'راجع بيانات العقد', 'text' => 'تحقق من تاريخ البداية، ونوع العقد، ومستوى التصنيف، وساعات العمل، والأجر، ومكان العمل، وفترة التجربة إن وجدت.'],
                            ['title' => 'قارن كشف الراتب بساعاتك', 'text' => 'راجع الشهر والفترة المدفوعة والساعات العادية والإضافية والإجازات والغياب والاستقطاعات. قد تختلف طريقة عرض البنود بحسب القطاع.'],
                            ['title' => 'احتفظ بسجل مستقل', 'text' => 'سجل وقت البداية والنهاية والاستراحات والإجازات، واحتفظ بنسخ من الكشوف والمراسلات.'],
                            ['title' => 'اطلب توضيحًا مكتوبًا', 'text' => 'إذا وجدت اختلافًا، أرسل للمسؤول أو المحاسب تواريخ وساعات محددة واطلب شرح الحساب والتصحيح عند ثبوت الخطأ.'],
                            ['title' => 'استعن بجهة مختصة عند الحاجة', 'text' => 'يمكن أن يساعدك patronato أو sindacato أو consulente del lavoro في فهم البنود. إذا كان النزاع جديًا، اطلب استشارة مختصة.'],
                        ],
                        'where_to_apply' => 'ابدأ بصاحب العمل أو مكتب الرواتب. للمعلومات الرسمية راجع وزارة العمل؛ ويمكن طلب المساعدة من patronato أو sindacato أو consulente del lavoro.',
                        'costs' => 'مراجعة كشف الراتب داخليًا لا تتطلب عادةً رسومًا. قد تفرض بعض الخدمات الاستشارية الخاصة رسومًا؛ تحقق قبل التعاقد.',
                        'processing_time' => 'يعتمد الرد والتصحيح على صاحب العمل وطبيعة المسألة. أرسل الاستفسار مبكرًا واحتفظ بنسخة مؤرخة.',
                        'body' => 'لا يمكن حساب الراتب الصافي بدقة من عدد الساعات وحده؛ يلزم معرفة العقد والقطاع ومستوى التصنيف والبدلات والاستقطاعات. هذا الدليل للتوعية وليس بديلًا عن مراجعة عقدك وكشف راتبك مع مختص.',
                    ],
                    [
                        'title' => 'Understanding your employment contract and payslip',
                        'summary' => 'Learn what to check in an employment contract and payslip, and how to keep evidence if figures do not match.',
                        'what_is' => 'An employment contract sets out the terms of the working relationship. A busta paga shows pay, deductions and accounting details for a period. Details depend on the contract, sector and applicable collective agreement.',
                        'who_needs' => 'People working in Italy, especially those starting a new job or checking hours, pay, leave and deductions.',
                        'required_documents' => ['Employment contract or hiring letter', 'All payslips (buste paga)', 'Your record of hours, shifts and leave', 'Employer messages or instructions about working time', 'Bank transfer records if needed for comparison'],
                        'steps' => [
                            ['title' => 'Review the contract details', 'text' => 'Check start date, contract type, classification level, hours, pay, workplace and any probation period.'],
                            ['title' => 'Compare the payslip with your records', 'text' => 'Check the pay period, ordinary and overtime hours, leave, absences and deductions. Items may be displayed differently by sector.'],
                            ['title' => 'Keep your own record', 'text' => 'Record start and finish times, breaks and leave; keep copies of payslips and relevant messages.'],
                            ['title' => 'Ask for a written explanation', 'text' => 'If you find a discrepancy, send specific dates and hours to your manager or payroll office and request an explanation and correction if needed.'],
                            ['title' => 'Seek qualified help if necessary', 'text' => 'A patronato, trade union or consulente del lavoro may help interpret the documents. Get specialist advice for a serious dispute.'],
                        ],
                        'where_to_apply' => 'Start with your employer or payroll office. For official information consult the Ministry of Labour; a patronato, union or labour consultant can provide support.',
                        'costs' => 'Checking your payslip yourself is usually free. Private advisory services may charge; confirm terms in advance.',
                        'processing_time' => 'Response and correction times depend on the employer and issue. Raise questions early and keep a dated copy.',
                        'body' => 'Net pay cannot be calculated accurately from hours alone; contract, sector, classification, allowances and deductions matter. This guide is general information and does not replace a review of your own contract and payslip by a qualified professional.',
                    ],
                    [
                        'title' => 'Capire il contratto di lavoro e la busta paga',
                        'summary' => 'Scopri cosa controllare nel contratto e nella busta paga e come conservare le prove in caso di differenze.',
                        'what_is' => 'Il contratto definisce le condizioni del rapporto di lavoro. La busta paga mostra retribuzione, trattenute e dati contabili del periodo. I dettagli dipendono dal contratto, dal settore e dal CCNL applicabile.',
                        'who_needs' => 'Lavoratori in Italia, soprattutto chi ha iniziato un nuovo impiego o vuole verificare ore, retribuzione, ferie e trattenute.',
                        'required_documents' => ['Contratto di lavoro o lettera di assunzione', 'Tutte le buste paga', 'Registro personale di ore, turni e ferie', 'Messaggi o istruzioni del datore di lavoro sugli orari', 'Estratti dei bonifici se servono per un confronto'],
                        'steps' => [
                            ['title' => 'Controlla i dati del contratto', 'text' => 'Verifica data di inizio, tipo di contratto, livello, orario, retribuzione, luogo di lavoro ed eventuale periodo di prova.'],
                            ['title' => 'Confronta la busta paga con le ore', 'text' => 'Controlla periodo, ore ordinarie e straordinarie, ferie, assenze e trattenute. Le voci possono variare in base al settore.'],
                            ['title' => 'Conserva un registro personale', 'text' => 'Annota entrate, uscite, pause e ferie; conserva copie delle buste paga e dei messaggi rilevanti.'],
                            ['title' => 'Chiedi una spiegazione scritta', 'text' => 'Se trovi una differenza, invia date e ore precise al responsabile o all’ufficio paghe e chiedi una spiegazione e l’eventuale correzione.'],
                            ['title' => 'Chiedi assistenza qualificata', 'text' => 'Un patronato, sindacato o consulente del lavoro può aiutarti a interpretare i documenti. Per una controversia seria chiedi una consulenza specifica.'],
                        ],
                        'where_to_apply' => 'Rivolgiti prima al datore di lavoro o all’ufficio paghe. Per informazioni ufficiali consulta il Ministero del Lavoro; possono aiutare anche patronato, sindacato o consulente del lavoro.',
                        'costs' => 'Il controllo personale della busta paga è normalmente gratuito. Alcuni servizi privati possono essere a pagamento: verifica prima le condizioni.',
                        'processing_time' => 'I tempi di risposta e correzione dipendono dal datore di lavoro e dal problema. Segnala presto le differenze e conserva una copia datata.',
                        'body' => 'Il netto non si calcola con precisione dalle sole ore: contano contratto, settore, livello, indennità e trattenute. Questa guida è informativa e non sostituisce la verifica dei tuoi documenti da parte di un professionista.',
                    ]
                ),
            ],
            [
                'slug' => 'open-partita-iva-first-steps',
                'category' => 'business',
                'italian_term' => 'Partita IVA',
                'source_name' => 'Agenzia delle Entrate',
                'source_url' => 'https://www.agenziaentrate.gov.it/portale/web/guest/home',
                'translations' => $this->tr(
                    [
                        'title' => 'فتح Partita IVA: الخطوات الأولى',
                        'summary' => 'دليل تمهيدي لمن يفكر في العمل الحر أو النشاط التجاري في إيطاليا، وما الذي يجب حسمه قبل طلب رقم Partita IVA.',
                        'what_is' => 'Partita IVA هو رقم ضريبي يستخدم لتحديد النشاط الاقتصادي لأغراض ضريبة القيمة المضافة والالتزامات المرتبطة به. فتحه ليس مجرد تسجيل شكلي؛ فقد تترتب عليه التزامات ضريبية وتأمينية ومحاسبية.',
                        'who_needs' => 'الأشخاص الذين يبدأون نشاطًا مستقلًا أو مهنيًا أو تجاريًا، ويحتاجون إلى تحديد طريقة التسجيل والالتزامات التي تنطبق على نشاطهم.',
                        'required_documents' => ['وثيقة هوية وCodice Fiscale', 'وصف واضح للنشاط ومكان ممارسته', 'بيانات بدء النشاط وتاريخه المتوقع', 'اختيار codice ATECO مناسب بعد التحقق من النشاط الفعلي', 'معلومات عن وضع العمل والتأمين الاجتماعي وأي تسجيل مهني مطلوب'],
                        'steps' => [
                            ['title' => 'حدد طبيعة النشاط', 'text' => 'صف الخدمات أو المنتجات والعملاء وطريقة البيع. اختيار التسجيل يختلف بين العمل المهني والتجارة والنشاط الحرفي وبعض الحالات الأخرى.'],
                            ['title' => 'تحقق من codice ATECO والجهات المطلوبة', 'text' => 'لا تختَر الرمز من الاسم وحده. تحقق من النشاط الفعلي وما إذا كانت هناك حاجة إلى SCIA أو Camera di Commercio أو تسجيل مهني.'],
                            ['title' => 'قارن الأنظمة الضريبية', 'text' => 'تحقق من شروط النظام الضريبي المحتمل، وحدود الأهلية، وطريقة الفوترة والاحتفاظ بالمستندات مع commercialista أو مصدر رسمي.'],
                            ['title' => 'قدّم الطلب عبر القناة المناسبة', 'text' => 'تختلف النماذج والإجراءات حسب نوع النشاط. استخدم تعليمات Agenzia delle Entrate الحالية ولا تعتمد على نموذج قديم.'],
                            ['title' => 'رتّب الالتزامات بعد الفتح', 'text' => 'اسأل عن الفوترة الإلكترونية، والإقرارات، ومساهمات INPS، والدفعات المقدمة، والتسجيلات الإضافية والمواعيد السنوية.'],
                        ],
                        'where_to_apply' => 'تبدأ من Agenzia delle Entrate، وقد تحتاج أيضًا إلى Camera di Commercio أو SUAP أو INPS أو جهة مهنية وفق النشاط.',
                        'costs' => 'التكلفة الإجمالية تختلف حسب النشاط والنظام الضريبي والتأمين الاجتماعي والمحاسبة والتسجيلات الإضافية. لا يوجد مبلغ واحد يصلح للجميع.',
                        'processing_time' => 'يعتمد الوقت على نوع النشاط والنموذج والجهات الإضافية المطلوبة. احسم الالتزامات قبل إصدار أول فاتورة.',
                        'body' => 'قبل فتح Partita IVA، اطلب من commercialista أو CAF مختص توضيح النظام الضريبي، وINPS، والفوترة، والضرائب المتوقعة وفق نشاطك. لا تفترض أن النظام forfettario متاح تلقائيًا أو أنه دائمًا الأفضل.',
                    ],
                    [
                        'title' => 'Opening a Partita IVA: first steps',
                        'summary' => 'A starter guide for people considering freelance or business activity in Italy and what to clarify before requesting a VAT number.',
                        'what_is' => 'A Partita IVA is a tax identifier for economic activity and related VAT obligations. Opening one is not merely a formality; tax, social-security and accounting duties may follow.',
                        'who_needs' => 'People starting independent, professional or commercial activity who need to understand registration and the obligations that may apply.',
                        'required_documents' => ['Identity document and Codice Fiscale', 'Clear description of the activity and where it will operate', 'Planned activity start date', 'A suitable codice ATECO based on the actual activity', 'Information about employment status, social security and any professional registration'],
                        'steps' => [
                            ['title' => 'Define the activity', 'text' => 'Describe the services or goods, customers and sales channel. Registration differs for professional work, trade, crafts and other cases.'],
                            ['title' => 'Check ATECO and other registrations', 'text' => 'Do not choose a code by name alone. Confirm the actual activity and whether SCIA, Camera di Commercio or professional registration is required.'],
                            ['title' => 'Compare tax regimes', 'text' => 'Check eligibility, limits, invoicing and record-keeping rules with a commercialista or official source before selecting a regime.'],
                            ['title' => 'Apply through the correct channel', 'text' => 'Forms and procedures vary by activity. Use current Agenzia delle Entrate instructions, not an old form.'],
                            ['title' => 'Plan ongoing obligations', 'text' => 'Ask about electronic invoicing, tax returns, INPS contributions, advance payments, additional registrations and annual deadlines.'],
                        ],
                        'where_to_apply' => 'Start with Agenzia delle Entrate; depending on the activity, Camera di Commercio, SUAP, INPS or a professional body may also be involved.',
                        'costs' => 'Total costs vary with activity, tax regime, social-security contributions, accounting and additional registrations. There is no single amount for everyone.',
                        'processing_time' => 'Timing depends on the activity, form and any additional authorities involved. Understand the obligations before issuing your first invoice.',
                        'body' => 'Before opening a Partita IVA, ask a qualified commercialista or CAF to explain the tax regime, INPS, invoicing and likely tax obligations for your activity. Do not assume the forfettario regime is automatically available or always the best option.',
                    ],
                    [
                        'title' => 'Aprire una Partita IVA: primi passi',
                        'summary' => 'Guida introduttiva per chi valuta un’attività autonoma o commerciale in Italia e vuole capire cosa chiarire prima della richiesta.',
                        'what_is' => 'La Partita IVA è un identificativo fiscale per l’attività economica e gli obblighi IVA collegati. L’apertura non è una semplice formalità: può comportare obblighi fiscali, previdenziali e contabili.',
                        'who_needs' => 'Chi avvia un’attività autonoma, professionale o commerciale e deve comprendere registrazione e obblighi applicabili.',
                        'required_documents' => ['Documento d’identità e Codice Fiscale', 'Descrizione chiara dell’attività e del luogo in cui sarà svolta', 'Data prevista di inizio attività', 'Codice ATECO coerente con l’attività effettiva', 'Informazioni su lavoro, previdenza e possibili iscrizioni professionali'],
                        'steps' => [
                            ['title' => 'Definisci l’attività', 'text' => 'Descrivi servizi o prodotti, clienti e canale di vendita. La procedura cambia tra professionisti, commercianti, artigiani e altri casi.'],
                            ['title' => 'Verifica ATECO e altre iscrizioni', 'text' => 'Non scegliere il codice solo dal nome. Verifica l’attività concreta e l’eventuale necessità di SCIA, Camera di Commercio o iscrizione professionale.'],
                            ['title' => 'Confronta i regimi fiscali', 'text' => 'Controlla requisiti, limiti, fatturazione e conservazione dei documenti con un commercialista o una fonte ufficiale.'],
                            ['title' => 'Presenta la richiesta corretta', 'text' => 'Moduli e procedure dipendono dall’attività. Usa le istruzioni aggiornate dell’Agenzia delle Entrate.'],
                            ['title' => 'Pianifica gli obblighi successivi', 'text' => 'Chiedi informazioni su fatturazione elettronica, dichiarazioni, contributi INPS, acconti, iscrizioni aggiuntive e scadenze annuali.'],
                        ],
                        'where_to_apply' => 'Inizia dall’Agenzia delle Entrate; in base all’attività possono essere coinvolti anche Camera di Commercio, SUAP, INPS o un ordine professionale.',
                        'costs' => 'I costi complessivi variano in base ad attività, regime fiscale, contributi previdenziali, contabilità e altre iscrizioni. Non esiste un importo unico valido per tutti.',
                        'processing_time' => 'I tempi dipendono dall’attività, dal modello e dagli enti aggiuntivi. Chiarisci gli obblighi prima di emettere la prima fattura.',
                        'body' => 'Prima di aprire la Partita IVA, chiedi a un commercialista o CAF qualificato di spiegare regime fiscale, INPS, fatturazione e imposte previste per la tua attività. Il regime forfettario non è automaticamente disponibile né sempre la scelta migliore.',
                    ]
                ),
            ],
        ];
    }
}
