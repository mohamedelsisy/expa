<?php

namespace Database\Seeders;

use App\Domains\Geo\Models\City;
use App\Domains\Geo\Models\Region;
use Illuminate\Database\Seeder;

/**
 * Reference data only (geography is not government procedure content): the 20 Italian regions
 * (ISTAT codes) and the main cities. Idempotent; admins can add more cities later.
 */
class GeographySeeder extends Seeder
{
    // code => [slug, ar, en, it]
    private const REGIONS = [
        '01' => ['piemonte', 'بيدمونت', 'Piedmont', 'Piemonte'],
        '02' => ['valle-d-aosta', 'وادي أوستا', 'Aosta Valley', "Valle d'Aosta"],
        '03' => ['lombardia', 'لومبارديا', 'Lombardy', 'Lombardia'],
        '04' => ['trentino-alto-adige', 'ترينتينو-ألتو أديجي', 'Trentino-South Tyrol', 'Trentino-Alto Adige'],
        '05' => ['veneto', 'فينيتو', 'Veneto', 'Veneto'],
        '06' => ['friuli-venezia-giulia', 'فريولي-فينيتسيا جوليا', 'Friuli-Venezia Giulia', 'Friuli-Venezia Giulia'],
        '07' => ['liguria', 'ليغوريا', 'Liguria', 'Liguria'],
        '08' => ['emilia-romagna', 'إميليا-رومانيا', 'Emilia-Romagna', 'Emilia-Romagna'],
        '09' => ['toscana', 'توسكانا', 'Tuscany', 'Toscana'],
        '10' => ['umbria', 'أومبريا', 'Umbria', 'Umbria'],
        '11' => ['marche', 'الماركي', 'Marche', 'Marche'],
        '12' => ['lazio', 'لاتسيو', 'Lazio', 'Lazio'],
        '13' => ['abruzzo', 'أبروتسو', 'Abruzzo', 'Abruzzo'],
        '14' => ['molise', 'موليزي', 'Molise', 'Molise'],
        '15' => ['campania', 'كامبانيا', 'Campania', 'Campania'],
        '16' => ['puglia', 'بوليا', 'Apulia', 'Puglia'],
        '17' => ['basilicata', 'باسيليكاتا', 'Basilicata', 'Basilicata'],
        '18' => ['calabria', 'كالابريا', 'Calabria', 'Calabria'],
        '19' => ['sicilia', 'صقلية', 'Sicily', 'Sicilia'],
        '20' => ['sardegna', 'سردينيا', 'Sardinia', 'Sardegna'],
    ];

    // slug => [region code, ar, en, it]
    private const CITIES = [
        'roma' => ['12', 'روما', 'Rome', 'Roma'],
        'milano' => ['03', 'ميلانو', 'Milan', 'Milano'],
        'napoli' => ['15', 'نابولي', 'Naples', 'Napoli'],
        'torino' => ['01', 'تورينو', 'Turin', 'Torino'],
        'bologna' => ['08', 'بولونيا', 'Bologna', 'Bologna'],
        'firenze' => ['09', 'فلورنسا', 'Florence', 'Firenze'],
        'genova' => ['07', 'جنوة', 'Genoa', 'Genova'],
        'venezia' => ['05', 'البندقية', 'Venice', 'Venezia'],
        'verona' => ['05', 'فيرونا', 'Verona', 'Verona'],
        'padova' => ['05', 'بادوفا', 'Padua', 'Padova'],
        'trieste' => ['06', 'تريستي', 'Trieste', 'Trieste'],
        'perugia' => ['10', 'بيروجيا', 'Perugia', 'Perugia'],
        'bari' => ['16', 'باري', 'Bari', 'Bari'],
        'palermo' => ['19', 'باليرمو', 'Palermo', 'Palermo'],
        'catania' => ['19', 'كاتانيا', 'Catania', 'Catania'],
        'cagliari' => ['20', 'كالياري', 'Cagliari', 'Cagliari'],
    ];

    public function run(): void
    {
        $regionIds = [];
        foreach (self::REGIONS as $code => [$slug, $ar, $en, $it]) {
            $region = Region::updateOrCreate(['code' => $code], ['slug' => $slug]);
            $region->setTranslations(['ar' => ['name' => $ar], 'en' => ['name' => $en], 'it' => ['name' => $it]]);
            $regionIds[$code] = $region->id;
        }

        foreach (self::CITIES as $slug => [$code, $ar, $en, $it]) {
            $city = City::updateOrCreate(['slug' => $slug], ['region_id' => $regionIds[$code]]);
            $city->setTranslations(['ar' => ['name' => $ar], 'en' => ['name' => $en], 'it' => ['name' => $it]]);
        }
    }
}
