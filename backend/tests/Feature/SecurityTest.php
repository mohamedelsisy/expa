<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Routing\Route as LaravelRoute;
use Illuminate\Support\Facades\Route;
use Tests\TestCase;

class SecurityTest extends TestCase
{
    use RefreshDatabase;

    /** @return list<LaravelRoute> */
    private function apiRoutes(): array
    {
        return collect(Route::getRoutes()->getRoutes())->filter(fn (LaravelRoute $r) => str_starts_with($r->uri(), 'api/v1/'))->values()->all();
    }

    private function concrete(LaravelRoute $r): string
    {
        $uri = preg_replace_callback('/\{(\w+)\??\}/', function ($m) use ($r) {
            $where = (string) ($r->wheres[$m[1]] ?? '');

            return match (true) {
                str_contains($where, '{8}') => '00000000-0000-4000-8000-000000000000', // whereUuid
                $m[1] === 'hash' => str_repeat('a', 40),
                $where !== '' && str_contains($where, '[0-9]') => '1',                // whereNumber
                $m[1] === 'id' => '1',
                default => 'x',
            };
        }, $r->uri());

        return '/'.$uri;
    }

    private function hit(LaravelRoute $r, ?User $as = null)
    {
        $method = collect($r->methods())->first(fn ($m) => ! in_array($m, ['HEAD', 'OPTIONS']));
        $this->app['auth']->forgetGuards();
        if ($as) {
            $this->actingAs($as, 'sanctum');
        }

        return $this->json($method, $this->concrete($r), []);
    }

    // ---- headers ------------------------------------------------------------------------------

    public function test_every_api_response_carries_the_security_headers(): void
    {
        foreach (['/api/v1/health', '/api/v1/nope', '/api/v1/guides'] as $uri) {
            $h = $this->getJson($uri)->headers;
            $this->assertSame('nosniff', $h->get('X-Content-Type-Options'), $uri);
            $this->assertSame('DENY', $h->get('X-Frame-Options'));
            $this->assertSame('no-referrer', $h->get('Referrer-Policy'));
            $this->assertStringContainsString("default-src 'none'", $h->get('Content-Security-Policy'));
            $this->assertStringContainsString('camera=()', $h->get('Permissions-Policy'));
        }
    }

    public function test_hsts_is_sent_over_https(): void
    {
        $this->assertNotNull($this->getJson('https://localhost/api/v1/health')->headers->get('Strict-Transport-Security'));
    }

    public function test_authenticated_responses_are_never_cacheable_but_public_cache_policy_is_kept(): void
    {
        $this->assertStringContainsString('max-age=300', $this->getJson('/api/v1/guides')->headers->get('Cache-Control')); // explicit public policy survives
        $this->assertStringContainsString('no-cache', $this->getJson('/api/v1/health')->headers->get('Cache-Control')); // anonymous, no explicit policy

        $u = User::factory()->create();
        $token = $u->createToken('t')->plainTextToken;
        $res = $this->withToken($token)->getJson('/api/v1/auth/me');
        $this->assertStringContainsString('no-store', $res->headers->get('Cache-Control'));
        $this->assertStringContainsString('private', $res->headers->get('Cache-Control'));

        // a token holder hitting a public endpoint must not leak personalised data into shared caches either
        $this->assertStringContainsString('max-age=300', $this->withToken($token)->getJson('/api/v1/guides')->headers->get('Cache-Control'));
    }

    // ---- surface area -------------------------------------------------------------------------

    public function test_no_default_web_page_and_storage_is_not_served(): void
    {
        $this->get('/')->assertNotFound();
        $this->get('/storage/anything')->assertNotFound();
        $this->assertFalse(config('filesystems.disks.local.serve'));
        $this->assertFalse(config('filesystems.disks.documents.serve'));
        $this->get('/up')->assertOk(); // the framework health route remains
    }

    public function test_global_api_rate_limit_exists(): void
    {
        // The global limiter reports itself on every API response, whichever route answers.
        foreach (['/api/v1/health', '/api/v1/guides', '/api/v1/regions'] as $uri) {
            $this->assertSame('180', $this->getJson($uri)->headers->get('X-RateLimit-Limit'), $uri);
        }
        for ($i = 0; $i < 180; $i++) {
            $this->getJson('/api/v1/health');
        }
        $this->getJson('/api/v1/health')->assertStatus(429)->assertJsonPath('error.code', 'too_many_requests');
    }

