<?php

use App\Exceptions\ApiException;
use App\Http\Middleware\SecurityHeaders;
use App\Http\Middleware\SetLocale;
use App\Support\ApiResponse;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Auth\Middleware\Authorize;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Foundation\Http\Kernel;
use Illuminate\Http\Request;
use Illuminate\Routing\Middleware\SubstituteBindings;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\HttpKernel\Exception\TooManyRequestsHttpException;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        // Authorize BEFORE implicit model binding, so callers without permission get 403 for every id
        // (otherwise 404-vs-403 reveals which ids exist). The framework default order is used with `Authorize` moved up.
        $default = (new ReflectionClass(Kernel::class))->getDefaultProperties()['middlewarePriority'];
        $default = array_values(array_diff($default, [Authorize::class]));
        array_splice($default, array_search(SubstituteBindings::class, $default, true), 0, [Authorize::class]);
        $middleware->priority($default);
        // Behind a TLS-terminating load balancer the client IP (rate limits) and scheme (signed URLs) come from forwarded
        // headers: only honour them from explicitly trusted proxies (TRUSTED_PROXIES="10.0.0.0/8,..." or "*" on a private network).
        $proxies = env('TRUSTED_PROXIES');
        $middleware->trustProxies(at: $proxies === '*' ? '*' : ($proxies ? array_map('trim', explode(',', $proxies)) : null));
        $middleware->append(SecurityHeaders::class); // global: also covers unmatched routes and framework errors
        $middleware->api(prepend: [SetLocale::class]);
        // Global safety net for every API route (specific limiters such as login/ai/search stay stricter).
        $middleware->api(append: ['throttle:api']);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $isApi = fn (Request $request) => $request->is('api/*') || $request->expectsJson();

        $exceptions->shouldRenderJsonWhen($isApi);

        $exceptions->render(function (ApiException $e, Request $request) use ($isApi) {
            if ($isApi($request)) {
                return ApiResponse::error($e->errorCode, $e->getMessage(), $e->status, $e->details);
            }
        });
        $exceptions->render(function (ValidationException $e, Request $request) use ($isApi) {
            if ($isApi($request)) {
                return ApiResponse::error('validation_failed', __('errors.validation_failed'), 422, $e->errors());
            }
        });
        $exceptions->render(function (AuthenticationException $e, Request $request) use ($isApi) {
            if ($isApi($request)) {
                return ApiResponse::error('unauthenticated', __('errors.unauthenticated'), 401);
            }
        });
        $exceptions->render(function (NotFoundHttpException $e, Request $request) use ($isApi) {
            if ($isApi($request)) {
                return ApiResponse::error('not_found', __('errors.not_found'), 404);
            }
        });
        $exceptions->render(function (TooManyRequestsHttpException $e, Request $request) use ($isApi) {
            if ($isApi($request)) {
                return ApiResponse::error('too_many_requests', __('errors.too_many_requests'), 429)
                    ->withHeaders($e->getHeaders());
            }
        });
        $exceptions->render(function (HttpExceptionInterface $e, Request $request) use ($isApi) {
            if ($isApi($request) && $e->getStatusCode() === 403) {
                return ApiResponse::error('forbidden', __('errors.forbidden'), 403);
            }
        });
        $exceptions->render(function (Throwable $e, Request $request) use ($isApi) {
            if ($isApi($request) && ! config('app.debug') && ! $e instanceof HttpExceptionInterface) {
                return ApiResponse::error('server_error', __('errors.server_error'), 500);
            }
        });
    })->create();
