<?php

namespace App\Domains\GovernmentImport\Content;

use App\Domains\Government\Enums\BookingMethod;
use App\Domains\Government\Enums\OfficeType;

/**
 * Authored appointment guides for official booking channels that exist today.
 *
 * Every guide paraphrases the OFFICIAL page cited in `source_url` as it was read on VERIFIED_AT (HTTP 200, text
 * checked). Nothing here is copied wholesale and nothing is added that the page does not say: no invented fees,
 * timings or documents. EXPA never books anything: every guide only points to the official channel.
 *
 * Re-verify (and bump VERIFIED_AT) whenever the text is touched. `tests/Feature/DataImport/AppointmentGuidesTest`
 * checks URL patterns/hosts offline (never the live web).
 */
final class AppointmentGuideContent
{
    public const VERIFIED_AT = '2026-10-11';

    public const LICENSE = 'EXPA original text; paraphrase of the cited official page';

    /** @return array<int,array<string,mixed>> */
    public static function all(): array
    {
        return [
            self::permessoPortaleImmigrazione(),
            self::cieNational(),
            self::cieRoma(),
            self::cieMilano(),
            self::agenziaEntrate(),
            self::inps(),
        ];
    }

    private static function permessoPortaleImmigrazione(): array
    {
        return [
            'source_id' => 'appt-portale-immigrazione-permesso',
            'slug' => 'permesso-di-soggiorno-portale-immigrazione-poste-questura',
            'office_type' => OfficeType::Questura,
            'booking_method' => BookingMethod::Unknown,
            'booking_portal_url' => 'https://www.portaleimmigrazione.it/ITA/index.html',
            'source_name' => 'Portale Immigrazione (Ministero dell\'Interno, Poste Italiane, ANCI, Patronati)',
            'source_url' => 'https://www.portaleimmigrazione.it/ITA/ilportale.html',
            'sort_order' => 10,
            'translations' => [
                'ar' => [
                    'title' => 'تصريح الإقامة: بوابة الهجرة (Portale Immigrazione) وتسليم الطلب والاستدعاء إلى Questura',
                    'summary' => 'تعرض بوابة الهجرة، التي تديرها وزارة الداخلية بالتعاون مع Poste Italiane وANCI وPatronati، إجراءات إصدار وتجديد تصريح الإقامة (permesso di soggiorno) وبطاقة الإقامة، وأماكن تسليم الطلب. EXPA لا تحجز لك أي موعد، بل توجّهك إلى القناة الرسمية.',
                    'steps' => [
                        ['title' => 'تعرّف على الإجراء المناسب', 'text' => 'تضم البوابة قسمًا للمواطنين الأوروبيين وآخر لغير الأوروبيين، وجداول بالطلبات التي تُرسل عبر Poste Italiane وتلك التي تُقدَّم إلى Questura.'],
                        ['title' => 'احصل على الـkit الورقي وابحث عن مكتب', 'text' => 'تذكر البوابة أنه يمكن استلام الـkit الورقي من جميع مكاتب البريد، وأن خدمة «Ricerca Uffici» تبيّن مكاتب Sportello Amico والبلديات (Comuni) وPatronati التي تساعد في تعبئة الطلب.'],
                        ['title' => 'اختياريًا: سجّل بيانات الإيصال مسبقًا', 'text' => 'للـkit المعبّأ يدويًا، تتيح البوابة التسجيل مسبقًا (Compila Dati Ricevuta) بواسطة هاتف محمول وجواز السفر الساري المستخدم في الـkit والـkit المعبّأ. التسجيل صالح 15 يومًا يجب أن تُكمل خلالها الإجراء في مكتب البريد، وإلا انتهى وحُذفت البيانات.'],
                        ['title' => 'سلّم الطلب في مكتب Sportello Amico', 'text' => 'تنبّه البوابة إلى أن الطلب لا يُقبل في مكتب البريد إلا مع كامل الوثائق المطلوبة.'],
                        ['title' => 'انتظر الاستدعاء إلى Questura', 'text' => 'تذكر البوابة أن التسجيل المسبق يتيح تلقي رسالة SMS بخصوص الاستدعاء إلى Questura على رقم الهاتف نفسه المكتوب في الـkit.'],
                    ],
                    'tips' => 'يمكن استخدام رقم الهاتف المحمول في تسجيل واحد فقط خلال 15 يومًا بحسب البوابة. إن لم يكن لديك هاتف شخصي فيمكنك الذهاب مباشرة إلى مكتب البريد، أو طلب المساعدة في تعبئة الـkit لدى Patronati أو بعض البلديات.',
                    'cautions' => 'هذا شرح مبسّط لمعلومات رسمية وليس استشارة قانونية. الصفحات التي اطّلعنا عليها لا تتيح حجز موعد في Questura بل تصف تسليم الطلب والاستدعاء. راجع البوابة الرسمية وتعليمات Questura المختصة قبل أي خطوة، فالقناة تختلف حسب نوع الطلب.',
                ],
                'en' => [
                    'title' => 'Permesso di soggiorno: Portale Immigrazione, post office submission and the Questura call-in',
                    'summary' => 'Portale Immigrazione, run by the Ministry of the Interior with Poste Italiane, ANCI and the Patronati, explains how permits and carte di soggiorno are issued and renewed and where to submit the request. EXPA does not book anything for you: it only points to the official channel.',
                    'steps' => [
                        ['title' => 'Find the right procedure', 'text' => 'The portal has sections for EU and non-EU citizens, with tables of requests sent through Poste Italiane and requests presented at the Questura.'],
                        ['title' => 'Get the paper kit and find an office', 'text' => 'The portal says the paper kit can be collected at any post office, and its "Ricerca Uffici" tool lists Sportello Amico post offices, Comuni and Patronati that can help you fill in the request.'],
                        ['title' => 'Optional: pre-register the receipt data', 'text' => 'For a kit filled in by hand, the portal lets you register some data in advance ("Compila Dati Ricevuta") with a mobile phone, the valid passport used for the kit and the completed kit. The registration lasts 15 days, during which you must finish the procedure at the post office; after that it expires and the data is deleted.'],
                        ['title' => 'Submit at a Sportello Amico post office', 'text' => 'The portal reminds you that the request is only accepted at the post office together with all the required documents.'],
                        ['title' => 'Wait for the Questura call-in', 'text' => 'The portal states that pre-registering lets you receive an SMS about the convocation to the Questura on the same mobile number written in the kit.'],
                    ],
                    'tips' => 'According to the portal a mobile number can be used for one registration only within 15 days. If you have no personal mobile phone you can go straight to the post office, or get help filling in the kit from a Patronato or some Comuni.',
                    'cautions' => 'This is a simplified explanation of official information, not legal advice. The pages we read do not offer a Questura appointment booking: they describe submission and the call-in. Check the official portal and your Questura instructions before acting, as the channel depends on the type of request.',
                ],
                'it' => [
                    'title' => 'Permesso di soggiorno: Portale Immigrazione, consegna in ufficio postale e convocazione in Questura',
                    'summary' => 'Il Portale Immigrazione, promosso dal Ministero dell\'Interno con Poste Italiane, Anci e Patronati, spiega come si rilasciano e rinnovano permessi e carte di soggiorno e dove presentare l\'istanza. EXPA non prenota nulla al posto tuo: ti indirizza al canale ufficiale.',
                    'steps' => [
                        ['title' => 'Individua la procedura giusta', 'text' => 'Il portale ha sezioni per cittadini comunitari ed extracomunitari, con le tabelle delle istanze da spedire tramite Poste Italiane e di quelle da presentare in Questura.'],
                        ['title' => 'Ritira il kit cartaceo e cerca un ufficio', 'text' => 'Il portale indica che il kit cartaceo si ritira in tutti gli uffici postali; la sezione «Ricerca Uffici» elenca gli uffici postali Sportello Amico, i Comuni e i Patronati che aiutano nella compilazione.'],
                        ['title' => 'Facoltativo: registra in anticipo i dati della ricevuta', 'text' => 'Per il kit compilato a mano il portale permette di registrare alcuni dati prima («Compila Dati Ricevuta») con telefono cellulare, passaporto in corso di validità usato per il kit e kit compilato. La registrazione vale 15 giorni, entro i quali va completata la procedura in ufficio postale; poi scade e i dati vengono cancellati.'],
                        ['title' => 'Presenta l\'istanza allo Sportello Amico', 'text' => 'Il portale ricorda che l\'istanza è accettata in ufficio postale solo con tutta la documentazione prevista.'],
                        ['title' => 'Attendi la convocazione in Questura', 'text' => 'Il portale indica che con la registrazione anticipata puoi ricevere un SMS anche per la convocazione in Questura, sul numero di cellulare inserito nel kit.'],
                    ],
                    'tips' => 'Secondo il portale lo stesso numero di cellulare vale per una sola registrazione nell\'arco di 15 giorni. Se non hai un cellulare personale puoi andare direttamente in ufficio postale, oppure farti aiutare nella compilazione del kit da un patronato o da alcuni comuni.',
                    'cautions' => 'Spiegazione semplificata di informazioni ufficiali, non consulenza legale. Le pagine consultate non offrono la prenotazione di un appuntamento in Questura: descrivono la presentazione dell\'istanza e la convocazione. Verifica il portale ufficiale e le istruzioni della tua Questura prima di agire: il canale dipende dal tipo di istanza.',
                ],
            ],
        ];
    }

