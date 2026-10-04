<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('plans', function (Blueprint $table) {
            $table->id();
            $table->string('key', 30)->unique();
            $table->string('interval', 10); // none | month | year
            $table->unsignedInteger('price_minor')->default(0); // euro cents; configurable, never hard-coded
            $table->string('currency', 3)->default('EUR');
            $table->json('features')->nullable();
            $table->boolean('active')->default(true);
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();
        });
        Schema::create('plan_translations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('plan_id')->constrained()->cascadeOnDelete();
            $table->string('locale', 2);
            $table->string('name');
            $table->text('description')->nullable();
            $table->unique(['plan_id', 'locale']);
        });

        Schema::create('subscriptions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('plan_id')->constrained()->restrictOnDelete();
            $table->string('status', 12); // active | trialing | past_due | canceled | expired
            $table->string('provider', 20);
            $table->string('provider_ref')->nullable()->index();
            $table->timestamp('current_period_start')->nullable();
            $table->timestamp('current_period_end')->nullable();
            $table->boolean('cancel_at_period_end')->default(false);
            $table->timestamp('canceled_at')->nullable();
            $table->timestamp('trial_ends_at')->nullable();
            $table->timestamps();
            $table->index(['user_id', 'status']);
        });

        Schema::create('subscription_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('subscription_id')->constrained()->cascadeOnDelete();
            $table->string('kind', 10)->default('base'); // base | addon (future: human-assistance credit packs)
            $table->foreignId('plan_id')->nullable()->constrained()->nullOnDelete();
            $table->string('addon_key', 40)->nullable();
            $table->unsignedSmallInteger('quantity')->default(1);
            $table->unsignedInteger('unit_price_minor')->default(0);
            $table->timestamps();
        });

        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('subscription_id')->nullable()->constrained()->nullOnDelete();
            $table->unsignedInteger('amount_minor');
            $table->string('currency', 3);
            $table->string('status', 12); // pending | succeeded | failed | refunded
            $table->string('provider', 20);
            $table->string('provider_ref')->nullable();
            $table->string('failure_code', 60)->nullable();
            $table->string('subscription_ref')->nullable()->index(); // provider's subscription id: lets an early payment be linked later
            $table->timestamp('paid_at')->nullable();
            $table->timestamps();
            $table->unique(['provider', 'provider_ref']);
        });

        Schema::create('invoices', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('payment_id')->nullable()->constrained()->nullOnDelete();
            $table->string('number', 40)->unique();
            $table->unsignedInteger('total_minor');
            $table->string('currency', 3);
            $table->string('description');
            $table->timestamp('issued_at');
            $table->timestamps();
        });

        // Non-sensitive metadata only. Card numbers / CVC never touch EXPA (the provider holds them).
        Schema::create('payment_methods', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('provider', 20);
            $table->string('provider_ref');
            $table->string('brand', 20)->nullable();
            $table->string('last4', 4)->nullable();
            $table->unsignedTinyInteger('exp_month')->nullable();
            $table->unsignedSmallInteger('exp_year')->nullable();
            $table->boolean('is_default')->default(false);
            $table->timestamps();
            $table->unique(['provider', 'provider_ref']);
        });

        // Webhook idempotency: each provider event is processed at most once.
        Schema::create('billing_events', function (Blueprint $table) {
            $table->id();
            $table->string('provider', 20);
            $table->string('event_id', 100);
            $table->string('type', 60);
            $table->string('subject_ref')->nullable(); // subscription the event concerned (cancellation tombstones)
            $table->timestamp('processed_at');
            $table->unique(['provider', 'event_id']);
        });
    }

    public function down(): void
    {
        foreach (['billing_events', 'payment_methods', 'invoices', 'payments', 'subscription_items', 'subscriptions', 'plan_translations', 'plans'] as $t) {
            Schema::dropIfExists($t);
        }
    }
};
