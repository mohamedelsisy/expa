<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Sourced travel-requirement entries (nationality -> destination, optionally per residence status).
        // EXPA ships NO rows; an entry goes live only with an official source and a verification date.
        Schema::create('travel_requirements', function (Blueprint $table) {
            $table->id();
            $table->string('slug', 120)->unique();
            $table->string('nationality', 2);       // ISO 3166-1 alpha-2, or "*" for any nationality
            $table->string('destination', 2);       // ISO 3166-1 alpha-2
            $table->string('residence_status', 40)->default('any'); // any | visa | residence_permit | long_term_resident | no_status | ...
            $table->unsignedInteger('sort_order')->default(0);
            $table->contentLifecycle();
            $table->sourceFields();
            $table->unsignedBigInteger('created_by')->nullable();
            $table->unsignedBigInteger('updated_by')->nullable();
            $table->timestamps();
            $table->softDeletes();
            $table->index(['status', 'destination', 'nationality']);
        });

        Schema::create('travel_requirement_translations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('travel_requirement_id')->constrained()->cascadeOnDelete();
            $table->string('locale', 2);
            $table->string('title');
            $table->text('summary')->nullable();
            $table->text('requirements')->nullable();
            $table->text('notes')->nullable();
            $table->unique(['travel_requirement_id', 'locale'], 'trt_unique');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('travel_requirement_translations');
        Schema::dropIfExists('travel_requirements');
    }
};
