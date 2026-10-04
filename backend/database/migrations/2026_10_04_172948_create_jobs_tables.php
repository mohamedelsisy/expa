<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('job_sources', function (Blueprint $table) {
            $table->id();
            $table->string('key', 60)->unique();
            $table->string('name');
            $table->string('driver', 20); // json_feed | rss
            $table->text('config')->nullable(); // encrypted JSON: url, mapping, auth headers
            $table->text('legal_basis')->nullable(); // required before activation: why automated use of this source is permitted
            $table->boolean('active')->default(false);
            $table->unsignedSmallInteger('schedule_hours')->default(6);
            $table->timestamp('last_run_at')->nullable();
            $table->string('last_status', 12)->nullable();
            $table->unsignedSmallInteger('consecutive_failures')->default(0);
            $table->timestamps();
        });

        Schema::create('job_import_runs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('job_source_id')->constrained()->cascadeOnDelete();
            $table->string('status', 12); // running | success | partial | failed
            $table->unsignedInteger('fetched')->default(0);
            $table->unsignedInteger('created')->default(0);
            $table->unsignedInteger('updated')->default(0);
            $table->unsignedInteger('unchanged')->default(0);
            $table->unsignedInteger('duplicates')->default(0);
            $table->unsignedInteger('invalid')->default(0);
            $table->json('error_samples')->nullable(); // first few rejection reasons, never raw content
            $table->string('error_message', 500)->nullable();
            $table->timestamp('started_at');
            $table->timestamp('finished_at')->nullable();
            $table->index(['job_source_id', 'started_at']);
        });

        Schema::create('job_listings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('job_source_id')->constrained()->cascadeOnDelete();
            $table->string('external_id', 191);
            $table->string('dedupe_hash', 40)->index();
            $table->string('title', 300);
            $table->string('company', 200);
            $table->foreignId('city_id')->nullable()->constrained()->nullOnDelete();
            $table->string('location_text', 200)->nullable();
            $table->string('remote_mode', 10)->default('onsite');
            $table->string('employment_type', 12)->default('other');
            $table->string('category', 20)->default('other');
            $table->unsignedInteger('salary_min')->nullable();
            $table->unsignedInteger('salary_max')->nullable();
            $table->string('salary_currency', 3)->nullable();
            $table->string('salary_period', 6)->nullable(); // year | month | hour
            $table->string('italian_level', 2)->nullable();
            $table->string('english_level', 2)->nullable();
            $table->unsignedTinyInteger('experience_years')->nullable();
            $table->json('skills')->nullable();
            $table->text('description');
            $table->string('apply_url', 2048);
            $table->boolean('visa_sponsorship_stated')->default(false); // true ONLY when the source's structured data says so
            $table->timestamp('published_at');
            $table->timestamp('expires_at')->nullable();
            $table->string('status', 12)->default('published'); // published | expired | hidden
            $table->string('content_hash', 40);
            $table->unsignedInteger('apply_clicks')->default(0);
            $table->timestamps();
            $table->unique(['job_source_id', 'external_id']);
            $table->index(['status', 'published_at']);
            $table->index(['city_id', 'status']);
        });

        Schema::create('job_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained()->cascadeOnDelete();
            $table->json('skills')->nullable();
            $table->unsignedTinyInteger('experience_years')->nullable();
            $table->string('education', 20)->nullable();
            $table->string('remote_preference', 12)->nullable(); // any | remote_only | onsite_only
            $table->json('employment_types')->nullable();
            $table->unsignedInteger('salary_min_year')->nullable(); // expected, EUR gross per year
            $table->foreignId('city_id')->nullable()->constrained()->nullOnDelete();
            $table->timestamps();
        });

        Schema::create('job_saves', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('job_id')->constrained('job_listings')->cascadeOnDelete();
            $table->timestamp('created_at')->useCurrent();
            $table->unique(['user_id', 'job_id']);
        });
    }

    public function down(): void
    {
        foreach (['job_saves', 'job_profiles', 'job_listings', 'job_import_runs', 'job_sources'] as $t) {
            Schema::dropIfExists($t);
        }
    }
};
