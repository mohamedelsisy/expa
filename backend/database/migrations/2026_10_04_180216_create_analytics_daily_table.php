<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Aggregate counters only: no user id, no IP, no per-event rows. Data minimization by construction.
        Schema::create('analytics_daily', function (Blueprint $table) {
            $table->id();
            $table->date('day');
            $table->string('name', 40);
            $table->string('platform', 10)->default('web');
            $table->string('locale', 2)->default('ar');
            $table->string('subject', 120)->default(''); // content slug for popularity (guide_view…), '' otherwise
            $table->unsignedBigInteger('count')->default(0);
            $table->unique(['day', 'name', 'platform', 'locale', 'subject'], 'analytics_daily_unique');
            $table->index(['name', 'day']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('analytics_daily');
    }
};
