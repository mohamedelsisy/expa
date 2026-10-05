<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Derived retrieval index over PUBLISHED content only; rebuilt from source of truth at any time.
        Schema::create('knowledge_chunks', function (Blueprint $table) {
            $table->id();
            $table->string('item_type', 30); // guide | government_service | government_office | appointment_guide
            $table->unsignedBigInteger('item_id');
            $table->string('item_slug', 120);
            $table->string('locale', 2);
            $table->string('section', 40);
            $table->string('title');
            $table->text('content');
            $table->text('search_text'); // normalized title + italian term + content
            $table->string('source_name');
            $table->string('source_url', 2048);
            $table->string('source_type', 20);
            $table->timestamp('last_verified_at')->nullable();
            $table->timestamps();
            $table->index(['item_type', 'item_id']);
            $table->index('locale');
        });

        Schema::create('ai_conversations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('locale', 2);
            $table->text('title')->nullable(); // encrypted
            $table->timestamps();
            $table->index(['user_id', 'updated_at']);
        });

        Schema::create('ai_messages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('ai_conversation_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete(); // denormalized for retention + privacy guard
            $table->string('role', 10); // user | assistant
            $table->longText('content'); // encrypted
            $table->string('intent', 30)->nullable();
            $table->string('label', 20)->nullable(); // official | general_guidance | ai_explanation | third_party
            $table->json('sources')->nullable();
            $table->json('actions')->nullable();
            $table->text('disclaimer')->nullable(); // localized safety note shown separately from the answer text
            $table->boolean('degraded')->default(false);
            $table->unsignedInteger('input_tokens')->nullable();
            $table->unsignedInteger('output_tokens')->nullable();
            $table->timestamp('created_at')->useCurrent();
            $table->index('user_id');
            $table->index('created_at');
        });

        Schema::create('ai_usage', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->date('day');
            $table->unsignedInteger('count')->default(0);
            $table->unique(['user_id', 'day']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ai_usage');
        Schema::dropIfExists('ai_messages');
        Schema::dropIfExists('ai_conversations');
        Schema::dropIfExists('knowledge_chunks');
    }
};
