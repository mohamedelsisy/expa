<?php

namespace Tests\Feature\Api;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Tests\TestCase;

class ApiFoundationTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        Route::middleware('api')->prefix('api/v1/_test')->group(function () {
            Route::post('validate', fn (Request $r) => $r->validate(['email' => 'required|email']));
            Route::get('protected', fn () => 'secret')->middleware('auth:sanctum');
            Route::get('forbidden', fn () => abort(403));
            Route::get('boom', fn () => throw new \RuntimeException('internal detail'));
            Route::get('throttled', fn () => 'ok')->middleware('throttle:1,1');
        });
    }

    public function test_health_returns_ok_envelope_with_default_arabic_locale(): void
    {
        // Symfony's test client injects an en-us default header; send an empty one to simulate "none".
        $this->getJson('/api/v1/health', ['Accept-Language' => ''])
            ->assertOk()
            ->assertExactJson(['data' => ['status' => 'ok'], 'meta' => ['locale' => 'ar']])
            ->assertHeader('Content-Language', 'ar');
    }

    public function test_locale_from_accept_language_header(): void
    {
        $this->getJson('/api/v1/health', ['Accept-Language' => 'it-IT,it;q=0.9,en;q=0.8'])
            ->assertJsonPath('meta.locale', 'it');
    }

    public function test_accept_language_respects_quality_values(): void
    {
        $this->getJson('/api/v1/health', ['Accept-Language' => 'it;q=0.4, en;q=0.9'])
            ->assertJsonPath('meta.locale', 'en');
    }

    public function test_unsupported_locale_falls_back_to_arabic(): void
    {
        $this->getJson('/api/v1/health', ['Accept-Language' => 'fr-FR,de;q=0.8'])
            ->assertJsonPath('meta.locale', 'ar');
    }

    public function test_lang_query_overrides_header(): void
    {
        $this->getJson('/api/v1/health?lang=en', ['Accept-Language' => 'it'])
            ->assertJsonPath('meta.locale', 'en');
    }

    public function test_invalid_lang_query_is_ignored(): void
    {
        $this->getJson('/api/v1/health?lang=xx', ['Accept-Language' => 'it'])
            ->assertJsonPath('meta.locale', 'it');
    }

    public function test_health_leaks_no_environment_details(): void
    {
        $body = $this->getJson('/api/v1/health')->getContent();

        $this->assertStringNotContainsString(app()->version(), $body);
        $this->assertStringNotContainsString(PHP_VERSION, $body);
    }

    public function test_unknown_route_returns_not_found_envelope(): void
    {
        $this->getJson('/api/v1/nope')
            ->assertNotFound()
            ->assertJsonPath('error.code', 'not_found');
    }

    public function test_validation_error_envelope_is_localized(): void
    {
        $this->postJson('/api/v1/_test/validate', [], ['Accept-Language' => 'en'])
            ->assertStatus(422)
            ->assertJsonPath('error.code', 'validation_failed')
            ->assertJsonPath('error.message', 'The submitted data is invalid.')
            ->assertJsonStructure(['error' => ['details' => ['email']]]);

        $this->postJson('/api/v1/_test/validate', [], ['Accept-Language' => 'ar'])
            ->assertJsonPath('error.message', 'البيانات المدخلة غير صحيحة.');

        $this->postJson('/api/v1/_test/validate', [], ['Accept-Language' => 'it'])
            ->assertJsonPath('error.message', 'I dati inseriti non sono validi.');
    }

    public function test_unauthenticated_returns_401_envelope(): void
    {
        $this->getJson('/api/v1/_test/protected', ['Accept-Language' => 'it'])
            ->assertUnauthorized()
            ->assertJsonPath('error.code', 'unauthenticated')
            ->assertJsonPath('error.message', 'Accedi per continuare.');
    }

    public function test_forbidden_returns_403_envelope(): void
    {
        $this->getJson('/api/v1/_test/forbidden')
            ->assertForbidden()
            ->assertJsonPath('error.code', 'forbidden');
    }

    public function test_rate_limit_returns_429_envelope(): void
    {
        $this->getJson('/api/v1/_test/throttled')->assertOk();
        $this->getJson('/api/v1/_test/throttled')
            ->assertStatus(429)
            ->assertJsonPath('error.code', 'too_many_requests');
    }

    public function test_unhandled_exception_does_not_leak_details_in_production_mode(): void
    {
        config(['app.debug' => false]);

        $response = $this->getJson('/api/v1/_test/boom')->assertStatus(500);

        $response->assertJsonPath('error.code', 'server_error');
        $this->assertStringNotContainsString('internal detail', $response->getContent());
    }

    public function test_every_error_key_exists_in_all_locales(): void
    {
        $keys = array_keys(require lang_path('en/errors.php'));

        foreach (array_keys(config('expa.locales')) as $locale) {
            $this->assertSame($keys, array_keys(require lang_path("$locale/errors.php")), "Missing keys in $locale");
        }
    }
}
