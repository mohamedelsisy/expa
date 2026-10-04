<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('user_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained()->cascadeOnDelete();
            $table->text('nationality')->nullable(); // encrypted
            $table->text('residence_type')->nullable(); // encrypted
            $table->string('segment', 20)->nullable();
            $table->string('age_range', 10)->nullable();
            $table->string('italian_level', 2)->nullable();
            $table->string('english_level', 2)->nullable();
            $table->json('goals')->nullable();
            $table->json('onboarding_skipped')->nullable();
            $table->timestamp('onboarding_completed_at')->nullable();
            $table->timestamps();
        });

        Schema::create('consents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('purpose', 40);
            $table->boolean('granted');
            $table->string('policy_version', 20);
            $table->string('source', 20)->default('api');
            $table->string('ip_hash', 64)->nullable();
            $table->timestamp('created_at')->useCurrent();
            $table->index(['user_id', 'purpose', 'id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('consents');
        Schema::dropIfExists('user_profiles');
    }
};
