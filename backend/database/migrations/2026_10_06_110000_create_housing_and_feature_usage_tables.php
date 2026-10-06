<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Per-user, per-day counters for plan-limited features (housing checks, document explanations).
        Schema::create('feature_usage', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('feature', 40);
            $table->date('day');
            $table->unsignedInteger('count')->default(0);
            $table->unique(['user_id', 'feature', 'day']);
        });

        // Editable rule table of the rental checker (admin content with lifecycle + optional legal source).
        Schema::create('housing_rules', function (Blueprint $table) {
            $table->id();
            $table->string('slug', 120)->unique();
            $table->string('kind', 12);               // red_flag | question
            $table->string('signal', 40);             // a key produced by HousingExtractor
            $table->string('condition', 10);          // present | absent | gt | lt
            $table->decimal('threshold', 10, 2)->nullable(); // gt/lt only; numeric limits must be SOURCED rules
            $table->string('severity', 10)->default('info'); // info | caution | warning
            $table->string('basis', 20)->default('general_guidance'); // general_guidance | sourced
            $table->unsignedInteger('sort_order')->default(0);
            $table->contentLifecycle();
            $table->sourceFields();
            $table->unsignedBigInteger('created_by')->nullable();
            $table->unsignedBigInteger('updated_by')->nullable();
            $table->timestamps();
            $table->softDeletes();
            $table->index(['status', 'signal']);
        });

        Schema::create('housing_rule_translations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('housing_rule_id')->constrained()->cascadeOnDelete();
            $table->string('locale', 2);
            $table->string('title');
            $table->text('explanation')->nullable();
            $table->text('question')->nullable();
            $table->unique(['housing_rule_id', 'locale'], 'hrt_unique');
        });

        // Only created when the user explicitly saves a result. The pasted text is NEVER stored.
        Schema::create('housing_checks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->text('label')->nullable();   // encrypted
            $table->string('locale', 2);
            $table->longText('result');          // encrypted JSON
            $table->timestamp('expires_at')->index();
            $table->timestamps();
            $table->index(['user_id', 'created_at']);
        });
    }

    public function down(): void
    {
        foreach (['housing_checks', 'housing_rule_translations', 'housing_rules', 'feature_usage'] as $t) {
            Schema::dropIfExists($t);
        }
    }
};