    private static function cieNational(): array
    {
        return [
            'source_id' => 'appt-cie-agenda-nazionale',
            'slug' => 'carta-identita-elettronica-prenotazione-agenda-cie',
            'office_type' => OfficeType::Comune,
            'booking_method' => BookingMethod::Online,
            'booking_portal_url' => 'https://www.prenotazionicie.interno.gov.it/cittadino/n/sc/wizardAppuntamentoCittadino/sceltaComune/',
            'source_name' => 'Carta di Identità Elettronica (CIE) – Ministero dell\'Interno',
            'source_url' => 'https://www.cartaidentita.interno.gov.it/richiedi/rilascio-e-rinnovo-in-italia/',
            'sort_order' => 20,
            'translations' => [
                'ar' => [
                    'title' => 'بطاقة الهوية الإلكترونية (CIE): الحجز عبر Agenda CIE',
                    'summary' => 'يطلب المواطن بطاقة CIE لدى البلدية (Comune)، وتتيح وزارة الداخلية حجز موعد عبر الإنترنت لدى البلديات المشاركة. EXPA لا تحجز لك: تنقلك إلى البوابة الرسمية.',
                    'steps' => [
                        ['title' => 'حدد البلدية', 'text' => 'تذكر الصفحة الرسمية أنه يمكن طلب CIE لدى أي بلدية، وأن الطلب يكون لدى بلدية الإقامة أو السكن (dimora)، ابتداءً من 180 يومًا قبل انتهاء البطاقة الحالية أو عند الضياع أو السرقة أو التلف.'],
                        ['title' => 'احجز موعدًا', 'text' => 'يمكن حجز موعد لدى البلديات المشاركة عبر خدمة الحجز الإلكتروني (Agenda CIE) على بوابة وزارة الداخلية.'],
                        ['title' => 'جهّز الصورة', 'text' => 'تُحضر صورة شخصية مطبوعة بقياس صورة جواز السفر، إلا إذا حجزت عبر Agenda CIE ورفعت الصورة بصيغة رقمية.'],
                        ['title' => 'جهّز الوثائق', 'text' => 'عند الطلب يُنصح بإحضار codice fiscale أو tessera sanitaria. في الإصدار الأول تُبرز وثيقة هوية أخرى سارية (أو تحضر شاهدين)، وفي التجديد أو التلف تسلّم الوثيقة القديمة.'],
                        ['title' => 'الرسوم', 'text' => 'تذكر الصفحة مبلغ 16,79 يورو إضافة إلى الرسوم الثابتة ورسوم الأمانة إن وُجدت. احتفظ بالنموذج الذي تتسلمه من البلدية.'],
                    ],
                    'tips' => 'لا تشارك كل البلديات في Agenda CIE: تذكر الصفحة «البلديات المشاركة»، وبعض البلديات لها نظام حجز خاص بها (انظر دليل ميلانو).',
                    'cautions' => 'هذا شرح مبسّط لمعلومات رسمية وليس استشارة قانونية. لا تفصّل الصفحة شروط حصول المواطنين الأجانب على CIE، لذا اسأل بلديتك عن حالتك. راجع المصدر الرسمي قبل الحجز لأن المبالغ والشروط قد تتغير.',
                ],
                'en' => [
                    'title' => 'Electronic identity card (CIE): booking through Agenda CIE',
                    'summary' => 'The CIE is requested at the Comune, and the Ministry of the Interior offers online appointment booking at participating Comuni. EXPA does not book for you: it only sends you to the official portal.',
                    'steps' => [
                        ['title' => 'Choose the Comune', 'text' => 'The official page says the CIE can be requested at any Comune, at the Comune of residence or dimora, from 180 days before the current card expires or after loss, theft or damage.'],
                        ['title' => 'Book an appointment', 'text' => 'You can book at participating Comuni with the online booking service (Agenda CIE) on the Ministry of the Interior portal.'],
                        ['title' => 'Prepare the photo', 'text' => 'Bring a printed passport-format photo, unless you booked through Agenda CIE and uploaded a digital photo.'],
                        ['title' => 'Prepare the documents', 'text' => 'When applying it is advisable to have your codice fiscale or tessera sanitaria. For a first issue you show another valid identity document (or come with two witnesses); for renewal or damage you hand in the old document.'],
                        ['title' => 'Fee', 'text' => 'The page states EUR 16.79 plus fixed and secretarial fees where applicable. Keep the form you receive from the Comune.'],
                    ],
                    'tips' => 'Not every Comune uses Agenda CIE: the page speaks of "participating Comuni", and some Comuni run their own booking system (see the Milan guide).',
                    'cautions' => 'This is a simplified explanation of official information, not legal advice. The page does not detail the conditions for foreign nationals to obtain a CIE, so ask your Comune about your situation. Check the official source before booking, as amounts and conditions can change.',
                ],
                'it' => [
                    'title' => 'Carta d\'Identità Elettronica (CIE): prenotazione con Agenda CIE',
                    'summary' => 'La CIE si richiede al Comune e il Ministero dell\'Interno offre la prenotazione online dell\'appuntamento presso i Comuni aderenti. EXPA non prenota al posto tuo: ti rimanda al portale ufficiale.',
                    'steps' => [
                        ['title' => 'Scegli il Comune', 'text' => 'La pagina ufficiale indica che la CIE si può richiedere presso qualsiasi Comune, quello di residenza o dimora, a partire da 180 giorni prima della scadenza o dopo smarrimento, furto o deterioramento.'],
                        ['title' => 'Prenota un appuntamento', 'text' => 'Puoi prenotare presso i Comuni aderenti con il servizio di prenotazione online (Agenda CIE) sul portale del Ministero dell\'Interno.'],
                        ['title' => 'Prepara la fototessera', 'text' => 'Porta una fototessera cartacea nel formato del passaporto, salvo che tu abbia prenotato con Agenda CIE e caricato la foto in formato digitale.'],
                        ['title' => 'Prepara i documenti', 'text' => 'Alla richiesta è consigliabile avere codice fiscale o tessera sanitaria. Per il primo rilascio si esibisce un altro documento di identità in corso di validità (o ci si presenta con due testimoni); per rinnovo o deterioramento si consegna il vecchio documento.'],
                        ['title' => 'Costo', 'text' => 'La pagina indica € 16,79 oltre ai diritti fissi e di segreteria, se previsti. Conserva il modulo rilasciato dal Comune.'],
                    ],
                    'tips' => 'Non tutti i Comuni usano Agenda CIE: la pagina parla di «Comuni aderenti» e alcuni Comuni hanno un proprio sistema di prenotazione (vedi la guida di Milano).',
                    'cautions' => 'Spiegazione semplificata di informazioni ufficiali, non consulenza legale. La pagina non dettaglia le condizioni per i cittadini stranieri: chiedi al tuo Comune per la tua situazione. Verifica la fonte ufficiale prima di prenotare perché importi e condizioni possono cambiare.',
                ],
            ],
        ];
    }

