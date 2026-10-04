<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('government_services', function (Blueprint $table) {
            $table->id();
            $table->string('slug', 120)->unique();
            $table->string('domain', 30)->index();
            $table->string('italian_term')->nullable();
            $table->foreignId('guide_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('region_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('city_id')->nullable()->constrained()->nullOnDelete();
            $table->unsignedInteger('sort_order')->default(0);
            $table->contentLifecycle();
            $table->sourceFields();
            $table->unsignedBigInteger('created_by')->nullable();
            $table->unsignedBigInteger('updated_by')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('government_service_translations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('government_service_id')->constrained()->cascadeOnDelete();
            $table->string('locale', 2);
            $table->string('name');
            $table->text('summary')->nullable();
            $table->text('how_to_apply')->nullable();
            $table->json('required_documents')->nullable();
            $table->text('notes')->nullable();
            $table->unique(['government_service_id', 'locale'], 'gs_translations_unique');
        });

        Schema::create('government_offices', function (Blueprint $table) {
            $table->id();
            $table->string('slug', 120)->unique();
            $table->string('office_type', 30)->index();
            $table->foreignId('region_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('city_id')->nullable()->constrained()->nullOnDelete();
            $table->string('address')->nullable();
            $table->string('postal_code', 10)->nullable();
            $table->string('phone', 40)->nullable();
            $table->string('email')->nullable();
            $table->string('official_url', 2048)->nullable();
            $table->string('booking_url', 2048)->nullable();
            $table->string('booking_method', 20)->default('unknown');
            $table->unsignedInteger('sort_order')->default(0);
            $table->contentLifecycle();
            $table->sourceFields();
            $table->unsignedBigInteger('created_by')->nullable();
            $table->unsignedBigInteger('updated_by')->nullable();
            $table->timestamps();
            $table->softDeletes();
            $table->index(['city_id', 'office_type']);
        });

        Schema::create('government_office_translations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('government_office_id')->constrained()->cascadeOnDelete();
            $table->string('locale', 2);
            $table->string('name');
            $table->text('opening_hours')->nullable();
            $table->text('notes')->nullable();
            $table->unique(['government_office_id', 'locale'], 'go_translations_unique');
        });

        Schema::create('government_service_office', function (Blueprint $table) {
            $table->foreignId('government_service_id')->constrained()->cascadeOnDelete();
            $table->foreignId('government_office_id')->constrained()->cascadeOnDelete();
            $table->primary(['government_service_id', 'government_office_id'], 'gso_primary');
        });

        Schema::create('appointment_guides', function (Blueprint $table) {
            $table->id();
            $table->string('slug', 120)->unique();
            $table->string('office_type', 30)->index();
            $table->string('booking_method', 20)->default('unknown');
            $table->string('booking_portal_url', 2048)->nullable();
            $table->unsignedInteger('sort_order')->default(0);
            $table->contentLifecycle();
            $table->sourceFields();
            $table->unsignedBigInteger('created_by')->nullable();
            $table->unsignedBigInteger('updated_by')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('appointment_guide_translations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('appointment_guide_id')->constrained()->cascadeOnDelete();
            $table->string('locale', 2);
            $table->string('title');
            $table->text('summary')->nullable();
            $table->json('steps')->nullable();
            $table->text('tips')->nullable();
            $table->text('cautions')->nullable();
            $table->unique(['appointment_guide_id', 'locale'], 'ag_translations_unique');
        });
    }

    public function down(): void
    {
        foreach (['appointment_guide_translations', 'appointment_guides', 'government_service_office', 'government_office_translations', 'government_offices', 'government_service_translations', 'government_services'] as $t) {
            Schema::dropIfExists($t);
        }
    }
};
