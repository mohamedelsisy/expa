<?php

namespace Tests\Feature\DataImport;

use App\Domains\DataImport\Models\DataImportRun;
use App\Domains\Geo\Models\City;
use App\Domains\Geo\Models\Region;
use App\Domains\GeoImport\Support\XlsxReader;
use Database\Seeders\GeographySeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;
use ZipArchive;

class IstatComuniImportTest extends TestCase
{
    use RefreshDatabase;

    private const HEADER = ['A' => 'Codice Regione', 'E' => 'Codice Comune formato alfanumerico', 'G' => 'Denominazione in italiano', 'K' => 'Denominazione Regione', 'N' => 'Flag Comune capoluogo di Provincia/Città metropolitana/libero consorzio', 'O' => 'Sigla automobilistica'];

    protected function setUp(): void
    {
        parent::setUp();
        Storage::fake('local');
        $this->seed(GeographySeeder::class);
    }

    /** Builds a tiny XLSX (inline strings) from the fixture TSV; returns the path. */
    private function xlsx(?array $header = null): string
    {
        $rows = [$header ?? self::HEADER];
        foreach (file(base_path('tests/Fixtures/imports/istat/FIXTURE-comuni.tsv'), FILE_IGNORE_NEW_LINES) as $line) {
            if ($line === '' || $line[0] === '#') {
                continue;
            }
            $f = explode("\t", $line);
            $rows[] = ['A' => $f[0], 'E' => $f[1], 'G' => $f[2], 'K' => $f[3], 'N' => $f[4], 'O' => $f[5]];
        }
        $sheet = '<?xml version="1.0"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>';
        foreach ($rows as $i => $row) {
            $sheet .= '<row r="'.($i + 1).'">';
            foreach ($row as $col => $val) {
                if ($val !== '') {
                    $sheet .= '<c r="'.$col.($i + 1).'" t="inlineStr"><is><t>'.htmlspecialchars($val, ENT_XML1).'</t></is></c>';
                }
            }
            $sheet .= '</row>';
        }
        $sheet .= '</sheetData></worksheet>';

        $path = tempnam(sys_get_temp_dir(), 'istat').'.xlsx';
        $zip = new ZipArchive;
        $zip->open($path, ZipArchive::CREATE | ZipArchive::OVERWRITE);
        $zip->addFromString('xl/workbook.xml', '<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="CODICI al 21_02_2026" sheetId="1" r:id="rId1"/></sheets></workbook>');
        $zip->addFromString('xl/_rels/workbook.xml.rels', '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="x" Target="worksheets/sheet1.xml"/></Relationships>');
        $zip->addFromString('xl/worksheets/sheet1.xml', $sheet);
        $zip->close();

        return $path;
    }

    public function test_reader_returns_first_sheet_rows(): void
    {
        $r = XlsxReader::firstSheet($this->xlsx());
        $this->assertSame('CODICI al 21_02_2026', $r['sheet']);
        $this->assertSame('Roma', $r['rows'][1]['G']);
        $this->assertSame('058091', $r['rows'][1]['E']);
    }

    public function test_imports_capitals_and_keeps_curated_city(): void
    {
        $curated = City::where('slug', 'roma')->first();
        $this->assertNull($curated->istat_code);

        $this->artisan('expa:import:istat-comuni', ['--file' => $this->xlsx()])->assertSuccessful();

        $curated->refresh();
        $this->assertSame(['058091', 'RM', true], [$curated->istat_code, $curated->province_code, (bool) $curated->is_province_capital]);
        $this->assertSame('روما', $curated->translation('ar')->name);          // curated ar name intact
        $this->assertSame('Rome', $curated->translation('en')->name);
        $this->assertSame(1, City::where('istat_code', '058091')->count());     // attached, not duplicated

        $reggio = City::where('istat_code', '035033')->firstOrFail();
        $this->assertSame('reggio-nell-emilia', $reggio->slug);
        $this->assertSame("Reggio nell'Emilia", $reggio->translation('it')->name);
        $this->assertNull($reggio->translation('ar'));                          // no fabricated translations
        $this->assertSame('CC BY 4.0', $reggio->source_license);
        $this->assertNotNull($reggio->source_verified_at);
        $this->assertNull(City::where('istat_code', '013999')->first());       // not a capoluogo: default scope

        $this->assertSame('12', Region::where('code', '12')->value('istat_code'));
        $this->assertSame(6, Region::whereNotNull('istat_code')->count()); // regions present in the fixture

        $run = DataImportRun::where('dataset', 'istat-comuni')->firstOrFail();
        $this->assertSame(['CC BY 4.0', 'partial', '2026-02-21'], [$run->license, $run->status, $run->source_published_at->toDateString()]);
        $this->assertStringStartsWith('https://www.istat.it/', $run->source_url);
        $this->assertSame(5, $run->rejected); // 4 invalid rows + 1 in-scope row of an unknown region
    }

