<?php

namespace Tests\Feature\DataImport;

use App\Domains\Audit\Models\AuditLog;
use App\Domains\DataImport\Models\DataImportRun;
use App\Domains\DataImport\Support\ImportRun;
use App\Domains\Government\Models\GovernmentOffice;
use App\Domains\GovernmentImport\Content\AppointmentGuideContent;
use App\Domains\GovernmentImport\Services\AppointmentGuidesImporter;
use App\Support\Audit\AuditMute;
use Illuminate\Foundation\Testing\RefreshDatabase;
use RuntimeException;
use Tests\TestCase;

/** An importer that blows up must never leave a run `running` or the audit log muted for the rest of the process. */
class ImportRunFailureTest extends TestCase
{
    use RefreshDatabase;

    private function meta(): array
    {
        return ['dataset' => 'demo', 'source_name' => 'Fixture', 'source_url' => 'https://www.istat.it/x', 'license' => 'CC BY 4.0'];
    }

    public function test_guard_fails_the_run_unmutes_audit_and_rethrows(): void
    {
        $run = ImportRun::start($this->meta());
        $this->assertTrue(AuditMute::isMuted());

        try {
            $run->guard(function (ImportRun $r) {
                $r->read();
                throw new RuntimeException('boom');
            });
            $this->fail('guard must rethrow');
        } catch (RuntimeException $e) {
            $this->assertSame('boom', $e->getMessage());
        }

        $this->assertFalse(AuditMute::isMuted());
        $row = DataImportRun::firstOrFail();
        $this->assertSame(['failed', 'boom', 1], [$row->status, $row->error, $row->records_read]);
        $this->assertNotNull($row->finished_at);
        $this->assertSame(1, AuditLog::where('action', 'data.import')->count());
    }

    public function test_finish_is_idempotent_so_nested_guard_and_explicit_finish_unmute_once(): void
    {
        AuditMute::on(); // an outer run (import:all style) is still active
        $run = ImportRun::start($this->meta());
        $run->guard(fn (ImportRun $r) => $r->finish());
        $run->finish();

        $this->assertTrue(AuditMute::isMuted(), 'the outer mute must survive a second finish()');
        $this->assertSame(1, AuditLog::where('action', 'data.import')->count());
    }

    public function test_appointment_guides_importer_failure_is_recorded_and_audit_keeps_working(): void
    {
        $broken = AppointmentGuideContent::all()[0];
        $broken['office_type'] = 'not-an-enum'; // passes assertValid(), blows up in upsert()

        try {
            app(AppointmentGuidesImporter::class)->run(false, [$broken]);
            $this->fail('expected the importer to throw');
        } catch (\Throwable) {
        }

        $this->assertFalse(AuditMute::isMuted());
        $this->assertSame('failed', DataImportRun::where('dataset', AppointmentGuidesImporter::DATASET)->firstOrFail()->status);

        // Ordinary audited writes after the failed import are logged again.
        $before = AuditLog::count();
        GovernmentOffice::factory()->create();
        $this->assertGreaterThan($before, AuditLog::count());
    }
}
