<?php

namespace Tests\Feature\Security;

use App\Http\Middleware\EnsureAccountActive;
use App\Http\Middleware\EnsureEmailIsVerified;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Routing\Route as LaravelRoute;
use Illuminate\Support\Facades\Route;
use Tests\TestCase;

/** Structural guarantees over the whole route table, so a new module cannot silently ship an unprotected route. */
class RouteHardeningTest extends TestCase
{
    use RefreshDatabase;

    /** @return list<LaravelRoute> */
    private function routes(): array
    {
        return collect(Route::getRoutes()->getRoutes())->filter(fn (LaravelRoute $r) => str_starts_with($r->uri(), 'api/v1/'))->values()->all();
    }

    public function test_every_anonymous_write_route_is_throttled(): void
    {
        $offenders = [];
        foreach ($this->routes() as $r) {
            $mw = $r->gatherMiddleware();
            $writes = array_intersect($r->methods(), ['POST', 'PUT', 'PATCH', 'DELETE']);
            if ($writes && ! in_array('auth:sanctum', $mw, true) && ! collect($mw)->contains(fn ($m) => is_string($m) && str_starts_with($m, 'throttle:'))) {
                $offenders[] = $r->uri();
            }
        }
        $this->assertSame([], $offenders);
    }

    public function test_every_admin_route_declares_a_permission_gate(): void
    {
        $offenders = [];
        foreach ($this->routes() as $r) {
            if (! str_starts_with($r->uri(), 'api/v1/admin/')) {
                continue;
            }
            $gated = collect($r->gatherMiddleware())->contains(fn ($m) => is_string($m) && str_starts_with($m, 'can:'));
            // lookups/{kind} authorises per kind inside the controller (asserted by the admin matrix test)
            if (! $gated && ! str_starts_with($r->uri(), 'api/v1/admin/lookups/')) {
                $offenders[] = $r->uri();
            }
        }
        $this->assertSame([], $offenders);
    }

    public function test_admin_and_user_data_routes_require_a_verified_email_and_active_account(): void
    {
        foreach ($this->routes() as $r) {
            if (str_starts_with($r->uri(), 'api/v1/admin/')) {
                $this->assertContains(EnsureEmailIsVerified::class, $r->gatherMiddleware(), $r->uri());
            }
            if (in_array('auth:sanctum', $r->gatherMiddleware(), true)) {
                $this->assertContains(EnsureAccountActive::class, $r->gatherMiddleware(), $r->uri().' must refuse suspended accounts');
            }
        }
    }

    public function test_public_listing_endpoints_never_accept_unbounded_page_sizes(): void
    {
        foreach (['providers', 'jobs', 'study/programs', 'articles', 'community/questions', 'italian/vocabulary'] as $ep) {
            config(['community.enabled' => true]);
            $res = $this->getJson("/api/v1/$ep?per_page=100000");
            $this->assertContains($res->status(), [200, 422], $ep);
            if ($res->status() === 200 && isset($res->json('meta')['per_page'])) {
                $this->assertLessThanOrEqual(100, $res->json('meta.per_page'), $ep);
            }
        }
    }
}