    public function test_second_run_is_all_unchanged_with_no_duplicates(): void
    {
        $file = $this->xlsx();
        $this->artisan('expa:import:istat-comuni', ['--file' => $file])->assertSuccessful();
        $cities = City::count();
        $this->artisan('expa:import:istat-comuni', ['--file' => $file])->assertSuccessful();

        $this->assertSame($cities, City::count());
        $second = DataImportRun::latest('id')->first();
        $this->assertSame([0, 0, 0], [$second->added, $second->updated, $second->stale_marked]);
        $this->assertGreaterThan(0, $second->unchanged);
        $this->assertSame(0, \DB::table('city_translations')->selectRaw('city_id, locale, count(*) c')->groupBy('city_id', 'locale')->having('c', '>', 1)->count());
    }

    public function test_rejects_bad_rows_without_aborting(): void
    {
        $this->artisan('expa:import:istat-comuni', ['--file' => $this->xlsx()])->assertSuccessful();
        $run = DataImportRun::latest('id')->first();
        $reasons = collect($run->rejects)->pluck('reason')->all();
        $this->assertContains('invalid ISTAT municipality code', $reasons);
        $this->assertContains('missing or oversized Italian denomination', $reasons);
        $this->assertContains('invalid province sigla', $reasons);
        $this->assertContains('duplicate ISTAT code in source', $reasons);
        $this->assertNull(City::where('istat_code', '099001')->first());
    }

    public function test_unknown_region_rows_are_not_created(): void
    {
        $this->artisan('expa:import:istat-comuni', ['--file' => $this->xlsx()])->assertSuccessful();
        $this->assertDatabaseMissing('cities', ['istat_code' => '099001']);
    }

    public function test_all_scope_disambiguates_homonyms(): void
    {
        $this->artisan('expa:import:istat-comuni', ['--file' => $this->xlsx(), '--all' => true])->assertSuccessful();
        $this->assertNotNull(City::where('slug', 'livo-co')->first());
        $this->assertNotNull(City::where('slug', 'livo-tn')->first());
        $this->assertNull(City::where('slug', 'livo')->first());
        $this->assertSame('piccolo-comune', City::where('istat_code', '001999')->value('slug'));
        $this->assertFalse((bool) City::where('slug', 'piccolo-comune')->value('is_province_capital'));
    }

    public function test_dry_run_writes_nothing(): void
    {
        $before = [City::count(), \DB::table('city_translations')->count(), DataImportRun::count()];
        $this->artisan('expa:import:istat-comuni', ['--file' => $this->xlsx(), '--dry-run' => true])->assertSuccessful();
        $this->assertSame($before, [City::count(), \DB::table('city_translations')->count(), DataImportRun::count()]);
        $this->assertNull(Region::where('code', '12')->value('istat_code'));
        $this->assertNull(City::where('slug', 'roma')->value('istat_code'));
    }

    public function test_changed_value_is_updated_once(): void
    {
        $file = $this->xlsx();
        $this->artisan('expa:import:istat-comuni', ['--file' => $file])->assertSuccessful();
        City::where('istat_code', '035033')->update(['province_code' => 'XX']);
        $this->artisan('expa:import:istat-comuni', ['--file' => $file])->assertSuccessful();
        $this->assertSame('RE', City::where('istat_code', '035033')->value('province_code'));
        $this->assertSame(1, DataImportRun::latest('id')->first()->updated);
    }

    public function test_download_goes_through_official_url_and_header_drift_fails(): void
    {
        Http::fake(['https://www.istat.it/*' => Http::response(file_get_contents($this->xlsx()), 200)]);
        $this->artisan('expa:import:istat-comuni')->assertSuccessful();
        Http::assertSent(fn ($req) => str_starts_with((string) $req->url(), 'https://www.istat.it/storage/codici-unita-amministrative/'));
        $this->assertSame('2026-02-21', DataImportRun::latest('id')->first()->source_published_at->toDateString());

        $bad = $this->xlsx(['A' => 'Something else'] + self::HEADER);
        $this->artisan('expa:import:istat-comuni', ['--file' => $bad])->assertFailed();
    }
}
