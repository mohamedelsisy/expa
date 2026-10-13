<?php

namespace Tests\Feature\DataImport;

use App\Domains\Audit\Models\AuditLog;
use App\Domains\Content\Services\PublishGuard;
use App\Domains\DataImport\Models\DataImportRun;
use App\Domains\Patente\Models\PatenteCategory;
use App\Domains\Patente\Models\PatenteQuestion;
use App\Support\Audit\AuditMute;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class PatenteCategoriesImportTest extends TestCase
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
        $def = require database_path('data/patente_categories.php');
        $mutate && ($def = $mutate($def));
        $path = tempnam(sys_get_temp_dir(), 'patdef').'.php';
        file_put_contents($path, '<?php return '.var_export($def, true).';');

        return $this->tmp[] = $path;
    }

    public function test_import_creates_published_sourced_categories_in_three_languages_and_is_idempotent(): void
    {
        $this->artisan('expa:import:patente-categories')->assertSuccessful();

        $this->assertSame(['AM', 'A1', 'A2', 'A', 'B1', 'B', 'BE', 'C1', 'C1E', 'C', 'CE', 'D1', 'D1E', 'D', 'DE'],
            PatenteCategory::orderBy('sort_order')->get()->map(fn ($c) => $c->translation('it')->title)->map(fn ($t) => str_replace('Patente categoria ', '', $t))->all());
        $b = PatenteCategory::where('slug', 'b')->first();
        $this->assertSame('published', $b->status->value);
        $this->assertSame('official', $b->source_type->value);
        $this->assertSame('it-patente-b', $b->source_id);
        $this->assertSame([], app(PublishGuard::class)->problems($b), 'must satisfy the publish guard (official host, ar title+summary)');
        $this->assertStringContainsString('18', $b->translation('it')->summary);
        $this->assertSame(0, PatenteQuestion::count(), 'exam questions are never imported');

        $this->artisan('expa:import:patente-categories')->assertSuccessful();
        $this->assertSame(15, PatenteCategory::count());
        $run = DataImportRun::where('dataset', 'patente-categories')->latest('id')->first();
        $this->assertSame([15, 0, 0, 15], [$run->records_read, $run->added, $run->updated, $run->unchanged]);
    }

    public function test_dry_run_writes_nothing(): void
    {
        $this->artisan('expa:import:patente-categories --dry-run')->assertSuccessful();
        $this->assertSame(0, PatenteCategory::count());
        $this->assertSame(0, DataImportRun::count(), 'a dry run leaves no run row');
        $this->assertSame(0, AuditLog::where('action', 'data.import')->count());
        $this->assertFalse(AuditMute::isMuted());
    }

    public function test_changed_text_updates_the_same_record(): void
    {
        $this->artisan('expa:import:patente-categories')->assertSuccessful();
        $file = $this->definition(function ($d) {
            $d['categories'][5]['vehicles']['it'] = 'Autoveicoli (testo modificato).';

            return $d;
        });
        $this->artisan('expa:import:patente-categories', ['--file' => $file])->assertSuccessful();
        $this->assertSame(15, PatenteCategory::count());
        $this->assertStringContainsString('testo modificato', PatenteCategory::where('slug', 'b')->first()->translation('it')->summary);
        $run = DataImportRun::where('dataset', 'patente-categories')->latest('id')->first();
        $this->assertSame([1, 14], [$run->updated, $run->unchanged]);
    }

    public function test_invalid_definitions_write_nothing(): void
    {
        $cases = [
            'non-official host' => fn ($d) => array_replace($d, ['source_url' => 'https://autoscuola.example.com/categorie']),
            'http url' => fn ($d) => array_replace($d, ['source_url' => 'http://www.ilportaledellautomobilista.it/SDG/C2IT.html']),
            'implausible age' => fn ($d) => tap($d, fn (&$d) => $d['categories'][0]['min_age'] = 5),
            'missing quote' => fn ($d) => tap($d, fn (&$d) => $d['categories'][1]['quote'] = ''),
            'missing italian paraphrase' => fn ($d) => tap($d, fn (&$d) => $d['categories'][2]['vehicles'] = ['en' => 'x']),
            'duplicate code' => fn ($d) => tap($d, fn (&$d) => $d['categories'][3]['code'] = 'AM'),
            'age not in text' => fn ($d) => tap($d, fn (&$d) => $d['categories'][4]['min_age'] = 17),
        ];
        foreach ($cases as $name => $mutate) {
            $this->artisan('expa:import:patente-categories', ['--file' => $this->definition($mutate)])->assertFailed();
            $this->assertSame(0, PatenteCategory::count(), $name);
        }
    }

    public function test_outside_local_testing_categories_enter_review(): void
    {
        $this->app['env'] = 'production';
        $this->artisan('expa:import:patente-categories')->assertSuccessful();
        $this->assertSame(['review'], PatenteCategory::pluck('status')->map->value->unique()->values()->all());
        $this->getJson('/api/v1/patente/categories')->assertOk()->assertJsonCount(0, 'data');
    }

    public function test_verify_source_rechecks_quotes_on_the_official_page(): void
    {
        $page = '<html><body><p>L\'età minima per la categoria AM è fissata a 14 anni; di categoria A1 ... L’età minima per la categoria A1 è fissata a 16 anni</p></body></html>';
        $file = $this->definition(function ($d) {
            $d['categories'] = [$d['categories'][0], $d['categories'][1]];

            return $d;
        });
        config(['dataimport.allowed_hosts' => ['ilportaledellautomobilista.it']]); // not yet on the default allow-list
        Http::fake(['*' => Http::sequence()->push($page)->push('<html><body>pagina cambiata</body></html>')]);
        $this->artisan('expa:import:patente-categories', ['--file' => $file, '--verify-source' => true, '--dry-run' => true])->assertSuccessful();
        $this->artisan('expa:import:patente-categories', ['--file' => $file, '--verify-source' => true])->assertFailed();
        $this->assertSame(0, PatenteCategory::count());
    }

    public function test_public_api_lists_imported_categories_in_each_locale(): void
    {
        $this->artisan('expa:import:patente-categories')->assertSuccessful();
        $r = $this->getJson('/api/v1/patente/categories', ['Accept-Language' => 'ar'])->assertOk()->assertJsonCount(15, 'data');
        $this->assertSame('رخصة القيادة – الفئة AM', $r->json('data.0.title'));
        $this->getJson('/api/v1/patente/categories/be', ['Accept-Language' => 'en'])->assertOk()
            ->assertJsonPath('data.title', 'Driving licence – category BE')->assertJsonPath('data.source.type', 'official');
    }
}
