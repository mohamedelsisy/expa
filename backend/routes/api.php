<?php

use App\Http\Controllers\Api\V1\Admin\UserAdminController;
use App\Http\Controllers\Api\V1\Auth\AuthController;
use App\Http\Controllers\Api\V1\Auth\EmailVerificationController;
use App\Http\Controllers\Api\V1\Auth\PasswordController;
use App\Http\Controllers\Api\V1\HealthController;
use App\Http\Controllers\Api\V1\Profile\ConsentController;
use App\Http\Controllers\Api\V1\Profile\ProfileController;
use App\Http\Middleware\EnsureEmailIsVerified;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {
    Route::get('health', HealthController::class);

    Route::prefix('auth')->group(function () {
        Route::post('register', [AuthController::class, 'register'])->middleware('throttle:register');
        Route::post('login', [AuthController::class, 'login'])->middleware('throttle:login');
        Route::post('forgot-password', [PasswordController::class, 'forgot'])->middleware('throttle:password-reset');
        Route::post('reset-password', [PasswordController::class, 'reset'])->middleware('throttle:password-reset');
        Route::get('verify-email/{id}/{hash}', [EmailVerificationController::class, 'verify'])
            ->middleware(['signed', 'throttle:6,1'])->whereNumber('id')->name('verification.verify');

        Route::middleware('auth:sanctum')->group(function () {
            Route::get('me', [AuthController::class, 'me']);
            Route::post('logout', [AuthController::class, 'logout']);
            Route::post('logout-all', [AuthController::class, 'logoutAll']);
            Route::post('change-password', [PasswordController::class, 'change']);
            Route::post('resend-verification', [EmailVerificationController::class, 'resend'])->middleware('throttle:6,1');
        });
    });

    Route::get('privacy/purposes', [ConsentController::class, 'purposes']);
    Route::get('profile/options', [ProfileController::class, 'options']);

    Route::middleware('auth:sanctum')->prefix('profile')->group(function () {
        Route::get('/', [ProfileController::class, 'show']);
        Route::patch('/', [ProfileController::class, 'update']);
        Route::post('onboarding/skip', [ProfileController::class, 'skipStep']);
        Route::post('onboarding/complete', [ProfileController::class, 'completeOnboarding']);
        Route::get('consents', [ConsentController::class, 'show']);
        Route::put('consents', [ConsentController::class, 'update']);
    });

    Route::middleware(['auth:sanctum', EnsureEmailIsVerified::class])->prefix('admin')->group(function () {
        Route::get('users', [UserAdminController::class, 'index'])->middleware('can:users.view');
        Route::get('users/{user}', [UserAdminController::class, 'show'])->middleware('can:users.view');
        Route::patch('users/{user}', [UserAdminController::class, 'update'])->middleware('can:users.update');
        Route::put('users/{user}/roles', [UserAdminController::class, 'syncRoles'])->middleware('can:roles.assign');
        Route::get('roles', [UserAdminController::class, 'roles'])->middleware('can:roles.view');
    });
});
