<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
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

        foreach (self::IMPORTED as $table) {
            if (! Schema::hasTable($table)) {
                continue;
            }
            Schema::table($table, function (Blueprint $t) use ($table) {
                if (! Schema::hasColumn($table, 'source_id')) {
                    $t->string('source_id', 160)->nullable()->unique();
                }
                if (! Schema::hasColumn($table, 'source_license')) {
                    $t->string('source_license', 160)->nullable();
                }
            });
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
        Schema::table('regions', fn (Blueprint $t) => $t->dropColumn('istat_code'));
        Schema::table('cities', function (Blueprint $t) {
            $t->dropColumn(['istat_code', 'province_code', 'is_province_capital', 'source_license', 'source_verified_at']);
        });
        foreach (self::IMPORTED as $table) {
            if (Schema::hasTable($table)) {
                Schema::table($table, fn (Blueprint $t) => $t->dropColumn(['source_id', 'source_license']));
            }
        }
        Schema::dropIfExists('data_import_runs');
    }
};
