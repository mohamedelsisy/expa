<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('community_questions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete(); // null after erasure (anonymised, thread kept)
            $table->string('locale', 2);
            $table->string('title', 200);
            $table->text('body');
            $table->string('topic', 30)->nullable()->index();
            $table->foreignId('city_id')->nullable()->constrained()->nullOnDelete();
            $table->string('status', 10)->default('pending')->index(); // pending | approved | hidden | removed
            $table->string('moderation_reason', 255)->nullable();
            $table->unsignedBigInteger('moderated_by')->nullable();
            $table->timestamp('moderated_at')->nullable();
            $table->boolean('flagged')->default(false); // contained links / was stripped: moderators look first
            $table->boolean('shadowed')->default(false); // author shadow-banned: visible to the author only
            $table->foreignId('official_guide_id')->nullable()->constrained('guides')->nullOnDelete(); // moderator-pinned official guide
            $table->unsignedBigInteger('accepted_answer_id')->nullable();
            $table->unsignedInteger('answers_count')->default(0);
            $table->integer('votes_count')->default(0);
            $table->string('content_hash', 64)->index();
            $table->timestamps();
            $table->softDeletes();
            $table->index(['status', 'created_at']);
        });
        Schema::create('community_question_tags', function (Blueprint $table) {
            $table->foreignId('question_id')->constrained('community_questions')->cascadeOnDelete();
            $table->string('tag', 40);
            $table->primary(['question_id', 'tag']);
            $table->index('tag');
        });
        Schema::create('community_answers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('question_id')->constrained('community_questions')->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('locale', 2);
            $table->text('body');
            $table->string('status', 10)->default('pending')->index();
            $table->string('moderation_reason', 255)->nullable();
            $table->unsignedBigInteger('moderated_by')->nullable();
            $table->timestamp('moderated_at')->nullable();
            $table->boolean('flagged')->default(false);
            $table->boolean('shadowed')->default(false);
            $table->integer('votes_count')->default(0);
            $table->string('content_hash', 64)->index();
            $table->timestamps();
            $table->softDeletes();
            $table->index(['question_id', 'status']);
        });
        Schema::create('community_comments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('question_id')->constrained('community_questions')->cascadeOnDelete();
            $table->foreignId('answer_id')->nullable()->constrained('community_answers')->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->text('body');
            $table->string('status', 10)->default('pending')->index();
            $table->string('moderation_reason', 255)->nullable();
            $table->unsignedBigInteger('moderated_by')->nullable();
            $table->timestamp('moderated_at')->nullable();
            $table->boolean('flagged')->default(false);
            $table->boolean('shadowed')->default(false);
            $table->string('content_hash', 64)->index();
            $table->timestamps();
            $table->softDeletes();
        });
        Schema::create('community_votes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('votable_type', 10); // question | answer
            $table->unsignedBigInteger('votable_id');
            $table->timestamps();
            $table->unique(['user_id', 'votable_type', 'votable_id']); // one vote per user per item
        });
        Schema::create('community_restrictions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained()->cascadeOnDelete();
            $table->boolean('shadow_banned')->default(false);
            $table->timestamp('muted_until')->nullable();
            $table->string('reason', 255)->nullable();
            $table->unsignedBigInteger('set_by')->nullable();
            $table->timestamps();
        });
        Schema::create('community_blocks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete(); // the blocker
            $table->foreignId('blocked_user_id')->constrained('users')->cascadeOnDelete();
            $table->timestamps();
            $table->unique(['user_id', 'blocked_user_id']);
        });
    }

    public function down(): void
    {
        foreach (['community_blocks', 'community_restrictions', 'community_votes', 'community_comments', 'community_answers', 'community_question_tags', 'community_questions'] as $t) {
            Schema::dropIfExists($t);
        }
    }
};
