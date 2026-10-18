<?php

namespace Tests\Feature\DataImport;

use App\Domains\Government\Models\GovernmentOffice;
use App\Domains\Government\Models\GovernmentService;
use App\Domains\GovernmentImport\Services\IpaOfficesImporter;
use Database\Seeders\GeographySeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

/** Uses FIXTURE-* files only: no record in tests/Fixtures/imports/ipa is real data and none is ever seeded. */
class IpaOfficesImportTest extends TestCase
{
    use RefreshDatabase;

    private const DIR = 'tests/Fixtures/imports/ipa/';

    protected function setUp(): void
    {
        parent::setUp();
        Storage::fake('local');
        $this->seed(GeographySeeder::class);
    }

    private function args(array $extra = []): array
    {
        return $extra + [
            '--enti-file' => base_path(self::DIR.'FIXTURE-enti.csv'),
            '--file' => base_path(self::DIR.'FIXTURE-uo.csv'),
            '--istat-file' => base_path(self::DIR.'FIXTURE-istat.csv'),
        ];
    }

    private function run_(array $extra = []): void
    {
        $this->artisan('expa:import:ipa-offices', $this->args($extra))->assertSuccessful();
    }

    public function test_imports_only_useful_categories_and_maps_fields(): void
    {
        $this->run_();

        // asl: 2 L7 + 1 ASST; excluded: liquidation, hospital (L8 not ASST), no address/municipality. questure: 2. prefetture: 1.
        $this->assertEqualsCanonicalizing(['asl' => 3, 'questura' => 2, 'prefettura' => 1], GovernmentOffice::query()->selectRaw('office_type, count(*) c')->groupBy('office_type')->pluck('c', 'office_type')->all());

        $asl = GovernmentOffice::where('source_id', 'fx_asl1')->firstOrFail();
        $this->assertSame('published', $asl->status->value); // testing env => published
        $this->assertSame('asl1@pec.example.it', $asl->email);      // PEC only, never the "Altro" (personal) mailbox
        $this->assertSame('https://www.asl-uno.example.it', $asl->official_url); // bare host => https
        $this->assertSame('Via Fittizia 1', $asl->address);
        $this->assertSame('00100', $asl->postal_code);
        $this->assertSame('12', $asl->region->code);
        $this->assertSame('CC-BY-4.0', $asl->source_license);
        $this->assertSame('official', $asl->source_type->value);
        $this->assertSame('unknown', $asl->booking_method->value);
        $this->assertNull($asl->booking_url);
        $this->assertSame(['it'], $asl->translatedLocales());
        $this->assertSame('FIXTURE Azienda Sanitaria Locale Uno', $asl->translation('it')->name);
    }

    public function test_city_is_attached_only_when_a_matching_city_exists(): void
    {
        DB::table('cities')->where('slug', 'roma')->update(['istat_code' => '058091']);
        $this->run_();
        $this->assertNotNull(GovernmentOffice::where('source_id', 'fx_asl1')->value('city_id'));
        $this->assertNull(GovernmentOffice::where('source_id', 'fx_asl2')->value('city_id'));  // Turin not given an ISTAT code here
        $this->assertNotNull(GovernmentOffice::where('source_id', 'fx_asl2')->value('region_id')); // region still resolved from ISTAT
    }

    public function test_non_https_urls_are_normalised_and_personal_data_is_never_stored(): void
    {
        $this->run_();
        $this->assertSame('https://www.asl-due.example.it/', GovernmentOffice::where('source_id', 'fx_asl2')->value('official_url'));
        $this->assertNull(GovernmentOffice::where('source_id', 'fx_asl2')->value('email')); // only an "Altro" mailbox
        $dump = json_encode(DB::table('government_offices')->get()).json_encode(DB::table('government_office_translations')->get());
        foreach (['PERSONA', 'FITTIZIA', 'persona.fittizia', 'NOME', 'COGNOME', '3331112222', 'personale.nome'] as $needle) {
            $this->assertStringNotContainsString($needle, $dump);
        }
    }

