<?php

namespace Tests\Feature\DataImport;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ImportAllCommandTest extends TestCase
{
    use RefreshDatabase;

    public function test_unknown_importer_is_refused(): void
    {
        $this->artisan('expa:import:all', ['--only' => 'nope'])->expectsOutputToContain('Unknown importer')->assertExitCode(2);
    }

    public function test_offline_importers_run_and_report_per_importer(): void
    {
        // The two importers that need no download run for real; one failing/absent source never hides the others.
        $this->artisan('expa:import:all', ['--only' => 'patente-categories,appointment-guides'])
            ->expectsOutputToContain('patente-categories')->expectsOutputToContain('appointment-guides')->assertSuccessful();
    }

    public function test_scheduled_imports_are_off_by_default(): void
    {
        $this->assertFalse((bool) config('dataimport.schedule_enabled'));
    }
}
