<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('service_providers', function (Blueprint $table) {
            $table->id();
            $table->string('slug', 120)->unique();
            $table->foreignId('user_id')->nullable()->unique()->constrained()->nullOnDelete(); // owner account (role provider)
            $table->string('category', 30)->index();
            $table->string('display_name'); // business / professional name (language-neutral)
            $table->foreignId('region_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('city_id')->nullable()->constrained()->nullOnDelete();
            $table->boolean('serves_online')->default(false);
            $table->json('languages')->nullable(); // spoken languages, ISO 639-1 codes
            // Private contact (used to route leads); public only when the matching show_* flag is set by the provider.
            $table->text('contact_email')->nullable(); // encrypted
            $table->text('contact_phone')->nullable(); // encrypted
            $table->string('website', 2048)->nullable();
            $table->boolean('show_email')->default(false);
            $table->boolean('show_phone')->default(false);
            $table->boolean('show_website')->default(true);
            // Verification: unverified -> pending -> verified (re-verified before expiry).
            $table->string('verification_status', 15)->default('unverified')->index();
            $table->timestamp('verification_requested_at')->nullable();
            $table->unsignedBigInteger('verified_by')->nullable();
            $table->timestamp('verified_at')->nullable();
            $table->timestamp('verification_expires_at')->nullable();
            $table->text('verification_basis')->nullable(); // what was checked, e.g. register entry consulted (admin text)
            // Commercial configuration only (no payment flow exists).
            $table->decimal('commission_percent', 5, 2)->nullable();
            $table->string('commission_note', 255)->nullable();
            // Aggregates from APPROVED reviews only.
            $table->decimal('rating_avg', 3, 2)->nullable();
            $table->unsignedInteger('rating_count')->default(0);
            // Owner edits to a live listing wait here until an admin approves them.
            $table->json('pending_changes')->nullable();
            $table->timestamp('pending_changes_at')->nullable();
            $table->unsignedInteger('sort_order')->default(0);
            $table->contentLifecycle();
            $table->unsignedBigInteger('created_by')->nullable();
            $table->unsignedBigInteger('updated_by')->nullable();
            $table->timestamps();
            $table->softDeletes();
            $table->index(['status', 'category']);
        });
        Schema::create('service_provider_translations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('service_provider_id')->constrained()->cascadeOnDelete();
            $table->string('locale', 2);
            $table->string('headline');
            $table->text('description')->nullable();
            $table->text('availability_note')->nullable();
            $table->unique(['service_provider_id', 'locale']);
        });
        Schema::create('provider_areas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('service_provider_id')->constrained()->cascadeOnDelete();
            $table->foreignId('region_id')->nullable()->constrained()->cascadeOnDelete();
            $table->foreignId('city_id')->nullable()->constrained()->cascadeOnDelete();
            $table->index(['region_id', 'city_id']);
        });
        Schema::create('provider_services', function (Blueprint $table) {
            $table->id();
            $table->foreignId('service_provider_id')->constrained()->cascadeOnDelete();
            $table->unsignedInteger('price_from_eur')->nullable(); // only if the provider states it
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();
        });
        Schema::create('provider_service_translations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('provider_service_id')->constrained()->cascadeOnDelete();
            $table->string('locale', 2);
            $table->string('name');
            $table->text('description')->nullable();
            $table->unique(['provider_service_id', 'locale']);
        });
        // Verification evidence: file contents encrypted at rest, readable only by admins with providers.verify.
        Schema::create('provider_verification_documents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('service_provider_id')->constrained()->cascadeOnDelete();
            $table->string('storage_path');
            $table->string('original_name', 255);
            $table->string('mime', 100);
            $table->unsignedInteger('size');
            $table->string('sha256', 64);
            $table->timestamps();
        });
        Schema::create('provider_reviews', function (Blueprint $table) {
            $table->id();
            $table->foreignId('service_provider_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete(); // null after erasure (anonymised)
            $table->unsignedTinyInteger('rating');
            $table->text('body')->nullable();
            $table->string('locale', 2)->nullable();
            $table->string('status', 10)->default('pending')->index(); // pending | approved | rejected
            $table->unsignedBigInteger('moderated_by')->nullable();
            $table->timestamp('moderated_at')->nullable();
            $table->string('moderation_reason', 255)->nullable();
            $table->text('provider_reply')->nullable();
            $table->string('provider_reply_status', 10)->nullable(); // pending | approved | rejected
            $table->timestamp('provider_reply_at')->nullable();
            $table->string('content_hash', 64)->nullable();
            $table->timestamps();
            $table->unique(['service_provider_id', 'user_id']);
            $table->index(['service_provider_id', 'status']);
        });
        Schema::create('provider_leads', function (Blueprint $table) {
            $table->id();
            $table->foreignId('service_provider_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('status', 10)->default('new')->index(); // new | seen | closed
            $table->text('message'); // encrypted
            $table->string('preferred_language', 2)->nullable();
            $table->string('request_type', 20)->default('contact'); // contact | booking
            $table->text('contact_name'); // encrypted: shared only because the user consented for THIS provider
            $table->text('contact_email'); // encrypted
            $table->text('contact_phone')->nullable(); // encrypted
            $table->timestamp('consent_given_at');
            $table->string('consent_version', 20);
            $table->timestamp('seen_at')->nullable();
            $table->timestamps();
            $table->index(['service_provider_id', 'status']);
        });
        Schema::create('content_reports', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete(); // reporter; nulled on erasure
            $table->string('reportable_type', 40);
            $table->unsignedBigInteger('reportable_id');
            $table->string('reason', 20);
            $table->string('note', 500)->nullable();
            $table->string('status', 10)->default('open')->index(); // open | resolved | dismissed
            $table->unsignedBigInteger('handled_by')->nullable();
            $table->timestamp('handled_at')->nullable();
            $table->timestamps();
            $table->index(['reportable_type', 'reportable_id']);
        });
    }

    public function down(): void
    {
        foreach (['content_reports', 'provider_leads', 'provider_reviews', 'provider_verification_documents', 'provider_service_translations', 'provider_services', 'provider_areas', 'service_provider_translations', 'service_providers'] as $t) {
            Schema::dropIfExists($t);
        }
    }
};
