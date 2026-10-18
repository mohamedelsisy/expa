<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Provenance for real-world datasets imported from official sources: one row per import run (what was fetched, from
 * where, under which licence, what changed) plus stable source identifiers on the records themselves so imports are
 * idempotent. Additive only: nothing existing is altered or dropped.
 */
return new class extends Migration
{
    /** Content tables that hold imported records and need a stable source identifier + licence. */
    private const IMPORTED = ['universities', 'study_programs', 'scholarships', 'government_offices', 'appointment_guides', 'tax_tables', 'patente_categories'];

    /**
     * up() only adds a column that is missing, so down() must only drop columns up() actually added: a column that
     * already existed (created by hand, or by a partial earlier run) is not ours to remove. What up() added is
     * recorded here and the table is dropped again by down().
     */
    private const LEDGER = 'data_import_added_columns';

    public function up(): void
    {
        Schema::create('data_import_runs', function (Blueprint $t) {
            $t->id();
            $t->string('dataset', 80)->index();
            $t->string('source_name');
            $t->text('source_url');
            $t->string('license', 160)->nullable();
            $t->text('license_url')->nullable();
            $t->text('attribution')->nullable();
            $t->string('source_edition', 120)->nullable();      // e.g. "Elenco comuni al 31 gennaio 2026"
            $t->date('source_published_at')->nullable();
            $t->timestamp('fetched_at')->nullable();
            $t->string('checksum_sha256', 64)->nullable();
            $t->string('status', 20)->default('running')->index(); // running | succeeded | partial | failed
            $t->unsignedInteger('records_read')->default(0);
            $t->unsignedInteger('added')->default(0);
            $t->unsignedInteger('updated')->default(0);
            $t->unsignedInteger('unchanged')->default(0);
            $t->unsignedInteger('rejected')->default(0);
            $t->unsignedInteger('stale_marked')->default(0);
            $t->json('rejects')->nullable();                      // capped sample of rejected rows with the reason
            $t->text('error')->nullable();
            $t->string('environment', 30)->nullable();
            $t->timestamp('started_at')->nullable();
            $t->timestamp('finished_at')->nullable();
            $t->timestamps();
        });

        if (! Schema::hasTable(self::LEDGER)) {
            Schema::create(self::LEDGER, function (Blueprint $t) {
                $t->string('table_name', 64);
                $t->string('column_name', 64);
                $t->primary(['table_name', 'column_name']);
            });
        }

        foreach (self::IMPORTED as $table) {
            if (! Schema::hasTable($table)) {
                continue;
            }
            $added = [];
            Schema::table($table, function (Blueprint $t) use ($table, &$added) {
                if (! Schema::hasColumn($table, 'source_id')) {
                    $t->string('source_id', 160)->nullable()->unique();
                    $added[] = 'source_id';
                }
                if (! Schema::hasColumn($table, 'source_license')) {
                    $t->string('source_license', 160)->nullable();
                    $added[] = 'source_license';
                }
            });
            foreach ($added as $column) {
                DB::table(self::LEDGER)->insertOrIgnore(['table_name' => $table, 'column_name' => $column]);
            }
        }

        // Official Italian administrative codes for cities (ISTAT).
        Schema::table('cities', function (Blueprint $t) {
            $t->string('istat_code', 6)->nullable()->unique();
            $t->string('province_code', 2)->nullable()->index();       // sigla automobilistica, e.g. RM
            $t->boolean('is_province_capital')->default(false)->index();
            $t->string('source_license', 160)->nullable();
            $t->timestamp('source_verified_at')->nullable();
        });
        Schema::table('regions', function (Blueprint $t) {
            $t->string('istat_code', 2)->nullable()->unique();
        });
    }

    public function down(): void
    {
        $this->dropColumns('regions', ['istat_code']);
        $this->dropColumns('cities', ['istat_code', 'province_code', 'is_province_capital', 'source_license', 'source_verified_at']);
        // Databases migrated before the ledger existed have none: there, up() added every column it found missing.
        $ledger = Schema::hasTable(self::LEDGER) ? DB::table(self::LEDGER)->get()->groupBy('table_name')->map->pluck('column_name') : null;
        foreach (self::IMPORTED as $table) {
            if (! Schema::hasTable($table)) {
                continue;
            }
            $ours = $ledger === null ? ['source_id', 'source_license'] : ($ledger[$table] ?? collect())->all();
            $drop = array_values(array_filter($ours, fn ($c) => Schema::hasColumn($table, $c)));
            $this->dropColumns($table, $drop);
        }
        Schema::dropIfExists(self::LEDGER);
        Schema::dropIfExists('data_import_runs');
    }

    /** Drops the columns that exist, after their indexes (SQLite refuses to drop an indexed column). */
    private function dropColumns(string $table, array $columns): void
    {
        $columns = array_values(array_filter($columns, fn ($c) => Schema::hasColumn($table, $c)));
        if (! $columns) {
            return;
        }
        $indexes = collect(Schema::getIndexes($table))
            ->filter(fn ($i) => ! $i['primary'] && array_intersect($i['columns'], $columns))
            ->pluck('name');
        if ($indexes->isNotEmpty()) {
            Schema::table($table, function (Blueprint $t) use ($indexes) {
                foreach ($indexes as $name) {
                    $t->dropIndex($name);
                }
            });
        }
        Schema::table($table, fn (Blueprint $t) => $t->dropColumn($columns));
    }
};
