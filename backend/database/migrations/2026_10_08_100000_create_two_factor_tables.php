<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('user_two_factor_credentials', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained()->cascadeOnDelete();
            $table->text('secret'); // encrypted (APP_KEY) via the model cast
            $table->timestamp('confirmed_at')->nullable(); // null = setup started, not active
            $table->unsignedBigInteger('last_used_step')->nullable(); // RFC 6238 time step of the last accepted code (replay protection)
            $table->timestamps();
        });

        Schema::create('user_recovery_codes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('code_hash', 64); // HMAC-SHA256, never the plain code
            $table->timestamp('used_at')->nullable();
            $table->timestamps();
            $table->index(['user_id', 'code_hash']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_recovery_codes');
        Schema::dropIfExists('user_two_factor_credentials');
    }
};
