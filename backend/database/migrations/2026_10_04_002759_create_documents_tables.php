<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('document_types', function (Blueprint $table) {
            $table->id();
            $table->string('key', 50)->unique();
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();
        });

        Schema::create('document_type_translations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('document_type_id')->constrained()->cascadeOnDelete();
            $table->string('locale', 2);
            $table->string('name');
            $table->unique(['document_type_id', 'locale']);
        });

        Schema::create('user_documents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('document_type_id')->constrained()->restrictOnDelete();
            $table->text('label')->nullable(); // encrypted
            $table->date('issue_date')->nullable();
            $table->date('expiry_date')->nullable();
            $table->text('notes')->nullable(); // encrypted
            $table->boolean('reminders_enabled')->default(true);
            $table->json('reminder_offsets')->nullable(); // null = default offsets
            $table->timestamps();
            $table->index(['user_id', 'expiry_date']);
            $table->index('expiry_date');
        });

        Schema::create('document_attachments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete(); // denormalized: quota + privacy coverage
            $table->foreignId('user_document_id')->constrained()->cascadeOnDelete();
            $table->string('storage_path'); // random, never derived from user input
            $table->text('original_name'); // encrypted
            $table->string('mime', 100);
            $table->unsignedBigInteger('size'); // bytes, plaintext size
            $table->string('sha256', 64);
            $table->boolean('encrypted')->default(true);
            $table->timestamp('created_at')->useCurrent();
            $table->index('user_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('document_attachments');
        Schema::dropIfExists('user_documents');
        Schema::dropIfExists('document_type_translations');
        Schema::dropIfExists('document_types');
    }
};