    private static function cieRoma(): array
    {
        return [
            'source_id' => 'appt-roma-cie-agenda',
            'slug' => 'roma-capitale-cie-prenotazione-agenda-cie',
            'office_type' => OfficeType::Comune,
            'booking_method' => BookingMethod::Online,
            'booking_portal_url' => 'https://www.prenotazionicie.interno.gov.it/cittadino/n/sc/wizardAppuntamentoCittadino/sceltaComune/',
            'source_name' => 'Roma Capitale – Sistema di prenotazione AgendaCIE',
            'source_url' => 'https://www.comune.roma.it/web/it/scheda-servizi.page?contentId=INF173498',
            'sort_order' => 30,
            'translations' => [
                'ar' => [
                    'title' => 'روما: حجز موعد بطاقة الهوية الإلكترونية (CIE) في البلديات الفرعية (Municipi)',
                    'summary' => 'تشرح روما كابيتالي أن حجز موعد CIE يتم عبر منصة وزارة الداخلية، ويمكن لدى أي Municipio بغض النظر عن مكان السكن أو الإقامة. EXPA لا تحجز لك.',
                    'steps' => [
                        ['title' => 'ادخل منصة الحجز', 'text' => 'استخدم منصة وزارة الداخلية prenotazionicie.interno.gov.it. أدخل الاسم واللقب وcodice fiscale والبلدية المختارة لتظهر لك أول موعد متاح.'],
                        ['title' => 'اختر Municipio', 'text' => 'تذكر الصفحة أن الحجز ممكن لدى أي Municipio بغض النظر عن السكن أو الإقامة. يمكن إتمام الحجز بالدخول عبر SPID مع بيانات أساسية فقط.'],
                        ['title' => 'أكّد الموعد', 'text' => 'قبل الموعد بعشرة أيام تصلك رسالة بريد لتأكيد الحجز، ويجب التأكيد قبل الموعد بثلاثة أيام على الأقل؛ وإلا يُلغى الموعد تلقائيًا. إيصال الحجز يتضمن معلومات التأكيد أو الإلغاء.'],
                        ['title' => 'لتعديل الموعد', 'text' => 'يجب أولًا إلغاء الحجز السابق ثم إجراء حجز جديد.'],
                        ['title' => 'في يوم الموعد', 'text' => 'يتحقق الموظفون من تطابق codice fiscale المُدخل مع صاحب الطلب. الحجز صالح حتى ساعة بعد الموعد، وبعد ذلك ينتهي ويجب إعادة الإجراء. تُرسل البطاقة إلى العنوان المحدد خلال ستة أيام من الطلب بحسب الصفحة.'],
                    ],
                    'tips' => 'إذا أردت الحجز في بلدية أخرى غير بلدية الإقامة، تقول الصفحة إن التأكيد لا يتم إلا بعد وصول الموافقة (nulla osta) من البلدية.',
                    'cautions' => 'هذا شرح مبسّط لمعلومات رسمية وليس استشارة قانونية. تذكر الصفحة أن حجز CIE غير ممكن عبر نظام Tupassi ولا عبر الحجز الإلكتروني أو الأجهزة (totem) الموجودة في الـMunicipi. راجع المصدر الرسمي لروما كابيتالي قبل الحجز.',
                ],
                'en' => [
                    'title' => 'Rome: booking a CIE appointment at the Municipi',
                    'summary' => 'Roma Capitale explains that CIE appointments are booked on the Ministry of the Interior platform, at any Municipio regardless of domicile or residence. EXPA does not book for you.',
                    'steps' => [
                        ['title' => 'Open the booking platform', 'text' => 'Use the Ministry of the Interior platform prenotazionicie.interno.gov.it. Enter name, surname, codice fiscale and the chosen Comune to see the first available date.'],
                        ['title' => 'Choose a Municipio', 'text' => 'The page says you can book at any Municipio regardless of domicile or residence. Booking can be completed by logging in with SPID, using only the essential data.'],
                        ['title' => 'Confirm the appointment', 'text' => 'Ten days before the date you receive an email to confirm the booking, and the confirmation must be made at least three days before; otherwise the appointment is cancelled automatically. The booking receipt contains the information to confirm or cancel.'],
                        ['title' => 'To change the date', 'text' => 'You must first cancel the previous booking, then make a new one.'],
                        ['title' => 'On the day', 'text' => 'Staff check that the codice fiscale given at booking matches the person at the counter. The booking is valid up to one hour after the set time, after that it expires and you must repeat the procedure. According to the page the card is sent within six days of the request.'],
                    ],
                    'tips' => 'If you book in a Comune other than the one you live in, the page says the appointment is confirmed only after the Comune receives the nulla osta.',
                    'cautions' => 'This is a simplified explanation of official information, not legal advice. The page says CIE cannot be booked through Tupassi, nor through online reservations or totems in the Municipi. Check Roma Capitale\'s official page before booking.',
                ],
                'it' => [
                    'title' => 'Roma: prenotare l\'appuntamento per la CIE nei Municipi',
                    'summary' => 'Roma Capitale spiega che gli appuntamenti per la CIE si prenotano sulla piattaforma del Ministero dell\'Interno, presso qualsiasi Municipio indipendentemente dal domicilio o dalla residenza. EXPA non prenota al posto tuo.',
                    'steps' => [
                        ['title' => 'Apri la piattaforma di prenotazione', 'text' => 'Usa la piattaforma del Ministero dell\'Interno prenotazionicie.interno.gov.it. Inserendo nome, cognome, codice fiscale e Comune scelto vedi la prima data disponibile.'],
                        ['title' => 'Scegli il Municipio', 'text' => 'La pagina indica che puoi prenotare presso qualsiasi Municipio indipendentemente dal domicilio o dalla residenza. La prenotazione può essere completata con SPID, usando solo i dati essenziali.'],
                        ['title' => 'Conferma l\'appuntamento', 'text' => 'Dieci giorni prima della data ricevi una mail per confermare la prenotazione, da effettuare entro tre giorni prima della data fissata; altrimenti l\'appuntamento viene cancellato automaticamente. La ricevuta contiene le informazioni per confermare o disdire.'],
                        ['title' => 'Per modificare la data', 'text' => 'Bisogna prima cancellare la prenotazione precedente e poi farne una nuova.'],
                        ['title' => 'Il giorno dell\'appuntamento', 'text' => 'Gli operatori verificano che il codice fiscale indicato in prenotazione corrisponda a quello della persona allo sportello. La prenotazione è valida fino a un\'ora dopo l\'orario fissato, poi scade e va ripetuta. Secondo la pagina la carta è spedita entro sei giorni dalla richiesta.'],
                    ],
                    'tips' => 'Se prenoti in un Comune diverso da quello in cui risiedi, la pagina indica che l\'appuntamento è confermato solo dopo la ricezione del nulla osta da parte del Comune.',
                    'cautions' => 'Spiegazione semplificata di informazioni ufficiali, non consulenza legale. La pagina precisa che la CIE non si prenota tramite Tupassi né tramite prenotazioni online o totem presenti nei Municipi. Verifica la pagina ufficiale di Roma Capitale prima di prenotare.',
                ],
            ],
        ];
    }

