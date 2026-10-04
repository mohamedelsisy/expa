<?php

namespace App\Console\Commands;

use App\Domains\Access\Models\Role;
use App\Domains\Billing\Models\Plan;
use Illuminate\Console\Command;

class Preflight extends Command
{
    protected $signature = 'expa:preflight {--production : Evaluate as production even when APP_ENV differs}';

    protected $description = 'Check the configuration for launch-blocking mistakes (run in CI/CD before every deploy)';

    /** @return list<array{level:string,code:string,message:string}> */
    public function findings(bool $production, ?string $dbDriver = null): array
    {
        $dbDriver ??= (string) config('database.connections.'.config('database.default').'.driver');
        $f = [];
        $add = function (string $level, string $code, string $message) use (&$f, $production) {
            // Outside production only structural problems matter; hardening items are informational.
            $f[] = ['level' => $production ? $level : ($level === 'error' ? 'warning' : $level), 'code' => $code, 'message' => $message];
        };

        if (blank(config('app.key'))) {
            $add('error', 'app_key', 'APP_KEY is not set (encryption, tokens and hashes depend on it).');
        }
        if (config('app.debug')) {
            $add('error', 'debug_on', 'APP_DEBUG must be false: debug pages leak configuration and stack traces.');
        }
        if (! str_starts_with((string) config('app.url'), 'https://')) {
            $add('error', 'app_url_not_https', 'APP_URL must be the https origin of the API (verification links and the web BFF depend on it).');
        }
        if (! str_starts_with((string) config('expa.frontend_url'), 'https://')) {
            $add('error', 'frontend_url_not_https', 'FRONTEND_URL must be https.');
        }
        if ($dbDriver === 'sqlite') {
            $add('error', 'sqlite', 'SQLite is not a production database: use MySQL 8 / MariaDB.');
        }
        if (config('queue.default') === 'sync') {
            $add('error', 'queue_sync', 'QUEUE_CONNECTION=sync runs imports, erasure and notifications inside web requests. Use redis/database + a worker.');
        }
        if (in_array(config('cache.default'), ['array', 'null'], true)) {
            $add('error', 'cache_array', 'CACHE_STORE=array/null breaks rate limiting across requests. Use redis/database.');
        }
        if (in_array('*', (array) config('cors.allowed_origins'), true)) {
            $add('error', 'cors_wildcard', 'CORS must list explicit origins, never *.');
        }
        if (config('sanctum.expiration') === null) {
            $add('error', 'token_no_expiry', 'API tokens must expire (SANCTUM_TOKEN_EXPIRATION).');
        }
        if (config('ai.driver') === 'anthropic' && blank(config('ai.anthropic.api_key'))) {
            $add('error', 'ai_key_missing', 'AI_DRIVER=anthropic needs ANTHROPIC_API_KEY (from the secret manager).');
        }
        if (config('ai.driver') === 'fake') {
            $add('warning', 'ai_fake', 'AI_DRIVER=fake: the assistant only returns scripted placeholder text.');
        }
        if (config('billing.provider') === 'fake') {
            $add('error', 'billing_fake', 'BILLING_PROVIDER=fake accepts forged webhooks from anyone who knows the shared secret. Never in production.');
        }
        if (config('billing.provider') === 'none') {
            $add('warning', 'billing_none', 'No payment provider configured: checkout is disabled.');
        }
        if (! config('jobs.ssrf_dns_check')) {
            $add('error', 'ssrf_check_off', 'JOBS_SSRF_DNS_CHECK must be true: it blocks feeds that resolve to private addresses.');
        }
        if (config('documents.scanner') === 'basic') {
            $add('warning', 'scanner_basic', 'Uploads are only heuristically checked. Bind a real antivirus scanner (ClamAV) before accepting real user documents.');
        }
        if (! config('documents.encrypt_at_rest')) {
            $add('error', 'documents_unencrypted', 'DOCUMENTS_ENCRYPT must be true.');
        }
        if (in_array(config('mail.default'), ['log', 'array'], true)) {
            $add('warning', 'mail_not_delivered', 'MAIL_MAILER does not deliver mail: verification and reset emails will not reach users.');
        }
        if (blank(config('expa.trusted_proxies'))) {
            $add('warning', 'trusted_proxies', 'TRUSTED_PROXIES is not set. Behind a load balancer every user shares the balancer\'s IP (shared rate limits) and signed links break; set it to the balancer addresses.');
        }
        if (config('app.timezone') !== 'Europe/Rome') {
            $add('warning', 'timezone', 'APP_TIMEZONE is not Europe/Rome: reminder days and the daily scheduler are computed in this zone.');
        }

        try {
            if (Role::count() === 0) {
                $add('error', 'roles_missing', 'Roles/permissions are not synced: run `php artisan expa:sync-access`.');
            }
            if (Plan::count() === 0) {
                $add('warning', 'plans_missing', 'No plans seeded: run `php artisan db:seed --class=PlanSeeder`.');
            }
        } catch (\Throwable) {
            $add('error', 'db_unreachable', 'Database is not reachable or migrations have not run.');
        }

        return $f;
    }

    public function handle(): int
    {
        $production = $this->option('production') || app()->isProduction();
        $findings = $this->findings($production);

        foreach ($findings as $x) {
            $this->line(sprintf('[%s] %s — %s', strtoupper($x['level']), $x['code'], $x['message']));
        }
        $errors = count(array_filter($findings, fn ($x) => $x['level'] === 'error'));
        $this->info($errors === 0 ? 'Preflight passed'.($findings ? ' (with warnings).' : '.') : "Preflight FAILED: $errors blocking issue(s).");

        return $errors === 0 ? self::SUCCESS : self::FAILURE;
    }
}
