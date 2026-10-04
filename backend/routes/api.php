<?php

use App\Http\Controllers\Api\V1\Admin\AppointmentGuideAdminController;
use App\Http\Controllers\Api\V1\Admin\AuditLogController;
use App\Http\Controllers\Api\V1\Admin\GovernmentOfficeAdminController;
use App\Http\Controllers\Api\V1\Admin\GovernmentServiceAdminController;
use App\Http\Controllers\Api\V1\Admin\GuideAdminController;
use App\Http\Controllers\Api\V1\Admin\ItalianLessonAdminController;
use App\Http\Controllers\Api\V1\Admin\JobSourceAdminController;
use App\Http\Controllers\Api\V1\Admin\PatenteCategoryAdminController;
use App\Http\Controllers\Api\V1\Admin\PatenteQuestionAdminController;
use App\Http\Controllers\Api\V1\Admin\PatenteTopicAdminController;
use App\Http\Controllers\Api\V1\Admin\StatsController;
use App\Http\Controllers\Api\V1\Admin\SubscriptionAdminController;
use App\Http\Controllers\Api\V1\Admin\UserAdminController;
use App\Http\Controllers\Api\V1\AiController;
use App\Http\Controllers\Api\V1\AnalyticsController;
use App\Http\Controllers\Api\V1\AppointmentController;
use App\Http\Controllers\Api\V1\Auth\AuthController;
use App\Http\Controllers\Api\V1\Auth\EmailVerificationController;
use App\Http\Controllers\Api\V1\Auth\PasswordController;
use App\Http\Controllers\Api\V1\BillingController;
use App\Http\Controllers\Api\V1\DashboardController;
use App\Http\Controllers\Api\V1\DeviceController;
use App\Http\Controllers\Api\V1\DocumentTypeController;
use App\Http\Controllers\Api\V1\GeographyController;
use App\Http\Controllers\Api\V1\GovernmentController;
use App\Http\Controllers\Api\V1\GuideController;
use App\Http\Controllers\Api\V1\HealthController;
use App\Http\Controllers\Api\V1\ItalianController;
use App\Http\Controllers\Api\V1\JobController;
use App\Http\Controllers\Api\V1\NotificationController;
use App\Http\Controllers\Api\V1\PatenteController;
use App\Http\Controllers\Api\V1\Profile\ConsentController;
use App\Http\Controllers\Api\V1\Profile\PrivacyController;
use App\Http\Controllers\Api\V1\Profile\ProfileController;
use App\Http\Controllers\Api\V1\SearchController;
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
    Route::get('government/services', [GovernmentController::class, 'services']);
    Route::get('government/services/{slug}', [GovernmentController::class, 'service']);
    Route::get('government/offices', [GovernmentController::class, 'offices']);
    Route::get('government/offices/{slug}', [GovernmentController::class, 'office']);
    Route::get('appointments/hub', [AppointmentController::class, 'hub']);
    Route::get('appointments/guides', [AppointmentController::class, 'guides']);
    Route::get('appointments/guides/{slug}', [AppointmentController::class, 'guide']);
    Route::get('italian/levels', [ItalianController::class, 'levels']);
    Route::get('italian/meta', [ItalianController::class, 'meta']);
    Route::get('italian/lessons', [ItalianController::class, 'lessons']);
    Route::get('italian/lessons/{slug}', [ItalianController::class, 'lesson']);
    Route::get('patente/categories', [PatenteController::class, 'categories']);
    Route::get('patente/categories/{slug}', [PatenteController::class, 'category']);
    Route::get('patente/topics', [PatenteController::class, 'topics']);
    Route::get('patente/topics/{slug}', [PatenteController::class, 'topic']);
    Route::get('patente/rules', [PatenteController::class, 'rules']);
    Route::get('jobs/meta', [JobController::class, 'meta']);
    Route::get('jobs', [JobController::class, 'index']);
    Route::get('jobs/{id}', [JobController::class, 'show'])->whereNumber('id');
    Route::get('search', [SearchController::class, 'index'])->middleware('throttle:search');
    Route::get('search/suggest', [SearchController::class, 'suggest'])->middleware('throttle:search');
    Route::get('billing/plans', [BillingController::class, 'plans']);
    Route::post('billing/webhook/{provider}', [BillingController::class, 'webhook'])->middleware('throttle:billing-webhook');
    Route::post('analytics/events', [AnalyticsController::class, 'store'])->middleware('throttle:analytics');
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

    Route::middleware('auth:sanctum')->group(function () {
        Route::get('notifications', [NotificationController::class, 'index']);
        Route::post('notifications/read-all', [NotificationController::class, 'readAll']);
        Route::post('notifications/{id}/read', [NotificationController::class, 'read'])->whereUuid('id');
        Route::delete('notifications/{id}', [NotificationController::class, 'destroy'])->whereUuid('id');
        Route::post('devices', [DeviceController::class, 'store']);
        Route::delete('devices', [DeviceController::class, 'destroy']);
    });

    Route::middleware('auth:sanctum')->prefix('ai')->group(function () {
        Route::post('ask', [AiController::class, 'ask'])->middleware('throttle:ai');
        Route::get('usage', [AiController::class, 'usage']);
        Route::get('conversations', [AiController::class, 'conversations']);
        Route::get('conversations/{id}', [AiController::class, 'show'])->whereNumber('id');
        Route::delete('conversations/{id}', [AiController::class, 'destroy'])->whereNumber('id');
    });

    Route::middleware('auth:sanctum')->prefix('italian')->group(function () {
        Route::get('daily', [ItalianController::class, 'daily']);
        Route::get('progress', [ItalianController::class, 'progress']);
        Route::post('lessons/{slug}/progress', [ItalianController::class, 'record']);
    });

    Route::middleware('auth:sanctum')->prefix('patente')->group(function () {
        Route::post('exams', [PatenteController::class, 'start'])->middleware('throttle:patente-exams');
        Route::get('exams', [PatenteController::class, 'exams']);
        Route::get('exams/{id}', [PatenteController::class, 'exam'])->whereNumber('id');
        Route::post('exams/{id}/answers', [PatenteController::class, 'submit'])->whereNumber('id');
        Route::get('progress', [PatenteController::class, 'progress']);
    });

    Route::middleware('auth:sanctum')->prefix('jobs')->group(function () {
        Route::get('recommended', [JobController::class, 'recommended']);
        Route::get('saved', [JobController::class, 'saved']);
        Route::get('profile', [JobController::class, 'profile']);
        Route::put('profile', [JobController::class, 'updateProfile']);
        Route::post('{id}/save', [JobController::class, 'save'])->whereNumber('id');
        Route::delete('{id}/save', [JobController::class, 'unsave'])->whereNumber('id');
        Route::post('{id}/apply-click', [JobController::class, 'applyClick'])->whereNumber('id');
    });

    Route::middleware('auth:sanctum')->prefix('billing')->group(function () {
        Route::get('subscription', [BillingController::class, 'subscription']);
        Route::post('checkout', [BillingController::class, 'checkout'])->middleware('throttle:privacy');
        Route::post('cancel', [BillingController::class, 'cancel'])->middleware('throttle:privacy');
        Route::get('invoices', [BillingController::class, 'invoices']);
    });

    Route::middleware('auth:sanctum')->prefix('dashboard')->group(function () {
        Route::get('/', [DashboardController::class, 'show']);
        Route::get('tasks', [DashboardController::class, 'tasks']);
        Route::put('tasks/{key}', [DashboardController::class, 'setTask']);
    });

    // Standard admin CRUD + workflow routes for a ContentAdminController.
    // `$permission` is the resource prefix: every route requires at least `{prefix}.view` before anything else runs.
    $contentAdmin = function (string $uri, string $controller, string $permission) {
        Route::middleware("can:$permission.view")->group(function () use ($uri, $controller) {
            Route::get($uri, [$controller, 'index']);
            Route::post($uri, [$controller, 'store']);
            Route::get("$uri/{id}", [$controller, 'show'])->whereNumber('id');
            Route::match(['put', 'patch'], "$uri/{id}", [$controller, 'update'])->whereNumber('id');
            Route::delete("$uri/{id}", [$controller, 'destroy'])->whereNumber('id');
            Route::post("$uri/{id}/transition", [$controller, 'transition'])->whereNumber('id');
            Route::post("$uri/{id}/schedule", [$controller, 'schedule'])->whereNumber('id');
        });
    };

    Route::middleware(['auth:sanctum', EnsureEmailIsVerified::class])->prefix('admin')->group(function () use ($contentAdmin) {
        Route::get('users', [UserAdminController::class, 'index'])->middleware('can:users.view');
        Route::get('users/{user}', [UserAdminController::class, 'show'])->middleware('can:users.view');
        Route::patch('users/{user}', [UserAdminController::class, 'update'])->middleware('can:users.update');
        Route::put('users/{user}/roles', [UserAdminController::class, 'syncRoles'])->middleware('can:roles.assign');
        Route::get('roles', [UserAdminController::class, 'roles'])->middleware('can:roles.view');
        $contentAdmin('guides', GuideAdminController::class, 'guides');
        $contentAdmin('government/services', GovernmentServiceAdminController::class, 'government_services');
        $contentAdmin('government/offices', GovernmentOfficeAdminController::class, 'government_offices');
        $contentAdmin('appointments/guides', AppointmentGuideAdminController::class, 'appointment_guides');
        $contentAdmin('italian/lessons', ItalianLessonAdminController::class, 'italian_lessons');
        $contentAdmin('patente/categories', PatenteCategoryAdminController::class, 'patente');
        $contentAdmin('patente/topics', PatenteTopicAdminController::class, 'patente');
        $contentAdmin('patente/questions', PatenteQuestionAdminController::class, 'patente');
        Route::get('job-sources', [JobSourceAdminController::class, 'index'])->middleware('can:job_sources.view');
        Route::post('job-sources', [JobSourceAdminController::class, 'store'])->middleware('can:job_sources.create');
        Route::get('job-sources/{id}', [JobSourceAdminController::class, 'show'])->whereNumber('id')->middleware('can:job_sources.view');
        Route::match(['put', 'patch'], 'job-sources/{id}', [JobSourceAdminController::class, 'update'])->whereNumber('id')->middleware('can:job_sources.update');
        Route::delete('job-sources/{id}', [JobSourceAdminController::class, 'destroy'])->whereNumber('id')->middleware('can:job_sources.delete');
        Route::post('job-sources/{id}/run', [JobSourceAdminController::class, 'run'])->whereNumber('id')->middleware('can:job_sources.update');
        Route::get('job-sources/{id}/runs', [JobSourceAdminController::class, 'runsIndex'])->whereNumber('id')->middleware('can:job_sources.view');
        Route::get('jobs', [JobSourceAdminController::class, 'jobs'])->middleware('can:jobs.view');
        Route::patch('jobs/{id}', [JobSourceAdminController::class, 'setJobStatus'])->whereNumber('id')->middleware('can:jobs.publish');
        Route::get('subscriptions', [SubscriptionAdminController::class, 'index'])->middleware('can:subscriptions.view');
        Route::post('subscriptions/grant', [SubscriptionAdminController::class, 'grant'])->middleware('can:subscriptions.manage');
        Route::post('subscriptions/{id}/cancel', [SubscriptionAdminController::class, 'cancel'])->whereNumber('id')->middleware('can:subscriptions.manage');
        Route::get('stats', [StatsController::class, 'overview'])->middleware('can:reports.view');
        Route::get('analytics', [StatsController::class, 'analytics'])->middleware('can:reports.view');
        Route::get('audit-logs', [AuditLogController::class, 'index'])->middleware('can:audit_logs.view');
    });
});
