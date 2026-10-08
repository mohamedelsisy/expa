<?php

namespace App\Console\Commands;

use App\Domains\Access\Models\Role;
use App\Domains\Billing\Models\Plan;
use App\Domains\Legal\Services\PolicyVersion;
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
            $add('error', 'ai_fake', 'AI_DRIVER=fake: the assistant only returns scripted placeholder text. Use AI_DRIVER=anthropic in production.');
        }
        if (config('ai.driver') === 'anthropic' && (int) config('ai.daily_token_budget') === 0) {
            $add('warning', 'ai_no_budget', 'AI_DAILY_TOKEN_BUDGET is 0 (no global cost circuit breaker). Per-user daily limits still apply.');
        }
        if (config('billing.provider') === 'fake') {
            $add('error', 'billing_fake', 'BILLING_PROVIDER=fake accepts forged webhooks from anyone who knows the shared secret. Never in production.');
        }
        if (config('billing.provider') === 'stripe' && (blank(config('billing.stripe.secret_key')) || blank(config('billing.stripe.webhook_secret')))) {
            $add('error', 'stripe_credentials_missing', 'BILLING_PROVIDER=stripe needs STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET (secret manager).');
        }
        if (config('billing.provider') === 'none') {
            $add('warning', 'billing_none', 'No payment provider configured: checkout is disabled.');
        }
        if (! config('jobs.ssrf_dns_check')) {
            $add('error', 'ssrf_check_off', 'JOBS_SSRF_DNS_CHECK must be true: it blocks feeds that resolve to private addresses.');
        }
        if (config('documents.scanner') === 'basic') {
            $add('error', 'scanner_basic', 'DOCUMENTS_SCANNER=basic only runs heuristics and is NOT an antivirus. Use DOCUMENTS_SCANNER=clamav (CLAMAV_HOST/CLAMAV_PORT or CLAMAV_SOCKET) in production.');
        }
        if (config('documents.scanner') === 'clamav' && ! config('documents.clamav.fail_closed')) {
            $add('error', 'scanner_fail_open', 'CLAMAV_FAIL_CLOSED must be true in production: uploads must be rejected when the antivirus is unreachable.');
        }
        if (! config('documents.encrypt_at_rest')) {
            $add('error', 'documents_unencrypted', 'DOCUMENTS_ENCRYPT must be true.');
        }
        if (in_array(config('mail.default'), ['log', 'array'], true)) {
            $add('error', 'mail_not_delivered', 'MAIL_MAILER=log/array does not deliver mail: verification and reset emails will not reach users (and unverified users cannot use AI or exams). Configure SMTP (MAIL_MAILER=smtp + MAIL_HOST/PORT/USERNAME/PASSWORD/FROM_ADDRESS).');
        }
        if (config('notifications.push_driver') === 'log') {
            $add('warning', 'push_stub', 'PUSH_DRIVER=log: push notifications are not delivered. Set PUSH_DRIVER=fcm with FCM_CREDENTIALS_PATH once the Firebase project exists.');
        }
        if (config('notifications.push_driver') === 'fcm' && blank(config('notifications.fcm.credentials_path')) && blank(config('notifications.fcm.credentials_json'))) {
            $add('error', 'fcm_credentials_missing', 'PUSH_DRIVER=fcm needs FCM_CREDENTIALS_PATH (or FCM_CREDENTIALS_JSON) from the secret manager.');
        }
        if (config('cache.default') === 'database') {
            $add('warning', 'cache_not_redis', 'CACHE_STORE=database: every request does cache writes (rate limits, locks). Use redis in staging/production (BE-9).');
        }
        if (config('queue.default') === 'database') {
            $add('warning', 'queue_not_redis', 'QUEUE_CONNECTION=database works but redis is recommended; supervise the worker (queue:work --timeout < retry_after) and the scheduler (BE-9).');
        }
        if (config('logging.level') === 'debug') {
            $add('warning', 'log_level_debug', 'LOG_LEVEL=debug in production writes every framework message. Use warning (BE-8).');
        }
        if (in_array('single', (array) config('logging.channels.stack.channels'), true) && config('logging.default') === 'stack') {
            $add('warning', 'log_single', 'LOG_STACK=single never rotates the log file. Use daily (LOG_DAILY_DAYS) or stderr/central logging (BE-8).');
        }
        if (config('expa.behind_proxy') && blank(config('expa.trusted_proxies'))) {
            $add('error', 'trusted_proxies', 'TRUSTED_PROXIES is not set while BEHIND_PROXY=true. Behind a load balancer every user shares the balancer\'s IP (one global rate-limit bucket) and signed links break; set it to the balancer addresses, or set BEHIND_PROXY=false if the API is exposed directly.');
        }
        if (config('app.timezone') !== 'Europe/Rome') {
            $add('warning', 'timezone', 'APP_TIMEZONE is not Europe/Rome: reminder days and the daily scheduler are computed in this zone.');
        }

        if (! config('content.four_eyes')) {
            $add('error', 'four_eyes_off', 'CONTENT_FOUR_EYES=false lets an author approve their own government/legal content. Keep it true in production.');
        }
        if (str_contains((string) config('privacy.policy_version'), 'draft') && ! PolicyVersion::isFromPublishedDocument()) {
            $add('warning', 'privacy_policy_draft', 'PRIVACY_POLICY_VERSION is a draft value and no privacy document is published. Publish the counsel-approved privacy policy through the legal workflow before launch.');
        }
        if (in_array(config('explainer.ocr.driver'), [null, 'null'], true)) {
            $add('warning', 'ocr_null', 'OCR_DRIVER=null: the document explainer cannot read uploaded images/PDF text. Configure an OCR driver or keep the feature to pasted text.');
        }
        if (! config('learning.require_teacher_review_to_publish')) {
            $add('warning', 'teacher_review_off', 'LEARNING_REQUIRE_TEACHER_REVIEW=false: Italian lessons/vocabulary can be published without a teacher review.');
        }

        try {
            if (config('community.enabled') && ! Role::where('key', 'moderator')->first()?->users()->exists()) {
                $add('warning', 'community_no_moderator', 'COMMUNITY_ENABLED=true but no user has the moderator role: reports and flagged posts will sit unreviewed.');
            }
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
