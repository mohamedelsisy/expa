<?php

namespace Tests\Feature;

use App\Support\TrustedProxies;
use Illuminate\Http\Middleware\TrustProxies;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Tests\TestCase;

class TrustedProxiesTest extends TestCase
{
    protected function tearDown(): void
    {
        TrustProxies::at([]);
        Request::setTrustedProxies([], Request::HEADER_X_FORWARDED_FOR);
        parent::tearDown();
    }

    public function test_the_setting_is_parsed_from_config_values(): void
    {
        $this->assertNull(TrustedProxies::parse(null));
        $this->assertNull(TrustedProxies::parse('  '));
        $this->assertSame('*', TrustedProxies::parse('*'));
        $this->assertSame(['10.0.0.0/8', '172.16.0.1'], TrustedProxies::parse('10.0.0.0/8, 172.16.0.1'));
    }

    public function test_forwarded_for_is_honoured_only_from_a_configured_proxy_and_never_reads_env(): void
    {
        $this->assertStringNotContainsString('env(', file_get_contents(base_path('bootstrap/app.php')), 'bootstrap/app.php must not call env() (config cache)');

        TrustedProxies::apply('10.0.0.0/8');
        $call = fn (string $remote) => $this->withServerVariables(['REMOTE_ADDR' => $remote])
            ->withHeaders(['X-Forwarded-For' => '203.0.113.5'])->getJson('/api/v1/health');

        // the limiter key uses $request->ip(): observe it through the real middleware stack
        Route::middleware('api')->get('/api/v1/_ip', fn (Request $r) => response()->json(['ip' => $r->ip()]));
        $this->withServerVariables(['REMOTE_ADDR' => '10.1.2.3'])->withHeaders(['X-Forwarded-For' => '203.0.113.5'])->getJson('/api/v1/_ip')->assertJsonPath('ip', '203.0.113.5');
        $this->withServerVariables(['REMOTE_ADDR' => '198.51.100.1'])->withHeaders(['X-Forwarded-For' => '203.0.113.5'])->getJson('/api/v1/_ip')->assertJsonPath('ip', '198.51.100.1');
        $call('10.1.2.3')->assertOk();
    }
}