    public function test_questura_and_prefettura_selection_and_phone(): void
    {
        $this->run_();
        $q = GovernmentOffice::where('source_id', 'QQ0001')->firstOrFail();
        $this->assertSame('questura', $q->office_type->value);
        $this->assertSame('061234567', $q->phone);
        $this->assertSame('https://www.poliziadistato.example.it', $q->official_url); // falls back to the entity's website
        $this->assertSame('https://questure.example.it/milano', GovernmentOffice::where('source_id', 'QQ0002')->value('official_url'));
        $this->assertSame('027654321', GovernmentOffice::where('source_id', 'QQ0002')->value('phone'));
        $this->assertNull(GovernmentOffice::where('source_id', 'QQ0003')->first()); // accounting unit is not an office for foreigners
        $this->assertNull(GovernmentOffice::where('source_id', 'QQ0004')->first());
        $this->assertSame('prefettura', GovernmentOffice::where('source_id', 'PP0001')->value('office_type')->value ?? null);
        $this->assertNull(GovernmentOffice::where('source_id', 'PP0002')->first());
    }

    public function test_rejects_are_counted_and_do_not_abort_the_run(): void
    {
        $this->run_();
        $run = DB::table('data_import_runs')->where('dataset', 'ipa-offices')->latest('id')->first();
        $this->assertSame('partial', $run->status);
        // duplicate source id QQ0002 + no address/municipality (fx_dup and QQ0005)
        $this->assertSame(3, (int) $run->rejected);
        $this->assertSame('CC-BY-4.0', $run->license);
        $this->assertStringContainsString('CC BY 4.0', $run->attribution);
    }

    public function test_second_run_is_idempotent(): void
    {
        $this->run_();
        $count = GovernmentOffice::count();
        $this->run_();
        $this->assertSame($count, GovernmentOffice::count());
        $this->assertSame(6, DB::table('government_office_translations')->count());
        $run = DB::table('data_import_runs')->where('dataset', 'ipa-offices')->latest('id')->first();
        $this->assertSame([0, 0, $count], [(int) $run->added, (int) $run->updated, (int) $run->unchanged]);
    }

    public function test_dry_run_writes_nothing(): void
    {
        $this->run_(['--dry-run' => true]);
        $this->assertSame(0, GovernmentOffice::count());
        $this->assertSame(0, DB::table('data_import_runs')->where('dataset', 'ipa-offices')->count());
    }

    public function test_changed_values_update_and_vanished_records_are_archived_not_deleted(): void
    {
        $this->run_();
        $changed = Storage::disk('local')->path('enti2.csv');
        file_put_contents($changed, str_replace('Via Fittizia 1,', 'Via Cambiata 99,', file_get_contents(base_path(self::DIR.'FIXTURE-enti.csv'))));
        $this->run_(['--enti-file' => $changed]);
        $this->assertSame('Via Cambiata 99', GovernmentOffice::where('source_id', 'fx_asl1')->value('address'));
        $run = DB::table('data_import_runs')->where('dataset', 'ipa-offices')->latest('id')->first();
        $this->assertSame(1, (int) $run->updated);

        // fx_asl2 disappears from the source => archived (1 of 6 is below the safety ratio)
        $lines = array_filter(file(base_path(self::DIR.'FIXTURE-enti.csv')), fn ($l) => ! str_contains($l, ',fx_asl2,'));
        $gone = Storage::disk('local')->path('enti3.csv');
        file_put_contents($gone, implode('', $lines));
        $this->run_(['--enti-file' => $gone]);
        $this->assertSame('archived', GovernmentOffice::where('source_id', 'fx_asl2')->firstOrFail()->status->value);
        $this->assertNotNull(GovernmentOffice::where('source_id', 'fx_asl2')->first()); // never hard-deleted
    }

