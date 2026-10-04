<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Absence of a row = "todo". Catalog (what exists, who it applies to) lives in config/setup.php.
        Schema::create('user_tasks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('task_key', 60);
            $table->string('status', 12); // done | dismissed (= "not applicable to me")
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();
            $table->unique(['user_id', 'task_key']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_tasks');
    }
};
