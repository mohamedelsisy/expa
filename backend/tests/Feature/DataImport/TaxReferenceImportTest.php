<?php

namespace Tests\Feature\DataImport;

use App\Domains\Billing\Models\TaxRate;
use App\Domains\Content\Services\PublishGuard;
use App\Domains\DataImport\Models\DataImportRun;
use App\Domains\Money\Models\TaxTable;
use App\Domains\Money\Services\NetSalaryEstimator;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class TaxReferenceImportTest extends TestCase
{
    use RefreshDatabase;

    private array $tmp = [];

    protected function tearDown(): void
    {
        foreach ($this->tmp as $f) {
            @unlink($f);
        }
        parent::tearDown();
    }

    private function definition(?callable $mutate = null): string
    {
        $def = require database_path('data/tax_reference.php');
        $mutate && ($def = $mutate($def));
        $path = tempnam(sys_get_temp_dir(), 'taxdef').'.php';
        file_put_contents($path, '<?php return '.var_export($def, true).';');

        return $this->tmp[] = $path;
    }

    public function test_import_creates_published_sourced_tables_and_vat_rate_and_is_idempotent(): void
    {
        $this->artisan('expa:import:tax-reference')->assertSuccessful();

        $this->assertSame(2, TaxTable::count());
        $t = TaxTable::where('source_id', 'it-irpef-2026')->first();
        $this->assertSame('published', $t->status->value);
        $this->assertSame('official', $t->source_type->value);
        $this->assertNotNull($t->last_verified_at);
        $this->assertSame([], app(PublishGuard::class)->problems($t));
        $this->assertSame(22.0, (float) TaxRate::where('country', 'IT')->where('label', 'VAT')->value('rate'));
        $this->assertNotNull(TaxRate::first()->verified_at);

        $this->artisan('expa:import:tax-reference')->assertSuccessful();
        $this->assertSame(2, TaxTable::count());
        $this->assertSame(1, TaxRate::count());
        $second = DataImportRun::where('dataset', 'tax-reference')->latest('id')->first();
        $this->assertSame([3, 0, 0, 3], [$second->records_read, $second->added, $second->updated, $second->unchanged]);
    }

    public function test_dry_run_writes_nothing(): void
    {
        $this->artisan('expa:import:tax-reference --dry-run')->assertSuccessful();
        $this->assertSame(0, TaxTable::count());
        $this->assertSame(0, TaxRate::count());
    }

    public function test_changed_figure_is_updated_not_duplicated(): void
    {
        $this->artisan('expa:import:tax-reference')->assertSuccessful();
        $file = $this->definition(function ($d) {
            $d['tables'][0]['contribution_ceiling'] = 123000;

            return $d;
        });
        $this->artisan('expa:import:tax-reference', ['--file' => $file])->assertSuccessful();
        $this->assertSame(2, TaxTable::count());
        $this->assertSame(123000.0, (float) TaxTable::where('source_id', 'it-irpef-2026')->value('contribution_ceiling'));
        $run = DataImportRun::where('dataset', 'tax-reference')->latest('id')->first();
        $this->assertSame([1, 2], [$run->updated, $run->unchanged]); // 3 records read: one table updated, the other table and the VAT rate unchanged
    }

    public function test_invalid_definitions_write_nothing(): void
    {
        $cases = [
            'non-official host' => fn ($d) => tap($d, fn (&$d) => $d['tables'][0]['sources']['brackets']['url'] = 'https://blog.example.com/irpef'),
            'gap in brackets (not ascending)' => fn ($d) => tap($d, fn (&$d) => $d['tables'][0]['brackets'] = [['up_to' => 50000, 'rate' => 23], ['up_to' => 28000, 'rate' => 33], ['up_to' => null, 'rate' => 43]]),
            'rate above 100' => fn ($d) => tap($d, fn (&$d) => $d['tables'][0]['brackets'][1]['rate'] = 133),
            'last bracket closed' => fn ($d) => tap($d, fn (&$d) => $d['tables'][0]['brackets'][2]['up_to'] = 90000),
            'missing quote' => fn ($d) => tap($d, fn (&$d) => $d['tables'][0]['sources']['contribution_rate']['quotes'] = []),
            'http url' => fn ($d) => tap($d, fn (&$d) => $d['rates'][0]['source_url'] = 'http://www.agenziaentrate.gov.it/x'),
            'contribution rate over 100' => fn ($d) => tap($d, fn (&$d) => $d['tables'][1]['contribution_rate'] = 919),
        ];
        foreach ($cases as $name => $mutate) {
            $file = $this->definition(function ($d) use ($mutate) {
                $d = $mutate($d);

                return $d;
            });
            $this->artisan('expa:import:tax-reference', ['--file' => $file])->assertFailed();
            $this->assertSame(0, TaxTable::count(), $name);
            $this->assertSame(0, TaxRate::count(), $name);
        }
    }

    public function test_outside_local_testing_content_enters_review(): void
    {
        $this->app['env'] = 'staging';
        $this->artisan('expa:import:tax-reference')->assertSuccessful();
        $this->assertSame(['review'], TaxTable::pluck('status')->map->value->unique()->values()->all());
        $this->assertNull(TaxTable::currentFor());
    }

    public function test_verify_sources_checks_the_quotes_against_the_official_pages(): void
    {
        $page = '<html><body><p>Dall’anno 2024 l’imposta lorda si calcola applicando le seguenti aliquote</p><td>fino a euro 28.000</td> <td>23%</td></body></html>';
        $file = $this->definition(function ($d) {
            // keep only a quote the fake page contains, and one it does not
            $t = $d['tables'][1];
            $t['sources']['brackets']['quotes'] = ['Dall’anno 2024 l’imposta lorda si calcola applicando le seguenti aliquote', 'fino a euro 28.000 23%'];
            $t['sources']['contribution_rate']['verify'] = false;
            $t['sources']['contribution_ceiling']['verify'] = false;
            $d['tables'] = [$t];
            $d['rates'] = [];

            return $d;
        });
        Http::fake(['*' => Http::sequence()->push($page)->push('<html><body>pagina cambiata: 20%</body></html>')]);
        $this->artisan('expa:import:tax-reference', ['--file' => $file, '--verify-sources' => true, '--dry-run' => true])->assertSuccessful();

        $this->artisan('expa:import:tax-reference', ['--file' => $file, '--verify-sources' => true])->assertFailed();
        $this->assertSame(0, TaxTable::count());
    }

    /**
     * CALCULATION CHECK against the OFFICIAL figures (Agenzia delle Entrate page "Aliquote e calcolo dell'Irpef", read 2026-10-11):
     * - 2026: "per i redditi imponibili superiori a 50.000 euro, l'imposta dovuta è pari a 13.700 euro (non più 14.140) + il 43% sul reddito eccedente";
     * - 2024/25 table: "6.440 euro + 35% ..." and "14.140 euro + 43% sul reddito che supera i 50.000 euro".
     * INPS employee share 9,19% (circ. 23/2007). Hand calculation for gross 60.000 (2026):
     *   contributions 60.000 x 9,19% = 5.514,00 ; taxable 54.486,00
     *   tax = 28.000 x 23% (6.440,00) + 22.000 x 33% (7.260,00) + 4.486 x 43% (1.928,98) = 15.628,98
     *   which equals the official "13.700 + 43% of the excess over 50.000" = 13.700 + 1.928,98.
     *   net = 60.000 - 5.514,00 - 15.628,98 = 38.857,02
     */
    public function test_net_salary_matches_the_hand_calculation_from_the_official_brackets(): void
    {
        $this->artisan('expa:import:tax-reference')->assertSuccessful();
        $est = app(NetSalaryEstimator::class);

        $r = $est->estimate(TaxTable::where('tax_year', 2026)->first(), 60000.0);
        $this->assertSame(5514.00, $r['contributions']);
        $this->assertSame(54486.00, $r['taxable_income']);
        $this->assertSame(15628.98, $r['income_tax']);
        $this->assertSame(38857.02, $r['net_annual']);
        $this->assertSame(round(13700 + 4486 * 0.43, 2), $r['income_tax']);

        // Official intermediate amounts: tax on exactly 50.000 of taxable income (no contributions) = 13.700 (2026) / 14.140 (2025).
        foreach ([2026 => 13700.0, 2025 => 14140.0] as $year => $official) {
            $t = TaxTable::where('tax_year', $year)->first();
            $t->contribution_rate = 0;
            $this->assertSame($official, $est->estimate($t, 50000.0)['income_tax'], "IRPEF $year on 50.000");
        }
        // Official: 6.440 euro = 23% of 28.000.
        $t = TaxTable::where('tax_year', 2025)->first();
        $t->contribution_rate = 0;
        $this->assertSame(6440.0, $est->estimate($t, 28000.0)['income_tax']);
    }

    public function test_net_salary_endpoint_answers_available_with_source_and_disclaimer(): void
    {
        $this->artisan('expa:import:tax-reference')->assertSuccessful();
        $this->postJson('/api/v1/money/net-salary', ['gross_annual' => 30000], ['Accept-Language' => 'en'])->assertOk()
            ->assertJsonPath('data.available', true)->assertJsonPath('data.tax_year', 2026)
            ->assertJsonPath('data.estimate.net_annual', 20977.11)
            ->assertJsonPath('data.table.source.type', 'official')
            ->assertJsonPath('data.table.source.url', 'https://www.agenziaentrate.gov.it/portale/imposta-sul-reddito-delle-persone-fisiche-irpef-/aliquote-e-calcolo-dell-irpef')
            ->assertJsonStructure(['data' => ['disclaimer']]);
    }
}