    private static function cieMilano(): array
    {
        return [
            'source_id' => 'appt-milano-cie',
            'slug' => 'milano-carta-identita-elettronica-appuntamento',
            'office_type' => OfficeType::Comune,
            'booking_method' => BookingMethod::Online,
            'booking_portal_url' => 'https://www.comune.milano.it/servizi/anagrafe/carta-d-identita',
            'source_name' => 'Comune di Milano – Carta d\'identità',
            'source_url' => 'https://www.comune.milano.it/servizi/anagrafe/carta-d-identita',
            'sort_order' => 40,
            'translations' => [
                'ar' => [
                    'title' => 'ميلانو: موعد بطاقة الهوية الإلكترونية (CIE) عبر موقع البلدية',
                    'summary' => 'تذكر صفحة بلدية ميلانو أن إصدار بطاقة الهوية الإلكترونية يتم فقط بموعد يُحجز عبر الإنترنت من موقع البلدية. EXPA لا تحجز لك، بل توجّهك إلى صفحة البلدية.',
                    'steps' => [
                        ['title' => 'افتح صفحة الخدمة', 'text' => 'من صفحة «Carta d\'identità» لدى Comune di Milano استخدم زر حجز الموعد.'],
                        ['title' => 'اختر المقر والتاريخ', 'text' => 'تذكر الصفحة أن الحجز عبر الإنترنت يتم باختيار المقر ثم التاريخ والوقت في التقويم، وإدخال بيانات صاحب الوثيقة حتى لو كان قاصرًا.'],
                        ['title' => 'عدة أشخاص من الأسرة', 'text' => 'عند الدخول عبر SPID أو CIE يمكن حجز ما يصل إلى خمسة مواعيد في وقت واحد لأفراد الأسرة.'],
                        ['title' => 'الوثائق', 'text' => 'تذكر الصفحة: tessera sanitaria أو codice fiscale، وصورة شخصية ملونة حديثة على خلفية فاتحة ومطابقة لمعايير وزارة الداخلية.'],
                        ['title' => 'التسليم', 'text' => 'لا تُسلَّم البطاقة وقت الطلب، بل تُطبع في Istituto Poligrafico e Zecca dello Stato وتُرسل خلال 6 أيام عمل من الطلب إلى المنزل أو إلى عنوان آخر تحدده، وتُرسل بالبريد المسجل.'],
                    ],
                    'tips' => 'تذكر الصفحة أنه لا حاجة لتجديد البطاقة عند تغيير العنوان أو الإقامة.',
                    'cautions' => 'هذا شرح مبسّط لمعلومات رسمية وليس استشارة قانونية. نظام الحجز في ميلانو مرتبط بموقع البلدية وقد يتغير، وقد تطلب الصفحة الدخول بحساب. راجع صفحة Comune di Milano الرسمية قبل الحجز.',
                ],
                'en' => [
                    'title' => 'Milan: electronic identity card (CIE) appointment on the Comune website',
                    'summary' => 'The Comune di Milano page says the electronic identity card is issued only by appointment booked online through the Comune\'s website. EXPA does not book for you: it points you to the Comune page.',
                    'steps' => [
                        ['title' => 'Open the service page', 'text' => 'On the Comune di Milano "Carta d\'identità" page use the appointment booking button.'],
                        ['title' => 'Choose the office and the date', 'text' => 'The page says online booking works by choosing the office, then the date and time in the calendar, and entering the data of the person the document is for, even a minor.'],
                        ['title' => 'Several family members', 'text' => 'When logging in with SPID or CIE you can book up to five appointments at once for members of your household.'],
                        ['title' => 'Documents', 'text' => 'The page lists the tessera sanitaria or codice fiscale and a recent colour photo on a light background that meets the Ministry of the Interior parameters.'],
                        ['title' => 'Delivery', 'text' => 'The card is not handed over at the request: it is printed by the Istituto Poligrafico e Zecca dello Stato and sent within 6 working days to your home or another address you indicate, by registered mail.'],
                    ],
                    'tips' => 'The page notes that you do not need to renew the card when you change address or residence.',
                    'cautions' => 'This is a simplified explanation of official information, not legal advice. Milan\'s booking system is tied to the Comune website and may change, and it may ask you to log in. Check the official Comune di Milano page before booking.',
                ],
                'it' => [
                    'title' => 'Milano: appuntamento per la carta d\'identità elettronica (CIE) sul sito del Comune',
                    'summary' => 'La pagina del Comune di Milano indica che la carta d\'identità elettronica si rilascia solo su appuntamento da prenotare online tramite il sito del Comune. EXPA non prenota al posto tuo: ti indirizza alla pagina del Comune.',
                    'steps' => [
                        ['title' => 'Apri la pagina del servizio', 'text' => 'Nella pagina «Carta d\'identità» del Comune di Milano usa il pulsante per prenotare l\'appuntamento.'],
                        ['title' => 'Scegli sede, data e ora', 'text' => 'La pagina spiega che la prenotazione online avviene selezionando la sede di interesse, indicando nel calendario la data e l\'orario e inserendo i dati della persona intestataria del documento, anche se minore.'],
                        ['title' => 'Più componenti del nucleo familiare', 'text' => 'Accedendo con SPID o CIE è possibile prenotare simultaneamente fino a un massimo di cinque appuntamenti per componenti del proprio nucleo familiare.'],
                        ['title' => 'Documenti', 'text' => 'La pagina elenca tessera sanitaria o codice fiscale e una fototessera a colori recente, su sfondo chiaro, compatibile con i parametri del Ministero dell\'Interno.'],
                        ['title' => 'Consegna', 'text' => 'La carta non viene rilasciata al momento della richiesta: è stampata dall\'Istituto Poligrafico e Zecca dello Stato e spedita entro 6 giorni lavorativi al domicilio o a un altro indirizzo indicato, con raccomandata.'],
                    ],
                    'tips' => 'La pagina precisa che non è necessario rinnovare la carta d\'identità in occasione di cambi di indirizzo e di residenza.',
                    'cautions' => 'Spiegazione semplificata di informazioni ufficiali, non consulenza legale. Il sistema di prenotazione di Milano dipende dal sito del Comune e può cambiare; può richiedere l\'accesso con credenziali. Verifica la pagina ufficiale del Comune di Milano prima di prenotare.',
                ],
            ],
        ];
    }

