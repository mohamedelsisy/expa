<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('articles', function (Blueprint $table) {
            $table->id();
            $table->string('slug', 120)->unique();
            $table->string('category', 30)->index();
            $table->foreignId('region_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('city_id')->nullable()->constrained()->nullOnDelete();
            $table->string('author_name', 120)->nullable(); // editorial byline; free text, not an account
            $table->string('cover_image_url', 2048)->nullable();
            $table->unsignedSmallInteger('reading_minutes')->nullable();
            $table->unsignedInteger('sort_order')->default(0);
            $table->contentLifecycle();
            $table->sourceFields(); // optional for articles; validated when present
            $table->unsignedBigInteger('created_by')->nullable();
            $table->unsignedBigInteger('updated_by')->nullable();
            $table->timestamps();
            $table->softDeletes();
            $table->index(['status', 'published_at']);
        });
        Schema::create('article_translations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('article_id')->constrained()->cascadeOnDelete();
            $table->string('locale', 2);
            $table->string('title');
            $table->text('excerpt')->nullable();
            $table->longText('body')->nullable();
            $table->string('seo_title', 70)->nullable();
            $table->string('seo_description', 200)->nullable();
            $table->unique(['article_id', 'locale']);
        });
        Schema::create('article_tags', function (Blueprint $table) {
            $table->foreignId('article_id')->constrained()->cascadeOnDelete();
            $table->string('tag', 40);
            $table->primary(['article_id', 'tag']);
            $table->index('tag');
        });
        Schema::create('article_guide', function (Blueprint $table) {
            $table->foreignId('article_id')->constrained()->cascadeOnDelete();
            $table->foreignId('guide_id')->constrained()->cascadeOnDelete();
            $table->primary(['article_id', 'guide_id']);
        });

        // One landing profile per city (the reference `cities` row stays a plain lookup).
        Schema::create('city_profiles', function (Blueprint $table) {
            $table->id();
            $table->string('slug', 120)->unique(); // = the city slug at creation; lets the generic admin content engine address it
            $table->foreignId('city_id')->unique()->constrained()->cascadeOnDelete();
            $table->unsignedInteger('sort_order')->default(0);
            $table->contentLifecycle();
            $table->sourceFields(); // optional profile-level attribution; per-block sources are what official claims rely on
            $table->unsignedBigInteger('created_by')->nullable();
            $table->unsignedBigInteger('updated_by')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
        Schema::create('city_profile_translations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('city_profile_id')->constrained()->cascadeOnDelete();
            $table->string('locale', 2);
            $table->string('headline');
            $table->text('summary')->nullable();
            $table->string('seo_description', 200)->nullable();
            $table->unique(['city_profile_id', 'locale']);
        });
        Schema::create('city_blocks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('city_profile_id')->constrained()->cascadeOnDelete();
            $table->string('block_key', 30); // overview | transport | housing | healthcare | work | study | bureaucracy | daily_life | costs
            $table->string('info_type', 20)->default('general_guidance'); // official_info (source required) | general_guidance
            $table->unsignedInteger('sort_order')->default(0);
            $table->sourceFields();
            $table->timestamps();
            $table->index(['city_profile_id', 'sort_order']);
        });
        Schema::create('city_block_translations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('city_block_id')->constrained()->cascadeOnDelete();
            $table->string('locale', 2);
            $table->string('title');
            $table->text('body')->nullable();
            $table->unique(['city_block_id', 'locale']);
        });
    }

    public function down(): void
    {
        foreach (['city_block_translations', 'city_blocks', 'city_profile_translations', 'city_profiles', 'article_guide', 'article_tags', 'article_translations', 'articles'] as $t) {
            Schema::dropIfExists($t);
        }
    }
};
