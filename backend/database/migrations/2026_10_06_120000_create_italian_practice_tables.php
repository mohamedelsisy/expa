<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('italian_vocabularies', function (Blueprint $table) {
            $table->id();
            $table->string('slug', 120)->unique();
            $table->string('lemma', 150);                     // the Italian word / phrase (language-neutral)
            $table->string('part_of_speech', 20)->nullable();
            $table->string('level', 2);                       // a0..c1
            $table->string('category', 30)->nullable();       // a scenario value, `patente`, `general`
            $table->string('example_it', 500)->nullable();
            $table->string('audio_url', 2048)->nullable();
            $table->string('audio_rights_note', 500)->nullable(); // provenance/licence of the recording; required with audio_url to publish
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamp('reviewed_by_teacher_at')->nullable(); // null = content NOT yet reviewed by a qualified teacher
            $table->unsignedBigInteger('reviewed_by')->nullable();
            $table->contentLifecycle();
            $table->sourceFields();
            $table->unsignedBigInteger('created_by')->nullable();
            $table->unsignedBigInteger('updated_by')->nullable();
            $table->timestamps();
            $table->softDeletes();
            $table->index(['level', 'category', 'status']);
            $table->index('lemma');
        });

        Schema::create('italian_vocabulary_translations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('italian_vocabulary_id')->constrained()->cascadeOnDelete();
            $table->string('locale', 2);
            $table->string('gloss');                         // meaning of the lemma in this language
            $table->string('example_gloss', 500)->nullable();
            $table->unique(['italian_vocabulary_id', 'locale'], 'ivt_unique');
        });

        Schema::create('italian_exercises', function (Blueprint $table) {
            $table->id();
            $table->string('slug', 120)->unique();
            $table->string('type', 20);                       // multiple_choice | fill_blank | match | listening
            $table->string('level', 2);
            $table->string('scenario', 30)->nullable();
            $table->foreignId('italian_vocabulary_id')->nullable()->constrained()->nullOnDelete(); // practising this word updates its Leitner box
            $table->json('content');                          // language-neutral, type specific (answers live here, never exposed before an attempt)
            $table->string('audio_url', 2048)->nullable();
            $table->string('audio_rights_note', 500)->nullable();
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamp('reviewed_by_teacher_at')->nullable();
            $table->unsignedBigInteger('reviewed_by')->nullable();
            $table->contentLifecycle();
            $table->sourceFields();
            $table->unsignedBigInteger('created_by')->nullable();
            $table->unsignedBigInteger('updated_by')->nullable();
            $table->timestamps();
            $table->softDeletes();
            $table->index(['level', 'type', 'status']);
        });

        Schema::create('italian_exercise_translations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('italian_exercise_id')->constrained()->cascadeOnDelete();
            $table->string('locale', 2);
            $table->string('prompt', 500);
            $table->text('explanation')->nullable();
            $table->json('options')->nullable();             // localized choices (multiple_choice) / right-hand glosses (match)
            $table->unique(['italian_exercise_id', 'locale'], 'iet_unique');
        });

        Schema::create('italian_exercise_attempts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('italian_exercise_id')->constrained()->cascadeOnDelete();
            $table->boolean('correct');
            $table->timestamp('created_at')->useCurrent();
            $table->index(['user_id', 'created_at']);
            $table->index(['user_id', 'italian_exercise_id']);
        });

        // Leitner boxes: box 1 (new / missed) .. box 5 (mastered); due_at = when the card is next shown.
        Schema::create('italian_vocab_progress', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('italian_vocabulary_id')->constrained()->cascadeOnDelete();
            $table->unsignedTinyInteger('box')->default(1);
            $table->timestamp('due_at');
            $table->unsignedInteger('correct_count')->default(0);
            $table->unsignedInteger('wrong_count')->default(0);
            $table->timestamp('last_reviewed_at')->nullable();
            $table->timestamps();
            $table->unique(['user_id', 'italian_vocabulary_id'], 'ivp_unique');
            $table->index(['user_id', 'due_at']);
        });
    }

    public function down(): void
    {
        foreach (['italian_vocab_progress', 'italian_exercise_attempts', 'italian_exercise_translations', 'italian_exercises', 'italian_vocabulary_translations', 'italian_vocabularies'] as $t) {
            Schema::dropIfExists($t);
        }
    }
};
