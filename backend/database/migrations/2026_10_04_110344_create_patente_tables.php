<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        foreach (['patente_categories', 'patente_topics'] as $t) {
            Schema::create($t, function (Blueprint $table) {
                $table->id();
                $table->string('slug', 120)->unique();
                $table->unsignedInteger('sort_order')->default(0);
                $table->contentLifecycle();
                $table->sourceFields();
                $table->unsignedBigInteger('created_by')->nullable();
                $table->unsignedBigInteger('updated_by')->nullable();
                $table->timestamps();
                $table->softDeletes();
            });
        }
        Schema::create('patente_category_translations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('patente_category_id')->constrained()->cascadeOnDelete();
            $table->string('locale', 2);
            $table->string('title');
            $table->text('summary')->nullable();
            $table->longText('body')->nullable();
            $table->unique(['patente_category_id', 'locale'], 'pc_tr_unique');
        });
        Schema::create('patente_topic_translations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('patente_topic_id')->constrained()->cascadeOnDelete();
            $table->string('locale', 2);
            $table->string('title');
            $table->text('summary')->nullable();
            $table->longText('body')->nullable();
            $table->unique(['patente_topic_id', 'locale'], 'pt_tr_unique');
        });

        Schema::create('patente_questions', function (Blueprint $table) {
            $table->id();
            $table->string('slug', 120)->unique();
            $table->foreignId('patente_topic_id')->constrained()->restrictOnDelete();
            $table->boolean('is_true');
            $table->string('rights_note', 500); // provenance + licence of this question text
            $table->unsignedInteger('sort_order')->default(0);
            $table->contentLifecycle();
            $table->sourceFields();
            $table->unsignedBigInteger('created_by')->nullable();
            $table->unsignedBigInteger('updated_by')->nullable();
            $table->timestamps();
            $table->softDeletes();
            $table->index(['patente_topic_id', 'status']);
        });
        Schema::create('patente_question_translations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('patente_question_id')->constrained()->cascadeOnDelete();
            $table->string('locale', 2);
            $table->text('statement');
            $table->text('explanation')->nullable();
            $table->unique(['patente_question_id', 'locale'], 'pq_tr_unique');
        });

        Schema::create('patente_exams', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('mode', 10); // exam | practice
            $table->json('question_ids');
            $table->unsignedSmallInteger('max_errors')->nullable();
            $table->timestamp('deadline_at')->nullable();
            $table->timestamp('finished_at')->nullable();
            $table->unsignedSmallInteger('correct')->nullable();
            $table->unsignedSmallInteger('errors')->nullable();
            $table->boolean('passed')->nullable();
            $table->boolean('timed_out')->default(false);
            $table->timestamps();
            $table->index(['user_id', 'finished_at']);
        });

        Schema::create('patente_exam_answers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete(); // denormalized for per-topic stats + privacy guard
            $table->foreignId('patente_exam_id')->constrained()->cascadeOnDelete();
            $table->foreignId('patente_question_id')->constrained()->cascadeOnDelete();
            $table->foreignId('patente_topic_id')->constrained()->cascadeOnDelete();
            $table->boolean('answer')->nullable(); // null = left unanswered
            $table->boolean('correct');
            $table->unique(['patente_exam_id', 'patente_question_id'], 'pea_unique');
            $table->index(['user_id', 'patente_topic_id']);
        });
    }

    public function down(): void
    {
        foreach (['patente_exam_answers', 'patente_exams', 'patente_question_translations', 'patente_questions', 'patente_topic_translations', 'patente_category_translations', 'patente_topics', 'patente_categories'] as $t) {
            Schema::dropIfExists($t);
        }
    }
};
