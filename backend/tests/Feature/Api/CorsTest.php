<?php

namespace Tests\Feature\Api;

use Tests\TestCase;

class CorsTest extends TestCase
{
    public function test_allowed_origin_gets_cors_headers_on_preflight(): void
    {
        config(['cors.allowed_origins' => ['https://app.expa.test']]);

        $res = $this->call('OPTIONS', '/api/v1/auth/login', [], [], [], [
            'HTTP_ORIGIN' => 'https://app.expa.test',
            'HTTP_ACCESS_CONTROL_REQUEST_METHOD' => 'POST',
            'HTTP_ACCESS_CONTROL_REQUEST_HEADERS' => 'content-type,accept-language,x-client',
        ]);

        $res->assertNoContent();
        $this->assertSame('https://app.expa.test', $res->headers->get('Access-Control-Allow-Origin'));
        $this->assertStringContainsString('accept-language', strtolower($res->headers->get('Access-Control-Allow-Headers')));
    }

    public function test_unknown_origin_is_not_granted_access(): void
    {
        config(['cors.allowed_origins' => ['https://app.expa.test']]);

        $res = $this->getJson('/api/v1/health', ['Origin' => 'https://evil.example.com']);

        // The only origin ever advertised is the allow-listed one; a browser at evil.example.com is rejected.
        $this->assertNotSame('https://evil.example.com', $res->headers->get('Access-Control-Allow-Origin'));
        $this->assertNotSame('*', $res->headers->get('Access-Control-Allow-Origin'));
    }

    public function test_default_allow_list_is_not_a_wildcard(): void
    {
        $this->assertNotContains('*', config('cors.allowed_origins'));
    }
}
