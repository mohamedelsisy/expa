<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Admin-editable, sourced, versioned tax parameters for the net-salary estimator. EXPA ships NO rows:
        // until an admin publishes a verified table (official source, tax year, last verified date) the estimator says so.
        Schema::create('tax_tables', function (Blueprint $table) {
            $table->id();
            $table->string('slug', 120)->unique();
            $table->unsignedSmallInteger('tax_year');
            $table->decimal('contribution_rate', 5, 2)->nullable();     // employee social-contribution % of gross (ceiling applies)
            $table->decimal('contribution_ceiling', 12, 2)->nullable(); // annual gross above which no further contribution accrues
            $table->decimal('deduction_flat', 12, 2)->default(0);       // flat annual deduction from taxable income
            $table->json('brackets');                                   // [{"up_to": number|null, "rate": percent}] ascending, last up_to null
            $table->unsignedInteger('sort_order')->default(0);
            $table->contentLifecycle();
            $table->sourceFields();
            $table->unsignedBigInteger('created_by')->nullable();
            $table->unsignedBigInteger('updated_by')->nullable();
            $table->timestamps();
            $table->softDeletes();
            $table->index(['status', 'tax_year']);
        });

        Schema::create('tax_table_translations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tax_table_id')->constrained()->cascadeOnDelete();
            $table->string('locale', 2);
            $table->string('name');
            $table->text('notes')->nullable();
            $table->unique(['tax_table_id', 'locale'], 'ttt_unique');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tax_table_translations');
        Schema::dropIfExists('tax_tables');
    }
};