    private static function agenziaEntrate(): array
    {
        return [
            'source_id' => 'appt-agenzia-entrate',
            'slug' => 'agenzia-entrate-prenota-un-appuntamento',
            'office_type' => OfficeType::AgenziaEntrate,
            'booking_method' => BookingMethod::Online,
            'booking_portal_url' => 'https://www.agenziaentrate.gov.it/portale/web/guest/prenota-un-appuntamento',
            'source_name' => 'Agenzia delle Entrate – Prenota un appuntamento',
            'source_url' => 'https://www.agenziaentrate.gov.it/portale/web/guest/prenota-un-appuntamento',
            'sort_order' => 50,
            'translations' => [
                'ar' => [
                    'title' => 'Agenzia delle Entrate: حجز موعد أو تذكرة دور (Webticket)',
                    'summary' => 'تتيح صفحة «Prenota un appuntamento» لدى Agenzia delle Entrate حجز موعد للمساعدة الضريبية، منها طلب نسخة بديلة من codice fiscale وtessera sanitaria. EXPA لا تحجز لك، بل توجّهك إلى الصفحة الرسمية.',
                    'steps' => [
                        ['title' => 'اختر نوع المساعدة', 'text' => 'تعرض الصفحة المساعدة الضريبية، والمساعدة العقارية (catasto) والرهنية، والمساعدة بشأن cartelle di pagamento لدى Agenzia delle entrate-Riscossione (وهي جهة مختلفة).'],
                        ['title' => 'اختر الموضوع', 'text' => 'من المواضيع المذكورة: «Identificativi fiscali، abilitazioni، consegna documenti e istanze» وتشمل طلب نسخة بديلة من codice fiscale وtessera sanitaria والتفعيل لخدمات الإنترنت.'],
                        ['title' => 'اختر الوقت', 'text' => 'إما موعد للأيام القادمة (هاتفي أو بمكالمة فيديو أو حضوري) بحد أقصى ثلاثة مواعيد في اليوم، أو Webticket صالح لليوم نفسه فقط ويُحجز من الساعة 6:00 حتى نفاد المتاح ولبعض الخدمات فقط.'],
                    ],
                    'tips' => 'تعرض الصفحة أيضًا رابط «Disdici appuntamento» لإلغاء الموعد، و«Trova l\'ufficio» لإيجاد المكتب، وخطًا هاتفيًا مجانيًا مذكورًا فيها: 800.90.96.96.',
                    'cautions' => 'هذا شرح مبسّط لمعلومات رسمية وليس استشارة ضريبية أو قانونية. الصفحة لا تشرح إجراءات الحصول على codice fiscale لأول مرة. راجع Agenzia delle Entrate مباشرة قبل أي خطوة.',
                ],
                'en' => [
                    'title' => 'Agenzia delle Entrate: booking an appointment or a same-day Webticket',
                    'summary' => 'The "Prenota un appuntamento" page of the Agenzia delle Entrate lets you book tax assistance appointments, including requests for a duplicate codice fiscale and tessera sanitaria. EXPA does not book for you: it points to the official page.',
                    'steps' => [
                        ['title' => 'Choose the type of assistance', 'text' => 'The page lists tax assistance, cadastral and mortgage assistance, and assistance on payment notices with Agenzia delle entrate-Riscossione (a different body).'],
                        ['title' => 'Choose the topic', 'text' => 'Among the topics: "Identificativi fiscali, abilitazioni, consegna documenti e istanze", which covers duplicate codice fiscale and tessera sanitaria requests and enabling the online services.'],
                        ['title' => 'Choose when', 'text' => 'Either an appointment for the coming days (phone, video call or in person), with a maximum of three appointments per day, or a Webticket valid for the same day only, bookable from 6:00 until availability runs out and for some services only.'],
                    ],
                    'tips' => 'The page also shows a "Disdici appuntamento" link to cancel, "Trova l\'ufficio" to find an office, and a toll-free number it publishes: 800.90.96.96.',
                    'cautions' => 'This is a simplified explanation of official information, not tax or legal advice. The page does not explain how to obtain a codice fiscale for the first time. Check the Agenzia delle Entrate directly before acting.',
                ],
                'it' => [
                    'title' => 'Agenzia delle Entrate: prenotare un appuntamento o un Webticket del giorno',
                    'summary' => 'La pagina «Prenota un appuntamento» dell\'Agenzia delle Entrate permette di prenotare l\'assistenza fiscale, anche per la richiesta di duplicato di codice fiscale e tessera sanitaria. EXPA non prenota al posto tuo: ti rimanda alla pagina ufficiale.',
                    'steps' => [
                        ['title' => 'Scegli il tipo di assistenza', 'text' => 'La pagina elenca assistenza fiscale, assistenza catastale e ipotecaria e assistenza sulla cartella di pagamento con l\'Agenzia delle entrate-Riscossione (ente diverso).'],
                        ['title' => 'Scegli l\'argomento', 'text' => 'Tra gli argomenti: «Identificativi fiscali, abilitazioni, consegna documenti e istanze», che comprende la richiesta di duplicato di codice fiscale e tessera sanitaria e l\'abilitazione ai servizi telematici.'],
                        ['title' => 'Scegli quando', 'text' => 'Un appuntamento per i prossimi giorni (telefonico, in videochiamata o in presenza), fino a un massimo di tre appuntamenti al giorno, oppure un Webticket valido per oggi, prenotabile dalle ore 6.00 fino a esaurimento della disponibilità e solo per alcuni servizi.'],
                    ],
                    'tips' => 'La pagina mostra anche «Disdici appuntamento» per annullare, «Trova l\'ufficio» per individuare la sede e un numero verde che riporta: 800.90.96.96.',
                    'cautions' => 'Spiegazione semplificata di informazioni ufficiali, non consulenza fiscale o legale. La pagina non spiega come ottenere il codice fiscale la prima volta. Verifica direttamente con l\'Agenzia delle Entrate prima di agire.',
                ],
            ],
        ];
    }

