<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('patente_questions', function (Blueprint $table) {
            // Structured licensing of the question text. `rights_note` stays for backward compatibility.
            $table->string('license_type', 30)->nullable()->after('rights_note');
            $table->string('rights_holder')->nullable()->after('license_type');
            $table->string('license_proof_ref', 500)->nullable()->after('rights_holder'); // contract / permission / commission reference
            $table->index('license_type');
            $table->string('rights_note', 500)->nullable()->change(); // structured licence may replace the legacy note
        });
    }

    public function down(): void
    {
        Schema::table('patente_questions', function (Blueprint $table) {
            $table->dropIndex(['license_type']);
            $table->string('rights_note', 500)->nullable(false)->change();
            $table->dropColumn(['license_type', 'rights_holder', 'license_proof_ref']);
        });
    }
};
