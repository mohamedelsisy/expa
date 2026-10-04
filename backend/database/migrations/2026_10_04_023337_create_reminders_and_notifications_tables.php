<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Materialized reminder schedule: one row per (document, offset). Idempotency lives in the unique key.
        Schema::create('reminders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_document_id')->constrained()->cascadeOnDelete();
            $table->string('kind', 10); // before | expired
            $table->integer('offset_days'); // days before expiry; -1 for the "expired" notice
            $table->date('remind_on');
            $table->string('status', 12)->default('pending'); // pending | dispatched | skipped
            $table->timestamp('dispatched_at')->nullable();
            $table->timestamps();
            $table->unique(['user_document_id', 'kind', 'offset_days']);
            $table->index(['status', 'remind_on']);
        });

        Schema::create('user_notifications', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('type', 60);
            $table->json('data'); // structured, locale-neutral; text is rendered when read/sent
            $table->timestamp('read_at')->nullable();
            $table->timestamp('created_at')->useCurrent();
            $table->index(['user_id', 'read_at']);
            $table->index(['user_id', 'created_at']);
        });

        Schema::create('device_tokens', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('platform', 10); // ios | android | web
            $table->string('token', 512);
            $table->timestamp('last_used_at')->nullable();
            $table->timestamps();
            $table->unique('token');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('device_tokens');
        Schema::dropIfExists('user_notifications');
        Schema::dropIfExists('reminders');
    }
};
