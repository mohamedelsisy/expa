<?php

namespace Tests\Feature\DataImport;

use App\Domains\DataImport\Support\RawDownloadPruner;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class RawDownloadPrunerTest extends TestCase
{
    use RefreshDatabase;

    private function stored(string $path, int $daysOld): void
    {
        Storage::disk('local')->put($path, 'x');
        touch(Storage::disk('local')->path($path), now()->subDays($daysOld)->getTimestamp());
    }

    public function test_keeps_the_newest_file_per_dataset_and_drops_old_ones(): void
    {
        Storage::fake('local');
        $this->stored('imports/ipa/20240101-aaa.csv', 400);
        $this->stored('imports/ipa/20250101-bbb.csv', 200);
        $this->stored('imports/ipa/20260901-ccc.csv', 5);
        $this->stored('imports/study/20240101-ddd.csv', 400); // the only (and so newest) file of its dataset: kept however old
        $this->stored('imports/istat/20260801-eee.xlsx', 60);
        $this->stored('imports/istat/20260901-fff.xlsx', 30); // newest kept; the 60-day one is younger than the 90-day limit

        $removed = app(RawDownloadPruner::class)->prune(90);

        $this->assertSame(2, $removed);
        Storage::disk('local')->assertMissing('imports/ipa/20240101-aaa.csv');
        Storage::disk('local')->assertMissing('imports/ipa/20250101-bbb.csv');
        Storage::disk('local')->assertExists('imports/ipa/20260901-ccc.csv');
        Storage::disk('local')->assertExists('imports/study/20240101-ddd.csv');
        Storage::disk('local')->assertExists('imports/istat/20260801-eee.xlsx');
        Storage::disk('local')->assertExists('imports/istat/20260901-fff.xlsx');
    }

    public function test_drops_orphaned_partial_downloads_after_a_day_but_not_fresh_ones(): void
    {
        Storage::fake('local');
        $this->stored('imports/ipa/20260901-ccc.csv', 1);
        $this->stored('imports/ipa/.part-old', 3);
        $this->stored('imports/ipa/.part-live', 0);

        $this->assertSame(1, app(RawDownloadPruner::class)->prune(90));
        Storage::disk('local')->assertMissing('imports/ipa/.part-old');
        Storage::disk('local')->assertExists('imports/ipa/.part-live');
        Storage::disk('local')->assertExists('imports/ipa/20260901-ccc.csv');
    }

    public function test_a_missing_import_directory_is_fine_and_the_retention_command_runs_it(): void
    {
        Storage::fake('local');
        $this->stored('imports/ipa/20240101-aaa.csv', 400);
        $this->stored('imports/ipa/20260901-ccc.csv', 1);
        config(['dataimport.raw_retention_days' => 30]);

        $this->artisan('expa:prune-retention')->expectsOutputToContain('Pruned 1 raw dataset download(s)')->assertSuccessful();
        Storage::disk('local')->assertMissing('imports/ipa/20240101-aaa.csv');
    }
}
