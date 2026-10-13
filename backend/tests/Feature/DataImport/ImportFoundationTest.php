<?php

namespace Tests\Feature\DataImport;

use App\Domains\Audit\Models\AuditLog;
use App\Domains\DataImport\Support\ImportRun;
use App\Domains\DataImport\Support\Lifecycle;
use App\Domains\DataImport\Support\ReindexAfterImport;
use App\Domains\DataImport\Support\SourceFetcher;
use App\Domains\Government\Models\GovernmentOffice;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;
use InvalidArgumentException;
use Tests\TestCase;

class ImportFoundationTest extends TestCase
{
    use RefreshDatabase;

    public function test_provenance_columns_exist(): void
    {
        foreach (['universities', 'study_programs', 'scholarships', 'government_offices', 'appointment_guides', 'tax_tables', 'patente_categories'] as $t) {
            $this->assertTrue(Schema::hasColumns($t, ['source_id', 'source_license']), $t);
        }
        $this->assertTrue(Schema::hasColumns('cities', ['istat_code', 'province_code', 'is_province_capital']));
        $this->assertTrue(Schema::hasColumn('regions', 'istat_code'));
    }

    public function test_run_tracker_counts_and_caps_rejects(): void
    {
        config(['dataimport.max_logged_rejects' => 2]);
        $run = ImportRun::start(['dataset' => 'demo', 'source_name' => 'Fixture', 'source_url' => 'https://www.istat.it/x', 'license' => 'CC BY 4.0']);
        $run->read();
        $run->added();
        $run->updated();
        $run->unchanged();
        foreach (range(1, 5) as $i) {
            $run->reject("bad $i", ['code' => $i]);
        }
        $row = $run->finish();

        $this->assertSame([1, 1, 1, 1, 5, 'partial'], [$row->records_read, $row->added, $row->updated, $row->unchanged, $row->rejected, $row->status]);
        $this->assertCount(2, $row->rejects); // sample is capped; the counter is exact
    }

    public function test_clean_run_is_succeeded_and_error_is_failed(): void
    {
        $this->assertSame('succeeded', ImportRun::start(['dataset' => 'a', 'source_name' => 's', 'source_url' => 'https://www.istat.it/'])->finish()->status);
        $failed = ImportRun::start(['dataset' => 'b', 'source_name' => 's', 'source_url' => 'https://www.istat.it/'])->finish('boom');
        $this->assertSame(['failed', 'boom'], [$failed->status, $failed->error]);
    }

    public function test_fetcher_refuses_http_credentials_and_unlisted_hosts(): void
    {
        $f = new SourceFetcher;
        foreach (['http://www.istat.it/a.csv', 'https://user:pw@www.istat.it/a.csv', 'https://evil.example.com/a.csv', 'https://istat.it.evil.com/a.csv'] as $url) {
            try {
                $f->assertAllowed($url);
                $this->fail("should refuse $url");
            } catch (InvalidArgumentException) {
                $this->addToAssertionCount(1);
            }
        }
        $f->assertAllowed('https://www.istat.it/a.csv');
        $f->assertAllowed('https://dati-ustat.mur.gov.it/x');
    }

    public function test_fetcher_stores_raw_file_with_checksum(): void
    {
        Storage::fake('local');
        Http::fake(['https://www.istat.it/*' => Http::response("a;b\n1;2\n", 200)]);
        $got = (new SourceFetcher)->fetch('https://www.istat.it/list.csv', 'demo', 'csv');

        $this->assertSame(hash('sha256', "a;b\n1;2\n"), $got->sha256);
        $this->assertSame(8, $got->bytes);
        $this->assertFileExists($got->path);
        Http::assertSent(fn ($r) => str_contains($r->header('User-Agent')[0], 'EXPA-data-import'));
    }

    public function test_fetcher_reports_non_success_status(): void
    {
        Storage::fake('local');
        Http::fake(['https://www.istat.it/missing' => Http::response('no', 404)]);
        $this->expectExceptionMessageMatches('/HTTP 404/');
        (new SourceFetcher)->fetch('https://www.istat.it/missing', 'demo');
    }

    public function test_oversize_download_is_rejected(): void
    {
        Storage::fake('local');
        config(['dataimport.max_bytes' => 10]);
        Http::fake(['https://www.istat.it/big' => Http::response(str_repeat('x', 50), 200)]);
        $this->expectExceptionMessage('larger than the allowed maximum');
        (new SourceFetcher)->fetch('https://www.istat.it/big', 'demo');
    }

    public function test_lifecycle_publishes_locally_and_uses_review_elsewhere(): void
    {
        $this->assertSame('published', Lifecycle::attributes()['status']);
        $this->app['env'] = 'production';
        $this->assertSame(['status' => 'review', 'published_at' => null], Lifecycle::attributes());
    }

    public function test_indexes_are_rebuilt_only_after_a_successful_real_import_where_content_is_published_directly(): void
    {
        $r = ReindexAfterImport::class;
        $this->assertTrue($r::shouldReindex('expa:import:study', false, 0));
        $this->assertFalse($r::shouldReindex('expa:import:study', true, 0), 'dry run');
        $this->assertFalse($r::shouldReindex('expa:import:study', false, 1), 'failed run');
        $this->assertFalse($r::shouldReindex('expa:search-reindex', false, 0), 'not an importer');
        $this->app['env'] = 'production';
        $this->assertFalse($r::shouldReindex('expa:import:study', false, 0), 'production content is in review');
    }

    public function test_import_run_writes_one_audit_entry_instead_of_one_per_record(): void
    {
        $run = ImportRun::start(['dataset' => 'audit-demo', 'source_name' => 'Fixture', 'source_url' => 'https://www.istat.it/x', 'license' => 'CC BY 4.0']);
        foreach (range(1, 3) as $i) { // auditable records written during the run are not audited one by one
            (new GovernmentOffice)->forceFill([
                'slug' => "audit-office-$i", 'office_type' => 'questura', 'booking_method' => 'unknown', 'source_name' => 'F', 'source_url' => 'https://www.interno.gov.it/x',
                'source_type' => 'official', 'last_verified_at' => now(),
            ])->save();
            $run->added();
        }
        $run->finish();

        $this->assertSame(0, AuditLog::where('action', 'governmentoffice.created')->count());
        $entry = AuditLog::where('action', 'data.import')->sole();
        $this->assertSame(['audit-demo', 3], [$entry->changes['dataset'], $entry->changes['added']]);

        // once the run is finished, normal per-record auditing resumes
        (new GovernmentOffice)->forceFill([
            'slug' => 'audit-office-after', 'office_type' => 'questura', 'booking_method' => 'unknown', 'source_name' => 'F', 'source_url' => 'https://www.interno.gov.it/x',
            'source_type' => 'official', 'last_verified_at' => now(),
        ])->save();
        $this->assertSame(1, AuditLog::where('action', 'governmentoffice.created')->count());
    }
}
