<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // One row per VERSION of a legal document (privacy | terms | cookies). `slug` identifies the document, not the row.
        Schema::create('legal_documents', function (Blueprint $table) {
            $table->id();
            $table->string('slug', 40);
            $table->string('version', 20); // also stored in consents.policy_version (privacy), hence the same length
            $table->unsignedInteger('sort_order')->default(0);
            $table->contentLifecycle();
            $table->sourceFields(); // optional for legal text (counsel approval reference); never required to publish
            $table->unsignedBigInteger('created_by')->nullable();
            $table->unsignedBigInteger('updated_by')->nullable();
            $table->timestamps();
            $table->softDeletes();
            $table->index(['slug', 'status']);
            $table->unique(['slug', 'version']);
        });

        Schema::create('legal_document_translations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('legal_document_id')->constrained()->cascadeOnDelete();
            $table->string('locale', 2);
            $table->string('title');
            $table->longText('body')->nullable();
            $table->unique(['legal_document_id', 'locale'], 'ldt_unique');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('legal_document_translations');
        Schema::dropIfExists('legal_documents');
    }
};
