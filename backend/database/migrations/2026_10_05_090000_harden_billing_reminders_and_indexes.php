<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Production-audit hardening (BE-7, BE-27, BE-28, BE-30) plus the billing columns the dunning / invoicing / VAT
 * architecture needs. Additive and reversible; no data is rewritten.
 */
return new class extends Migration
{
    public function up(): void
    {
        // BE-7: outbox semantics. `notified_at` is set by the listener only after the user was actually notified.
        Schema::table('reminders', function (Blueprint $table) {
            $table->timestamp('notified_at')->nullable();
            $table->unsignedTinyInteger('attempts')->default(0);
        });

        // BE-30: retention jobs and public job filters.
        Schema::table('user_notifications', fn (Blueprint $t) => $t->index('created_at', 'user_notifications_created_at_index'));
        Schema::table('job_import_runs', fn (Blueprint $t) => $t->index('started_at', 'job_import_runs_started_at_index'));
        Schema::table('job_listings', function (Blueprint $t) {
            $t->index(['status', 'category'], 'job_listings_status_category_index');
            $t->index(['status', 'remote_mode'], 'job_listings_status_remote_index');
            $t->index(['status', 'employment_type'], 'job_listings_status_employment_index');
        });

        // BE-27: uniqueness the handler relies on (NULLs stay allowed: manual grants have no provider_ref).
        Schema::table('subscriptions', function (Blueprint $t) {
            $t->unique(['provider', 'provider_ref'], 'subscriptions_provider_ref_unique');
            $t->timestamp('past_due_since')->nullable();
            $t->timestamp('grace_ends_at')->nullable();
            $t->unsignedTinyInteger('dunning_step')->default(0);
        });
        Schema::table('subscription_items', function (Blueprint $t) {
            $t->string('slot', 40)->default('base'); // addon_key or 'base'; unique below (a nullable addon_key could not be)
            $t->unique(['subscription_id', 'slot'], 'subscription_items_slot_unique');
        });
        Schema::table('invoices', function (Blueprint $t) {
            $t->unique('payment_id', 'invoices_payment_id_unique');
            // Tax lines exist only when a VAT rate was configured for the plan / country (never invented).
            $t->unsignedInteger('net_minor')->nullable();
            $t->unsignedInteger('tax_minor')->nullable();
            $t->decimal('tax_rate', 5, 2)->nullable();
            $t->string('tax_country', 2)->nullable();
        });
        Schema::table('payments', fn (Blueprint $t) => $t->timestamp('refunded_at')->nullable());

        // VAT architecture: per-plan override + per-country table that ships EMPTY (rates must be entered and verified by a human).
        Schema::table('plans', function (Blueprint $t) {
            $t->decimal('vat_rate', 5, 2)->nullable();
            $t->boolean('price_includes_vat')->default(true);
        });
        Schema::create('tax_rates', function (Blueprint $t) {
            $t->id();
            $t->string('country', 2);
            $t->string('label', 60)->default('VAT');
            $t->decimal('rate', 5, 2);
            $t->date('valid_from')->nullable();
            $t->string('source_url', 2048)->nullable();
            $t->timestamp('verified_at')->nullable(); // only verified rates are ever applied
            $t->timestamps();
            $t->unique(['country', 'label', 'valid_from']);
        });

        // Gap-free invoice numbering per year (row-locked increment inside the payment transaction).
        Schema::create('invoice_sequences', function (Blueprint $t) {
            $t->unsignedSmallInteger('year')->primary();
            $t->unsignedInteger('last_number')->default(0);
        });

        // BE-28: a hard delete of a user must fail loudly instead of silently destroying legally retained rows.
        foreach (['payments', 'invoices', 'consents'] as $table) {
            Schema::table($table, function (Blueprint $t) {
                $t->dropForeign(['user_id']);
                $t->foreign('user_id')->references('id')->on('users')->restrictOnDelete();
            });
        }
    }

    public function down(): void
    {
        foreach (['payments', 'invoices', 'consents'] as $table) {
            Schema::table($table, function (Blueprint $t) {
                $t->dropForeign(['user_id']);
                $t->foreign('user_id')->references('id')->on('users')->cascadeOnDelete();
            });
        }
        Schema::dropIfExists('invoice_sequences');
        Schema::dropIfExists('tax_rates');
        Schema::table('plans', fn (Blueprint $t) => $t->dropColumn(['vat_rate', 'price_includes_vat']));
        Schema::table('payments', fn (Blueprint $t) => $t->dropColumn('refunded_at'));
        Schema::table('invoices', function (Blueprint $t) {
            $t->dropUnique('invoices_payment_id_unique');
            $t->dropColumn(['net_minor', 'tax_minor', 'tax_rate', 'tax_country']);
        });
        Schema::table('subscription_items', function (Blueprint $t) {
            $t->dropUnique('subscription_items_slot_unique');
            $t->dropColumn('slot');
        });
        Schema::table('subscriptions', function (Blueprint $t) {
            $t->dropUnique('subscriptions_provider_ref_unique');
            $t->dropColumn(['past_due_since', 'grace_ends_at', 'dunning_step']);
        });
        Schema::table('job_listings', function (Blueprint $t) {
            $t->dropIndex('job_listings_status_category_index');
            $t->dropIndex('job_listings_status_remote_index');
            $t->dropIndex('job_listings_status_employment_index');
        });
        Schema::table('job_import_runs', fn (Blueprint $t) => $t->dropIndex('job_import_runs_started_at_index'));
        Schema::table('user_notifications', fn (Blueprint $t) => $t->dropIndex('user_notifications_created_at_index'));
        Schema::table('reminders', fn (Blueprint $t) => $t->dropColumn(['notified_at', 'attempts']));
    }
};