    // ---- authorization matrix -----------------------------------------------------------------

    public function test_every_authenticated_route_rejects_anonymous_callers(): void
    {
        $checked = 0;
        foreach ($this->apiRoutes() as $r) {
            if (! in_array('auth:sanctum', $r->gatherMiddleware(), true)) {
                continue;
            }
            $this->hit($r)->assertUnauthorized();
            $checked++;
        }
        $this->assertGreaterThan(60, $checked, 'the matrix should cover the whole authenticated surface');
    }

    public function test_every_admin_route_rejects_a_plain_user_and_never_leaks_data(): void
    {
        $user = User::factory()->create();
        $checked = 0;
        foreach ($this->apiRoutes() as $r) {
            if (! str_starts_with($r->uri(), 'api/v1/admin/')) {
                continue;
            }
            $res = $this->hit($r, $user);
            $this->assertSame(403, $res->status(), $r->methods()[0].' '.$r->uri().' → '.$this->concrete($r));
            $this->assertSame('forbidden', $res->json('error.code'), $r->uri());
            $checked++;
        }
        $this->assertGreaterThan(50, $checked);
    }

    public function test_public_routes_are_exactly_the_intended_set(): void
    {
        $public = collect($this->apiRoutes())->reject(fn (LaravelRoute $r) => in_array('auth:sanctum', $r->gatherMiddleware(), true))
            ->map(fn (LaravelRoute $r) => preg_replace('#\{[^}]+\}#', '{x}', $r->uri()))->unique()->sort()->values()->all();

        $allowed = ['api/v1/profile/options']; // localized option labels for onboarding: reference data
        foreach ($public as $uri) {
            if (! in_array($uri, $allowed, true)) {
                $this->assertDoesNotMatchRegularExpression('#/(admin|export|profile)(/|$)#', $uri, "$uri must not be public");
            }
        }
        $this->assertContains('api/v1/auth/login', $public);
        $this->assertNotContains('api/v1/my-documents', $public);
        $this->assertNotContains('api/v1/notifications', $public);
        $this->assertNotContains('api/v1/ai/ask', $public);
    }

    // ---- code hygiene guards ------------------------------------------------------------------

    public function test_controllers_never_mass_assign_raw_request_data(): void
    {
        $offenders = [];
        foreach (new \RecursiveIteratorIterator(new \RecursiveDirectoryIterator(app_path('Http/Controllers'))) as $f) {
            if ($f->isFile() && preg_match('/(create|fill|update|forceFill|firstOrCreate|updateOrCreate)\(\s*\$request->(all|input)\(\)/', file_get_contents($f->getPathname()))) {
                $offenders[] = $f->getFilename();
            }
        }
        $this->assertSame([], $offenders);
    }

    public function test_debug_mode_never_leaks_in_production_error_responses(): void
    {
        config(['app.debug' => false]);
        Route::middleware('api')->get('api/v1/_test/boom', fn () => throw new \RuntimeException('secret internal path /etc/passwd'));

        $body = $this->getJson('/api/v1/_test/boom')->assertStatus(500)->getContent();
        $this->assertStringNotContainsString('/etc/passwd', $body);
        $this->assertStringNotContainsString('trace', $body);
        $this->assertStringNotContainsString('RuntimeException', $body);
    }

    public function test_env_example_ships_safe_defaults_and_no_secrets(): void
    {
        $env = file_get_contents(base_path('.env.example'));
        $this->assertDoesNotMatchRegularExpression('/^(ANTHROPIC_API_KEY|DB_PASSWORD|MAIL_PASSWORD|AWS_SECRET_ACCESS_KEY)=(?!null$)(?!$).+$/m', $env);
        $this->assertStringContainsString('AI_DRIVER=fake', $env);
    }

    public function test_admin_ids_cannot_be_enumerated_by_unauthorised_callers(): void
    {
        $target = User::factory()->create();
        $this->actingAs(User::factory()->create(), 'sanctum');

        $existing = $this->getJson("/api/v1/admin/users/{$target->id}")->status();
        $missing = $this->getJson('/api/v1/admin/users/999999')->status();
        $this->assertSame([403, 403], [$existing, $missing], 'existing and missing ids must be indistinguishable');
    }
}
