<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('italian_lessons', function (Blueprint $table) {
            $table->id();
            $table->string('slug', 120)->unique();
            $table->string('level', 2); // a0..c1
            $table->string('type', 20);
            $table->string('scenario', 30)->nullable();
            $table->unsignedSmallInteger('duration_minutes')->default(2);
            $table->unsignedInteger('sort_order')->default(0);
            $table->contentLifecycle();
            $table->sourceFields(); // optional attribution for lessons (not required to publish)
            $table->unsignedBigInteger('created_by')->nullable();
            $table->unsignedBigInteger('updated_by')->nullable();
            $table->timestamps();
            $table->softDeletes();
            $table->index(['level', 'type', 'sort_order']);
        });

        Schema::create('italian_lesson_translations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('italian_lesson_id')->constrained()->cascadeOnDelete();
            $table->string('locale', 2);
            $table->string('title');
            $table->text('summary')->nullable();
            $table->longText('body')->nullable();
            $table->json('items')->nullable(); // type-specific: words / dialogue lines / examples / tips
            $table->unique(['italian_lesson_id', 'locale'], 'il_translations_unique');
        });

        Schema::create('lesson_progress', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('italian_lesson_id')->constrained()->cascadeOnDelete();
            $table->string('status', 12); // started | completed
            $table->unsignedTinyInteger('score')->nullable(); // 0-100
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();
            $table->unique(['user_id', 'italian_lesson_id']);
            $table->index(['user_id', 'completed_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('lesson_progress');
        Schema::dropIfExists('italian_lesson_translations');
        Schema::dropIfExists('italian_lessons');
    }
};
