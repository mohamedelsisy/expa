<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * A listing is expired only after its original URL looked dead on several separate checks (expa:jobs-verify-links),
 * so we remember how many consecutive checks failed and when the last failing check was counted.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('job_listings', function (Blueprint $t) {
            if (! Schema::hasColumn('job_listings', 'link_failures')) {
                $t->unsignedTinyInteger('link_failures')->default(0);
            }
            if (! Schema::hasColumn('job_listings', 'link_checked_at')) {
                $t->timestamp('link_checked_at')->nullable();
            }
        });
    }

    public function down(): void
    {
        Schema::table('job_listings', fn (Blueprint $t) => $t->dropColumn(['link_failures', 'link_checked_at']));
    }
};
