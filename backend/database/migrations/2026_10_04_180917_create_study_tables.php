<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('universities', function (Blueprint $table) {
            $table->id();
            $table->string('slug', 120)->unique();
            $table->string('kind', 10)->default('public'); // public | private | other
            $table->foreignId('region_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('city_id')->nullable()->constrained()->nullOnDelete();
            $table->string('website', 2048)->nullable();
            $table->unsignedInteger('sort_order')->default(0);
            $table->contentLifecycle();
            $table->sourceFields();
            $table->unsignedBigInteger('created_by')->nullable();
            $table->unsignedBigInteger('updated_by')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
        Schema::create('university_translations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('university_id')->constrained()->cascadeOnDelete();
            $table->string('locale', 2);
            $table->string('name');
            $table->text('summary')->nullable();
            $table->text('notes')->nullable();
            $table->unique(['university_id', 'locale']);
        });

        Schema::create('study_programs', function (Blueprint $table) {
            $table->id();
            $table->string('slug', 120)->unique();
            $table->foreignId('university_id')->constrained()->restrictOnDelete();
            $table->string('degree_level', 20);
            $table->string('field', 30)->index();
            $table->string('instruction_language', 4); // en | it | both
            $table->unsignedTinyInteger('duration_years')->nullable();
            $table->unsignedInteger('tuition_min_year')->nullable(); // EUR; null = not stated by the source
            $table->unsignedInteger('tuition_max_year')->nullable();
            $table->string('required_italian_level', 2)->nullable();
            $table->string('required_english_level', 2)->nullable();
            $table->date('application_deadline')->nullable(); // only when the source states one
            $table->string('program_url', 2048)->nullable();
            $table->unsignedInteger('sort_order')->default(0);
            $table->contentLifecycle();
            $table->sourceFields();
            $table->unsignedBigInteger('created_by')->nullable();
            $table->unsignedBigInteger('updated_by')->nullable();
            $table->timestamps();
            $table->softDeletes();
            $table->index(['status', 'degree_level']);
        });
        Schema::create('study_program_translations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('study_program_id')->constrained()->cascadeOnDelete();
            $table->string('locale', 2);
            $table->string('title');
            $table->text('summary')->nullable();
            $table->text('admission_requirements')->nullable();
            $table->text('notes')->nullable();
            $table->unique(['study_program_id', 'locale'], 'sp_tr_unique');
        });

        Schema::create('scholarships', function (Blueprint $table) {
            $table->id();
            $table->string('slug', 120)->unique();
            $table->json('degree_levels')->nullable();
            $table->date('deadline')->nullable();
            $table->string('apply_url', 2048)->nullable();
            $table->unsignedInteger('sort_order')->default(0);
            $table->contentLifecycle();
            $table->sourceFields();
            $table->unsignedBigInteger('created_by')->nullable();
            $table->unsignedBigInteger('updated_by')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
        Schema::create('scholarship_translations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('scholarship_id')->constrained()->cascadeOnDelete();
            $table->string('locale', 2);
            $table->string('name');
            $table->text('summary')->nullable();
            $table->text('eligibility')->nullable();
            $table->text('how_to_apply')->nullable();
            $table->unique(['scholarship_id', 'locale'], 'sch_tr_unique');
        });
    }

    public function down(): void
    {
        foreach (['scholarship_translations', 'scholarships', 'study_program_translations', 'study_programs', 'university_translations', 'universities'] as $t) {
            Schema::dropIfExists($t);
        }
    }
};
