<?php

namespace Tests\Feature\DataImport;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Tests\TestCase;

/** down() must remove only what up() added, and the migration must survive a rollback / re-apply cycle. */
class ProvenanceMigrationRollbackTest extends TestCase
{
    use RefreshDatabase;

    private function migration(): object
    {
        return require database_path('migrations/2026_10_11_000000_create_data_import_runs_and_provenance_columns.php');
    }

    public function test_rollback_removes_what_the_migration_added_and_reapplying_works(): void
    {
        $m = $this->migration();
        $this->assertTrue(Schema::hasTable('data_import_added_columns'));
        $this->assertSame(14, DB::table('data_import_added_columns')->count(), '7 tables x (source_id, source_license)');

        $m->down();
        $this->assertFalse(Schema::hasTable('data_import_runs'));
        $this->assertFalse(Schema::hasTable('data_import_added_columns'));
        $this->assertFalse(Schema::hasColumn('universities', 'source_id'));
        $this->assertFalse(Schema::hasColumn('cities', 'istat_code'));
        $this->assertTrue(Schema::hasTable('universities'), 'only columns are dropped, never the content tables');

        $m->up();
        $this->assertTrue(Schema::hasColumns('universities', ['source_id', 'source_license']));
        $this->assertTrue(Schema::hasColumn('regions', 'istat_code'));
    }

    public function test_a_column_that_existed_before_the_migration_survives_rollback(): void
    {
        $m = $this->migration();
        // Model "source_id on universities was there before up() ran": up() would have skipped it, so it is not in the ledger.
        DB::table('data_import_added_columns')->where(['table_name' => 'universities', 'column_name' => 'source_id'])->delete();

        $m->down();

        $this->assertTrue(Schema::hasColumn('universities', 'source_id'), 'not ours: must be left alone');
        $this->assertFalse(Schema::hasColumn('universities', 'source_license'), 'ours: dropped');
        $this->assertFalse(Schema::hasColumn('study_programs', 'source_id'));
    }

    public function test_up_does_not_claim_a_column_it_did_not_create(): void
    {
        $m = $this->migration();
        $m->down();
        Schema::table('universities', fn ($t) => $t->string('source_id', 160)->nullable());

        $m->up();

        $this->assertNull(DB::table('data_import_added_columns')->where(['table_name' => 'universities', 'column_name' => 'source_id'])->first());
        $this->assertNotNull(DB::table('data_import_added_columns')->where(['table_name' => 'universities', 'column_name' => 'source_license'])->first());
    }

    public function test_databases_migrated_before_the_ledger_existed_still_roll_back_fully(): void
    {
        $m = $this->migration();
        Schema::drop('data_import_added_columns');

        $m->down();

        foreach (['universities', 'government_offices', 'patente_categories'] as $table) {
            $this->assertFalse(Schema::hasColumn($table, 'source_id'), $table);
            $this->assertFalse(Schema::hasColumn($table, 'source_license'), $table);
        }
    }
}
