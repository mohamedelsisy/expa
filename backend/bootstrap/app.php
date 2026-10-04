<?php

use App\Exceptions\ApiException;
use App\Http\Middleware\SetLocale;
use App\Support\ApiResponse;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
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
        $middleware->api(prepend: [SetLocale::class]);
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