    public function test_incomplete_source_does_not_archive_everything(): void
    {
        $this->run_();
        $header = explode("\n", file_get_contents(base_path(self::DIR.'FIXTURE-enti.csv')))[0]."\n";
        $tiny = Storage::disk('local')->path('enti4.csv');
        file_put_contents($tiny, $header);
        $this->artisan('expa:import:ipa-offices', $this->args(['--enti-file' => $tiny, '--category' => 'asl']))->assertSuccessful();
        $this->assertSame(3, GovernmentOffice::where('office_type', 'asl')->where('status', 'published')->count());
    }

    public function test_staging_and_production_go_to_review(): void
    {
        foreach (['staging', 'production'] as $env) {
            DB::table('government_offices')->delete();
            app()->detectEnvironment(fn () => $env);
            $this->run_();
            $this->assertSame('review', GovernmentOffice::where('source_id', 'fx_asl1')->first()->status->value, $env);
            $this->assertNull(GovernmentOffice::where('source_id', 'fx_asl1')->value('published_at'));
        }
    }

    public function test_comuni_are_opt_in(): void
    {
        $this->run_();
        $this->assertSame(0, GovernmentOffice::where('office_type', 'anagrafe')->count());
        $this->run_(['--category' => 'comuni']);
        $this->assertSame(1, GovernmentOffice::where('office_type', 'anagrafe')->count()); // Anagrafe unit only, not "Ufficio Tributi"
        $this->assertSame('CC0001', GovernmentOffice::where('office_type', 'anagrafe')->value('source_id'));
    }

    public function test_unknown_category_fails(): void
    {
        $this->artisan('expa:import:ipa-offices', $this->args(['--category' => 'nonsense']))->assertFailed();
    }

    public function test_download_path_uses_the_official_dump_urls(): void
    {
        Http::fake([
            'https://indicepa.gov.it/ipa-dati/datastore/dump/d09adf99-dc10-4349-8c53-27b1e5aa97b6*' => Http::response(file_get_contents(base_path(self::DIR.'FIXTURE-enti.csv')), 200),
            'https://indicepa.gov.it/ipa-dati/api/3/action/package_show*' => Http::response(['result' => ['metadata_modified' => '2026-10-10T03:22:52']], 200),
            'https://www.istat.it/*' => Http::response(file_get_contents(base_path(self::DIR.'FIXTURE-istat.csv')), 200),
        ]);
        $this->artisan('expa:import:ipa-offices', ['--category' => 'asl'])->assertSuccessful();
        $this->assertSame(3, GovernmentOffice::count());
        $run = DB::table('data_import_runs')->where('dataset', 'ipa-offices')->first();
        $this->assertSame('2026-10-10', $run->source_edition);
        $this->assertNotNull($run->checksum_sha256);
        Http::assertSent(fn ($r) => str_starts_with((string) $r->url(), IpaOfficesImporter::ENTI_URL) || ! str_contains((string) $r->url(), 'uo'));
    }

    public function test_verified_service_office_link_is_created_only_when_both_exist(): void
    {
        $service = GovernmentService::factory()->create(['slug' => 'permesso-di-soggiorno-roma']);
        $this->run_(); // fixture has no YN7RCT => link skipped, no error
        $this->assertSame(0, DB::table('government_service_office')->count());

        $uo = Storage::disk('local')->path('uo2.csv');
        file_put_contents($uo, file_get_contents(base_path(self::DIR.'FIXTURE-uo.csv'))."11,XZR4RNHR,FIXTURE Polizia di Stato,07,YN7RCT,,,Questura di Fixtureroma - Ufficio Immigrazione,2020-01-01,,,,,058091,H501,00155,Via Fittizia Roma,,,r@pecps.example.it,Pec,,,,,2026-01-01,\n");
        $this->run_(['--file' => $uo]);
        $this->run_(['--file' => $uo]); // idempotent
        $this->assertSame([GovernmentOffice::where('source_id', 'YN7RCT')->value('id')], $service->offices()->pluck('government_offices.id')->all());
    }
}