    private static function inps(): array
    {
        return [
            'source_id' => 'appt-inps-sportelli-di-sede',
            'slug' => 'inps-sportelli-di-sede-prenotazione-appuntamento',
            'office_type' => OfficeType::Inps,
            'booking_method' => BookingMethod::Online,
            'booking_portal_url' => 'https://www.inps.it/it/it/sedi-e-contatti/sedi/ricerca-sede.html',
            'source_name' => 'INPS – Sportelli di sede: informazioni sugli orari di apertura e servizio di appuntamenti',
            'source_url' => 'https://www.inps.it/it/it/dettaglio-scheda.it.schede-servizio-strumento.schede-servizi.52562.sportelli-di-sede-informazioni-sugli-orari-di-apertura-e-servizio-di-prenotazione.html',
            'sort_order' => 60,
            'translations' => [
                'ar' => [
                    'title' => 'INPS: حجز موعد في مقر INPS (Sportelli di sede)',
                    'summary' => 'تتيح خدمة «Sedi INPS - Informazioni e prenotazioni» الاطلاع على بيانات مقرات INPS المفتوحة للجمهور، ومراسلة المقر، وحجز موعد على الشباك حضوريًا أو هاتفيًا أو بمكالمة فيديو. EXPA لا تحجز لك.',
                    'steps' => [
                        ['title' => 'افتح الخدمة', 'text' => 'ابحث عن المقر المطلوب في خدمة «Sedi INPS - Informazioni e prenotazioni». تعرض الخدمة لكل مقر العنوان وجهات الاتصال (بما فيها PEC) ونطاق الاختصاص الإقليمي والشبابيك.'],
                        ['title' => 'سجّل الدخول للحجز', 'text' => 'خدمة حجز المواعيد مخصصة بحسب الصفحة لمن لديهم بيانات دخول فقط، أما الخدمة الإعلامية والمراسلة فمفتوحة للجميع.'],
                        ['title' => 'أنشئ الحجز', 'text' => 'تختار المقر والشباك واليوم والساعة المتاحين خلال الأسبوعين التاليين وطريقة تقديم الخدمة وسبب الحجز.'],
                        ['title' => 'بدائل الحجز عبر الإنترنت', 'text' => 'تذكر الصفحة إمكانية حجز موعد على الشباك أيضًا عبر تطبيق INPSMobile أو Contact Center أو خدمة الاستقبال الأولي (prima accoglienza) في المقرات.'],
                    ],
                    'tips' => 'للتواصل مع INPS من الخارج تذكر الصفحة خدمة «INPS risponde» وحجز موعد بمكالمة فيديو وأرقامًا مجانية أوروبية مخصصة في صفحة Contact Center.',
                    'cautions' => 'هذا شرح مبسّط لمعلومات رسمية وليس استشارة قانونية. تحتاج بيانات الدخول للحجز عبر الإنترنت. راجع صفحة INPS الرسمية قبل الحجز.',
                ],
                'en' => [
                    'title' => 'INPS: booking an appointment at an INPS office (Sportelli di sede)',
                    'summary' => 'The "Sedi INPS - Informazioni e prenotazioni" service lets you look up INPS offices open to the public, write to the office and book a counter appointment in person, by phone or by video call. EXPA does not book for you.',
                    'steps' => [
                        ['title' => 'Open the service', 'text' => 'Look up the office you need in "Sedi INPS - Informazioni e prenotazioni". For each office it shows the address, contacts (including PEC), the territorial area of competence and the counters.'],
                        ['title' => 'Log in to book', 'text' => 'According to the page the appointment booking service is reserved for users with access credentials, while the information service and writing to the office are open to everyone.'],
                        ['title' => 'Create the booking', 'text' => 'You choose the office, the counter, the day and time still available in the following two weeks, the preferred service mode and the reason for the booking.'],
                        ['title' => 'Alternatives to online booking', 'text' => 'The page says you can also book a counter appointment through the INPSMobile app, the Contact Center or the first-reception service of the offices.'],
                    ],
                    'tips' => 'To contact INPS from abroad the page mentions the "INPS risponde" service, booking a video-call appointment and dedicated European toll-free numbers listed on the Contact Center page.',
                    'cautions' => 'This is a simplified explanation of official information, not legal advice. Online booking needs access credentials. Check the official INPS page before booking.',
                ],
                'it' => [
                    'title' => 'INPS: prenotare un appuntamento in sede (Sportelli di sede)',
                    'summary' => 'Il servizio «Sedi INPS - Informazioni e prenotazioni» permette di consultare le sedi INPS aperte al pubblico, scrivere alla sede e prenotare un appuntamento allo sportello, anche in modalità telefonica o in videochiamata. EXPA non prenota al posto tuo.',
                    'steps' => [
                        ['title' => 'Apri il servizio', 'text' => 'Cerca la sede di interesse in «Sedi INPS - Informazioni e prenotazioni». Per ogni sede sono indicati indirizzo, contatti (anche PEC), ambito di competenza territoriale e sportelli.'],
                        ['title' => 'Accedi per prenotare', 'text' => 'Secondo la pagina il servizio di prenotazione degli appuntamenti è riservato ai soli utenti muniti di credenziali di accesso; il servizio informativo e la possibilità di scrivere alla sede sono per tutti.'],
                        ['title' => 'Crea la prenotazione', 'text' => 'Scegli sede, sportello, giorno e orario ancora disponibili nell\'arco delle due settimane successive, modalità preferita di erogazione del servizio e motivazione.'],
                        ['title' => 'Alternative al servizio online', 'text' => 'La pagina indica che è possibile prenotare un appuntamento allo sportello anche tramite app INPSMobile, Contact Center o servizio di prima accoglienza delle sedi.'],
                    ],
                    'tips' => 'Per contattare INPS dall\'estero la pagina cita il servizio «INPS risponde», la prenotazione in videochiamata e i numeri verdi europei dedicati sulla pagina del Contact Center.',
                    'cautions' => 'Spiegazione semplificata di informazioni ufficiali, non consulenza legale. La prenotazione online richiede credenziali di accesso. Verifica la pagina ufficiale INPS prima di prenotare.',
                ],
            ],
        ];
    }
}
