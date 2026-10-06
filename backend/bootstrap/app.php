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
        // Trusted proxies are applied from config('expa.trusted_proxies') in AppServiceProvider::boot (BE-1): the env helper is not
        // available here once the config is cached, so reading it in this file silently trusted nobody.
        $middleware->append(SecurityHeaders::class); // global: also covers unmatched routes and framework errors
        $middleware->api(prepend: [SetLocale::class]);
        // Global safety net for every API route (specific limiters such as login/ai/search stay stricter).
        $middleware->api(append: ['throttle:api']);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $isApi = fn (Request $request) => $request->is('api/*') || $request->expectsJson();

        $exceptions->shouldRenderJsonWhen($isApi);
        // Expected business outcomes (consent required, limit reached, invalid transition...) are 4xx responses, not
        // server errors: reporting them wrote a stack trace per request and let users flood the log (BE-3).
        $exceptions->dontReport(ApiException::class);

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
            if (! $isApi($request)) {
                return null;
            }
            // Generic HTTP errors use the standard envelope with a generic message (no route/method detail, BE-22).
            $map = [
                400 => ['bad_request', 'errors.bad_request'], 403 => ['forbidden', 'errors.forbidden'],
                405 => ['method_not_allowed', 'errors.method_not_allowed'], 413 => ['payload_too_large', 'errors.payload_too_large'],
                415 => ['unsupported_media_type', 'errors.unsupported_media_type'], 419 => ['session_expired', 'errors.session_expired'],
                503 => ['service_unavailable', 'errors.service_unavailable'],
            ];
            [$code, $key] = $map[$e->getStatusCode()] ?? [$e->getStatusCode() >= 500 ? 'server_error' : 'request_failed', $e->getStatusCode() >= 500 ? 'errors.server_error' : 'errors.request_failed'];

            return ApiResponse::error($code, __($key), $e->getStatusCode())->withHeaders($e->getHeaders());
        });
        $exceptions->render(function (Throwable $e, Request $request) use ($isApi) {
            if ($isApi($request) && ! config('app.debug') && ! $e instanceof HttpExceptionInterface) {
                return ApiResponse::error('server_error', __('errors.server_error'), 500);
            }
        });
    })->create();
