<?php

namespace Database\Seeders;

use App\Domains\Geo\Models\City;
use App\Domains\Geo\Models\CityProfile;
use Illuminate\Database\Seeder;

/**
 * EXPA official Rome city content slice v4.
 * Sources checked 2026-10-08. Content is summarized, not copied.
 * The city profile remains in review outside local/testing.
 */
class OfficialContentV4Seeder extends Seeder
{
    private const VERIFIED_AT = '2026-10-08';

    public function run(): void
    {
        $city = City::where('slug', 'roma')->firstOrFail();

        $profile = CityProfile::updateOrCreate(
            ['slug' => 'roma'],
            [
                'city_id' => $city->id,
                'sort_order' => 10,
                'source_name' => 'Roma Capitale / ATAC',
                'source_url' => 'https://www.comune.roma.it/',
                'source_type' => 'official',
                'last_verified_at' => self::VERIFIED_AT,
            ]
        );

        $profile->setTranslations([
            'ar' => [
                'headline' => 'دليلك للحياة في روما',
                'summary' => 'معلومات عملية موثقة عن المواصلات والخدمات الاجتماعية والحضانة والسكن والخدمات اليومية في روما.',
                'seo_description' => 'دليل EXPA للحياة في روما: المواصلات، الخدمات الاجتماعية، الحضانات، السكن والخدمات البلدية.',
            ],
            'en' => [
                'headline' => 'Your guide to living in Rome',
                'summary' => 'Practical, source-backed information about transport, social services, childcare, housing and daily services in Rome.',
                'seo_description' => 'EXPA Rome guide: transport, social services, childcare, housing and municipal services.',
            ],
            'it' => [
                'headline' => 'La tua guida per vivere a Roma',
                'summary' => 'Informazioni pratiche e verificabili su trasporti, servizi sociali, nidi, abitare e servizi quotidiani a Roma.',
                'seo_description' => 'Guida EXPA a Roma: trasporti, servizi sociali, nidi, abitare e servizi comunali.',
            ],
        ]);

        $profile->syncContentRelations([
            'blocks' => [
                [
                    'key' => 'overview',
                    'info_type' => 'official_info',
                    'sort_order' => 10,
                    'source_name' => 'Roma Capitale',
                    'source_url' => 'https://www.comune.roma.it/',
                    'source_type' => 'official',
                    'last_verified_at' => self::VERIFIED_AT,
                    'translations' => [
                        'ar' => ['title' => 'ابدأ من الخدمات الرسمية', 'body' => 'بوابة Roma Capitale هي نقطة الانطلاق للخدمات البلدية. قبل أي إجراء، تحقق من الصفحة الرسمية للخدمة والمواعيد والشروط الحالية.'],
                        'en' => ['title' => 'Start with official services', 'body' => 'Roma Capitale is the starting point for municipal services. Before taking action, check the current official service page, deadlines and requirements.'],
                        'it' => ['title' => 'Parti dai servizi ufficiali', 'body' => 'Roma Capitale è il punto di partenza per i servizi comunali. Prima di procedere, verifica la scheda ufficiale, le scadenze e i requisiti aggiornati.'],
                    ],
                ],
                [
                    'key' => 'transport',
                    'info_type' => 'official_info',
                    'sort_order' => 20,
                    'source_name' => 'ATAC',
                    'source_url' => 'https://www.atac.roma.it/biglietti-e-abbonamenti/abbonamento-annuale-roma',
                    'source_type' => 'official',
                    'last_verified_at' => self::VERIFIED_AT,
                    'translations' => [
                        'ar' => ['title' => 'المواصلات العامة في روما', 'body' => 'ATAC توفر تذاكر واشتراكات للنقل داخل Roma Capitale. الاشتراك الشهري الشخصي الحالي هو 35 يورو، والسنوي 250 يورو لمدة 365 يومًا. تحقق دائمًا من ATAC قبل الشراء لأن الأسعار وشروط المنتجات قد تتغير.'],
                        'en' => ['title' => 'Public transport in Rome', 'body' => 'ATAC offers tickets and passes for travel within Roma Capitale. The current personal monthly pass is €35 and the annual Rome pass is €250 for 365 days. Always check ATAC before buying because products and conditions can change.'],
                        'it' => ['title' => 'Trasporto pubblico a Roma', 'body' => 'ATAC offre biglietti e abbonamenti per viaggiare nel territorio di Roma Capitale. L’abbonamento mensile personale corrente è di €35 e quello annuale Roma è di €250 per 365 giorni. Verifica sempre ATAC prima dell’acquisto.'],
                    ],
                ],
                [
                    'key' => 'daily_life',
                    'info_type' => 'official_info',
                    'sort_order' => 30,
                    'source_name' => 'Roma Capitale',
                    'source_url' => 'https://www.comune.roma.it/web/it/scheda-servizi.page?contentId=INF35995',
                    'source_type' => 'official',
                    'last_verified_at' => self::VERIFIED_AT,
                    'translations' => [
                        'ar' => ['title' => 'الخدمات الاجتماعية في البلدية', 'body' => 'Segretariato Sociale / Punto Unico di Accesso يساعد السكان على فهم احتياجاتهم وتوجيههم إلى خدمات البلدية أو الخدمات الصحية والاجتماعية المناسبة. الخدمة موجهة للأشخاص المقيمين في منطقة الـMunicipio المعنية.'],
                        'en' => ['title' => 'Municipal social services', 'body' => 'Segretariato Sociale / Punto Unico di Accesso helps residents explain their needs and get oriented toward relevant municipal, health and social services. Eligibility and local access depend on the relevant Municipio.'],
                        'it' => ['title' => 'Servizi sociali municipali', 'body' => 'Il Segretariato Sociale / Punto Unico di Accesso accoglie i cittadini, ascolta i bisogni e orienta verso i servizi comunali, sanitari e sociali. L’accesso riguarda le persone residenti nel territorio del Municipio competente.'],
                    ],
                ],
                [
                    'key' => 'study',
                    'info_type' => 'official_info',
                    'sort_order' => 40,
                    'source_name' => 'Roma Capitale',
                    'source_url' => 'https://www.comune.roma.it/web-resources/cms/documents/AVVISO_PUBBLICO_2026.27_Iscrizioni_Servizi_educativi.pdf',
                    'source_type' => 'official',
                    'last_verified_at' => self::VERIFIED_AT,
                    'translations' => [
                        'ar' => ['title' => 'الحضانات وخدمات 0–3 سنوات', 'body' => 'Roma Capitale تنشر إجراءات التسجيل في الخدمات التعليمية 0–3 سنوات. في دورة 2026/27 كان التقديم عبر الإنترنت، مع استخدام SPID أو CIE أو CNS للوصول إلى الخدمات الرقمية، وتوجد قواعد خاصة بالقبول وقوائم الانتظار والمواعيد.'],
                        'en' => ['title' => 'Childcare and 0–3 services', 'body' => 'Roma Capitale publishes the application process for 0–3 educational services. For the 2026/27 cycle, applications were online and access to the digital services used SPID, CIE or CNS, with specific rules for offers, waiting lists and deadlines.'],
                        'it' => ['title' => 'Nidi e servizi educativi 0–3', 'body' => 'Roma Capitale pubblica le procedure per l’iscrizione ai servizi educativi 0–3. Per l’anno 2026/27 la domanda era online con accesso tramite SPID, CIE o CNS, con regole specifiche per assegnazioni, liste d’attesa e scadenze.'],
                    ],
                ],
                [
                    'key' => 'housing',
                    'info_type' => 'official_info',
                    'sort_order' => 50,
                    'source_name' => 'Roma Capitale / ASAC',
                    'source_url' => 'https://asac.comune.roma.it/',
                    'source_type' => 'official',
                    'last_verified_at' => self::VERIFIED_AT,
                    'translations' => [
                        'ar' => ['title' => 'دعم السكن في روما', 'body' => 'Agenzia Sociale per l’Abitare Capitolina (ASAC) تعمل كجهة بلدية لمساندة قضايا السكن وتوفر نقاط تواصل مرتبطة بالـMunicipi. استخدم القنوات الرسمية لمعرفة الخدمات المتاحة في منطقتك قبل الاعتماد على أي إعلان غير رسمي.'],
                        'en' => ['title' => 'Housing support in Rome', 'body' => 'Agenzia Sociale per l’Abitare Capitolina (ASAC) provides municipal housing-support services through local points connected with the Municipi. Use its official channels to identify the service available in your area before relying on unofficial listings.'],
                        'it' => ['title' => 'Supporto all’abitare a Roma', 'body' => 'L’Agenzia Sociale per l’Abitare Capitolina (ASAC) offre servizi di supporto all’abitare attraverso punti collegati ai Municipi. Usa i canali ufficiali per verificare i servizi disponibili nella tua zona.'],
                    ],
                ],
            ],
        ]);

        $live = app()->environment('local', 'testing');
        $profile->forceFill([
            'status' => $live ? 'published' : 'review',
            'published_at' => $live ? ($profile->published_at ?? now()) : null,
        ])->save();
    }
}
