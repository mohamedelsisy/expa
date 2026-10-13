<?php

namespace Tests\Feature\DataImport;

use App\Domains\DataImport\Models\DataImportRun;
use App\Domains\Geo\Models\Region;
use App\Domains\Study\Models\StudyProgram;
use App\Domains\Study\Models\University;
use App\Enums\ContentStatus;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

/** Uses tests/Fixtures/imports/study/* : tiny real-format snippets of the MUR "Atenei" and "Offerta formativa" CSVs (tests only). */
class StudyImportTest extends TestCase
{
    use RefreshDatabase;

    private string $atenei = __DIR__.'/../../Fixtures/imports/study/atenei.csv';

    private string $offer = __DIR__.'/../../Fixtures/imports/study/offerta.csv';

    protected function setUp(): void
    {
        parent::setUp();
        Storage::fake('local');
        Region::create(['code' => '01', 'slug' => 'piemonte']);
    }

    private function importNow(array $extra = []): int
    {
        return $this->artisan('expa:import:study', ['--file' => $this->offer, '--atenei-file' => $this->atenei] + $extra)->run();
    }

    public function test_imports_latest_year_with_mapping_and_provenance(): void
    {
        $this->assertSame(0, $this->importNow());

        $this->assertSame(4, University::count());
        $this->assertSame(5, StudyProgram::count()); // 6 rows of 2025, one with an unsupported language ("Altro"); the 2024 row is ignored

        $torino = University::where('source_id', 'mur-ateneo:00101')->firstOrFail();
        $this->assertSame('public', $torino->kind);
        $this->assertSame(Region::where('code', '01')->value('id'), $torino->region_id);
        $this->assertSame('Università degli studi di Torino', $torino->localized('name'));
        $this->assertNull($torino->website);
        $this->assertSame('published', $torino->status->value); // local/testing
        $this->assertSame('IODL-2.0', $torino->source_license);
        $this->assertSame('official', $torino->source_type->value);
        $this->assertStringStartsWith('https://dati-ustat.mur.gov.it/', $torino->source_url);

        $en = StudyProgram::whereHas('translations', fn ($q) => $q->where('title', 'Georesources and Geoenergy Engineering'))->firstOrFail();
        $this->assertSame(['master', 'architecture', 'en'], [$en->degree_level->value, $en->field->value, $en->instruction_language]);
        $this->assertNull($en->tuition_min_year);
        $this->assertNull($en->duration_years);
        $this->assertNull($en->program_url);
        $this->assertNull($en->application_deadline);

        $both = StudyProgram::whereHas('translations', fn ($q) => $q->where('title', 'Design sistemico'))->firstOrFail();
        $this->assertSame('both', $both->instruction_language);
        $unico = StudyProgram::whereHas('translations', fn ($q) => $q->where('title', 'GIURISPRUDENZA'))->firstOrFail();
        $this->assertSame(['master', 'law'], [$unico->degree_level->value, $unico->field->value]);

        $run = DataImportRun::latest('id')->first();
        $this->assertSame([10, 9, 1, 'partial'], [$run->records_read, $run->added, $run->rejected, $run->status]);
        $this->assertSame('IODL-2.0', $run->license);
    }

    public function test_second_run_is_idempotent_and_slugs_are_stable(): void
    {
        $this->importNow();
        $slugs = StudyProgram::orderBy('id')->pluck('slug')->all();
        $this->importNow();

        $run = DataImportRun::latest('id')->first();
        $this->assertSame([0, 0, 9], [$run->added, $run->updated, $run->unchanged]);
        $this->assertSame(5, StudyProgram::count());
        $this->assertSame($slugs, StudyProgram::orderBy('id')->pluck('slug')->all());
        $this->assertSame(count($slugs), count(array_unique($slugs)));
    }

    public function test_dry_run_writes_no_content(): void
    {
        $this->artisan('expa:import:study', ['--file' => $this->offer, '--atenei-file' => $this->atenei, '--dry-run' => true])
            ->expectsOutputToContain('partial (dry-run)')
            ->assertSuccessful();

        $this->assertSame(0, University::count());
        $this->assertSame(0, StudyProgram::count());
        $this->assertSame(0, DataImportRun::count(), 'a dry run leaves no run row');
    }

    public function test_changed_value_is_updated_and_vanished_courses_are_archived_not_deleted(): void
    {
        $this->importNow();
        $p = StudyProgram::where('source_id', 'like', 'mur-corso:%')->firstOrFail();
        $p->setTranslations(['it' => ['summary' => 'edited upstream']]);

        $this->importNow();
        $this->assertSame(1, DataImportRun::latest('id')->first()->updated);

        // a newer offering that no longer contains the Politecnico courses
        $path = sys_get_temp_dir().'/study-offer-'.uniqid().'.csv';
        $lines = array_filter(file($this->offer), fn ($l) => ! str_contains($l, 'Politecnico'));
        file_put_contents($path, implode('', $lines));
        $this->artisan('expa:import:study', ['--file' => $path, '--atenei-file' => $this->atenei])->assertSuccessful();
        @unlink($path);

        $this->assertSame(5, StudyProgram::count()); // nothing deleted
        $this->assertSame(2, StudyProgram::where('status', ContentStatus::Archived->value)->count());
        $this->assertSame(1, University::where('status', ContentStatus::Archived->value)->count());
        $this->assertSame(3, DataImportRun::latest('id')->first()->stale_marked);
    }

    public function test_staging_imports_enter_review_not_published(): void
    {
        $this->app['env'] = 'staging';
        $this->importNow();

        $this->assertSame(0, University::published()->count());
        $this->assertSame(4, University::where('status', 'review')->count());
        $this->assertSame(5, StudyProgram::where('status', 'review')->count());
    }

    public function test_download_path_uses_the_official_urls(): void
    {
        Http::fake([
            'https://dati-ustat.mur.gov.it/*01_atenei.csv' => Http::response(file_get_contents($this->atenei), 200),
            'https://dati-ustat.mur.gov.it/*03_offertaformativa*' => Http::response(file_get_contents($this->offer), 200),
        ]);

        $this->artisan('expa:import:study')->assertSuccessful();
        $this->assertSame(5, StudyProgram::count());
        Http::assertSentCount(2);
    }

    public function test_api_lists_filters_and_falls_back_to_italian(): void
    {
        $this->importNow();

        $this->getJson('/api/v1/study/programs?degree=master&language=en', ['Accept-Language' => 'ar'])->assertOk()
            ->assertJsonPath('meta.total', 2)->assertJsonPath('data.0.fallback', true)->assertJsonPath('data.0.locale', 'it');
        $this->getJson('/api/v1/study/programs?field=law')->assertOk()->assertJsonPath('meta.total', 1);
        $this->getJson('/api/v1/study/universities?q=politecnico', ['Accept-Language' => 'en'])->assertOk()->assertJsonPath('meta.total', 1);
        $slug = University::where('source_id', 'mur-ateneo:00101')->value('slug');
        $this->getJson("/api/v1/study/universities/$slug", ['Accept-Language' => 'ar'])->assertOk()->assertJsonCount(2, 'data.programs');
    }

    public function test_finder_is_not_truncated_by_catalogue_size(): void
    {
        $this->importNow();
        $res = $this->getJson('/api/v1/study/finder?field=architecture&degree=master&language=en')->assertOk();
        $this->assertSame(1, $res->json('meta.total'));
    }
}
