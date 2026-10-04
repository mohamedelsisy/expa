<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('guides', function (Blueprint $table) {
            $table->id();
            $table->string('slug', 120)->unique();
            $table->string('category', 30)->index();
            $table->string('italian_term')->nullable(); // official Italian name, shown beside the Arabic/English title
            $table->foreignId('region_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('city_id')->nullable()->constrained()->nullOnDelete();
            $table->unsignedInteger('sort_order')->default(0);
            $table->contentLifecycle();
            $table->sourceFields();
            $table->unsignedBigInteger('created_by')->nullable()->index();
            $table->unsignedBigInteger('updated_by')->nullable();
            $table->timestamps();
            $table->softDeletes();
            $table->index(['status', 'category']);
        });

        Schema::create('guide_translations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('guide_id')->constrained()->cascadeOnDelete();
            $table->string('locale', 2);
            $table->string('title');
            $table->text('summary')->nullable();
            $table->text('what_is')->nullable();
            $table->text('who_needs')->nullable();
            $table->json('required_documents')->nullable();
            $table->json('steps')->nullable();
            $table->text('where_to_apply')->nullable();
            $table->text('how_to_book')->nullable();
            $table->text('costs')->nullable();
            $table->string('processing_time')->nullable();
            $table->longText('body')->nullable();
            $table->unique(['guide_id', 'locale']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('guide_translations');
        Schema::dropIfExists('guides');
    }
};
