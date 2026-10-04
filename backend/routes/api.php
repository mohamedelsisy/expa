<?php

use App\Http\Controllers\Api\V1\Admin\AuditLogController;
use App\Http\Controllers\Api\V1\Admin\GuideAdminController;
use App\Http\Controllers\Api\V1\Admin\UserAdminController;
use App\Http\Controllers\Api\V1\Auth\AuthController;
use App\Http\Controllers\Api\V1\Auth\EmailVerificationController;
use App\Http\Controllers\Api\V1\Auth\PasswordController;
use App\Http\Controllers\Api\V1\DashboardController;
use App\Http\Controllers\Api\V1\DocumentTypeController;
use App\Http\Controllers\Api\V1\GeographyController;
use App\Http\Controllers\Api\V1\GuideController;
use App\Http\Controllers\Api\V1\HealthController;
use App\Http\Controllers\Api\V1\Profile\ConsentController;
use App\Http\Controllers\Api\V1\Profile\PrivacyController;
use App\Http\Controllers\Api\V1\Profile\ProfileController;
use App\Http\Controllers\Api\V1\UserDocumentController;
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

    Route::get('guides/categories', [GuideController::class, 'categories']);
    Route::get('guides', [GuideController::class, 'index']);
    Route::get('guides/{slug}', [GuideController::class, 'show']);
    Route::get('document-types', [DocumentTypeController::class, 'index']);
    Route::get('regions', [GeographyController::class, 'regions']);
    Route::get('cities', [GeographyController::class, 'cities']);
    Route::get('privacy/purposes', [ConsentController::class, 'purposes']);
    Route::get('profile/options', [ProfileController::class, 'options']);

    Route::middleware('auth:sanctum')->prefix('profile')->group(function () {
        Route::get('/', [ProfileController::class, 'show']);
        Route::patch('/', [ProfileController::class, 'update']);
        Route::post('onboarding/skip', [ProfileController::class, 'skipStep']);
        Route::post('onboarding/complete', [ProfileController::class, 'completeOnboarding']);
        Route::get('export', [PrivacyController::class, 'export'])->middleware('throttle:privacy');
        Route::delete('/', [PrivacyController::class, 'destroy'])->middleware('throttle:privacy');
        Route::get('consents', [ConsentController::class, 'show']);
        Route::put('consents', [ConsentController::class, 'update']);
    });

    Route::middleware('auth:sanctum')->prefix('my-documents')->group(function () {
        Route::get('/', [UserDocumentController::class, 'index']);
        Route::post('/', [UserDocumentController::class, 'store']);
        Route::get('{document}', [UserDocumentController::class, 'show'])->whereNumber('document');
        Route::match(['put', 'patch'], '{document}', [UserDocumentController::class, 'update'])->whereNumber('document');
        Route::delete('{document}', [UserDocumentController::class, 'destroy'])->whereNumber('document');
        Route::post('{document}/attachments', [UserDocumentController::class, 'upload'])->whereNumber('document')->middleware('throttle:uploads');
        Route::get('{document}/attachments/{attachment}', [UserDocumentController::class, 'download'])->whereNumber(['document', 'attachment']);
        Route::delete('{document}/attachments/{attachment}', [UserDocumentController::class, 'deleteAttachment'])->whereNumber(['document', 'attachment']);
    });

    Route::middleware('auth:sanctum')->prefix('dashboard')->group(function () {
        Route::get('/', [DashboardController::class, 'show']);
        Route::get('tasks', [DashboardController::class, 'tasks']);
        Route::put('tasks/{key}', [DashboardController::class, 'setTask']);
    });

    Route::middleware(['auth:sanctum', EnsureEmailIsVerified::class])->prefix('admin')->group(function () {
        Route::get('users', [UserAdminController::class, 'index'])->middleware('can:users.view');
        Route::get('users/{user}', [UserAdminController::class, 'show'])->middleware('can:users.view');
        Route::patch('users/{user}', [UserAdminController::class, 'update'])->middleware('can:users.update');
        Route::put('users/{user}/roles', [UserAdminController::class, 'syncRoles'])->middleware('can:roles.assign');
        Route::get('roles', [UserAdminController::class, 'roles'])->middleware('can:roles.view');
        Route::get('guides', [GuideAdminController::class, 'index']);
        Route::post('guides', [GuideAdminController::class, 'store']);
        Route::get('guides/{guide}', [GuideAdminController::class, 'show'])->whereNumber('guide');
        Route::match(['put', 'patch'], 'guides/{guide}', [GuideAdminController::class, 'update'])->whereNumber('guide');
        Route::delete('guides/{guide}', [GuideAdminController::class, 'destroy'])->whereNumber('guide');
        Route::post('guides/{guide}/transition', [GuideAdminController::class, 'transition'])->whereNumber('guide');
        Route::post('guides/{guide}/schedule', [GuideAdminController::class, 'schedule'])->whereNumber('guide');
        Route::get('audit-logs', [AuditLogController::class, 'index'])->middleware('can:audit_logs.view');
    });
});
