<?php

namespace Tests\Feature;

use App\Console\Commands\Preflight;
use App\Domains\Access\Models\Role;
use App\Domains\Access\Services\AccessSynchronizer;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PreflightTest extends TestCase
{
    use RefreshDatabase;

    private function codes(bool $production = true, string $level = 'error', string $db = 'mysql'): array
    {
        return collect((new Preflight)->findings($production, $db))->where('level', $level)->pluck('code')->sort()->values()->all();
    }

    private function safeProduction(): void
    {
        app(AccessSynchronizer::class)->sync();
        config([
            'app.key' => 'base64:'.base64_encode(random_bytes(32)), 'app.debug' => false, 'app.url' => 'https://api.expa.test', 'expa.frontend_url' => 'https://expa.test',
            'queue.default' => 'redis', 'cache.default' => 'redis', 'cors.allowed_origins' => ['https://expa.test'],
            'sanctum.expiration' => 43200, 'ai.driver' => 'anthropic', 'ai.anthropic.api_key' => 'sk-test', 'billing.provider' => 'none',
            'jobs.ssrf_dns_check' => true, 'documents.encrypt_at_rest' => true, 'mail.default' => 'smtp', 'app.timezone' => 'Europe/Rome',
        ]);
    }

    public function test_a_correct_production_configuration_has_no_blocking_findings(): void
    {
        $this->safeProduction();
        $this->assertSame([], $this->codes());
        // the artisan command evaluates the real (SQLite) test connection, which is rightly flagged
        $this->artisan('expa:preflight', ['--production' => true])->expectsOutputToContain('[ERROR] sqlite')->assertFailed();
    }

    public function test_each_dangerous_setting_is_caught(): void
    {
        $this->safeProduction();
        $cases = [
            'debug_on' => ['app.debug', true], 'app_url_not_https' => ['app.url', 'http://api.expa.test'], 'frontend_url_not_https' => ['expa.frontend_url', 'http://expa.test'],
            'queue_sync' => ['queue.default', 'sync'], 'cache_array' => ['cache.default', 'array'],
            'cors_wildcard' => ['cors.allowed_origins', ['*']], 'token_no_expiry' => ['sanctum.expiration', null], 'app_key' => ['app.key', ''],
            'ai_key_missing' => ['ai.anthropic.api_key', null], 'billing_fake' => ['billing.provider', 'fake'], 'ssrf_check_off' => ['jobs.ssrf_dns_check', false],
            'documents_unencrypted' => ['documents.encrypt_at_rest', false],
        ];
        $this->assertContains('sqlite', $this->codes(db: 'sqlite'));
        foreach ($cases as $code => [$key, $value]) {
            $this->safeProduction();
            config([$key => $value]);
            $this->assertContains($code, $this->codes(), "$code should be flagged");
        }
    }

    public function test_missing_roles_block_a_launch_and_missing_plans_only_warn(): void
    {
        $this->safeProduction();
        Role::query()->delete();
        $this->assertContains('roles_missing', $this->codes());
        $this->assertContains('plans_missing', $this->codes(level: 'warning'));
    }

    public function test_hardening_gaps_are_warnings(): void
    {
        $this->safeProduction();
        config(['ai.driver' => 'fake', 'documents.scanner' => 'basic', 'mail.default' => 'log', 'app.timezone' => 'UTC', 'billing.provider' => 'none']);

        $this->assertEqualsCanonicalizing(['ai_fake', 'scanner_basic', 'mail_not_delivered', 'timezone', 'billing_none', 'plans_missing'], $this->codes(level: 'warning'));
    }

    public function test_outside_production_blocking_items_are_downgraded_to_warnings(): void
    {
        $this->safeProduction();
        config(['app.debug' => true, 'queue.default' => 'sync']);

        $this->assertSame([], $this->codes(production: false));
        $this->assertContains('debug_on', $this->codes(production: false, level: 'warning'));
    }

    public function test_command_fails_with_a_non_zero_exit_code_when_blocked(): void
    {
        $this->safeProduction();
        config(['app.debug' => true]);
        $this->artisan('expa:preflight', ['--production' => true])->expectsOutputToContain('[ERROR] debug_on')->expectsOutputToContain('FAILED')->assertFailed();
    }

    public function test_env_example_passes_structural_checks_when_adjusted_for_production(): void
    {
        // The shipped defaults must fail loudly in production (so nobody deploys them), not silently pass.
        $this->safeProduction();
        config(['app.debug' => true, 'queue.default' => 'sync', 'ai.driver' => 'fake']);
        $this->assertNotEmpty($this->codes());
    }
}
