<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Derived index over PUBLIC content only (rebuildable with `expa:search-reindex`).
        Schema::create('search_documents', function (Blueprint $table) {
            $table->id();
            $table->string('type', 30); // guide | government_service | government_office | appointment_guide | italian_lesson | patente_topic | patente_category | job
            $table->unsignedBigInteger('item_id');
            $table->string('slug', 120)->nullable();
            $table->string('locale', 2)->nullable(); // null = language-neutral (jobs)
            $table->string('title');
            $table->text('summary')->nullable();
            $table->string('search_title');
            $table->text('search_text');
            $table->json('meta')->nullable();
            $table->timestamps();
            $table->unique(['type', 'item_id', 'locale']);
            $table->index(['type', 'locale']);
            $table->index('search_title');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('search_documents');
    }
};
