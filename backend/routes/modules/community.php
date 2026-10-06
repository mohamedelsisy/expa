<?php

// Community Q&A foundation. Feature flag: config('community.enabled'); while off every route below answers 404.

use App\Http\Controllers\Api\V1\Admin\CommunityAdminController;
use App\Http\Controllers\Api\V1\CommunityController;
use App\Http\Middleware\EnsureAccountActive;
use App\Http\Middleware\EnsureCommunityEnabled;
use App\Http\Middleware\EnsureEmailIsVerified;
use Illuminate\Support\Facades\Route;

// The flag check runs AFTER authentication/authorization on protected routes, so anonymous and unauthorised callers
// never learn whether the feature exists beyond what 401/403 already say.
Route::group([], function () {
    Route::prefix('community')->group(function () {
        Route::middleware(EnsureCommunityEnabled::class)->group(function () {
            Route::get('meta', [CommunityController::class, 'meta']);
            Route::get('questions', [CommunityController::class, 'index']);
            Route::get('questions/{id}', [CommunityController::class, 'show'])->whereNumber('id');
        });

        Route::middleware(['auth:sanctum', EnsureAccountActive::class, EnsureEmailIsVerified::class, EnsureCommunityEnabled::class])->group(function () {
            Route::post('questions', [CommunityController::class, 'store'])->middleware('throttle:community-post');
            Route::delete('questions/{id}', [CommunityController::class, 'destroyQuestion'])->whereNumber('id');
            Route::post('questions/{id}/answers', [CommunityController::class, 'storeAnswer'])->whereNumber('id')->middleware('throttle:community-post');
            Route::post('questions/{id}/comments', [CommunityController::class, 'storeComment'])->whereNumber('id')->middleware('throttle:community-post');
            Route::delete('answers/{id}', [CommunityController::class, 'destroyAnswer'])->whereNumber('id');
            Route::delete('comments/{id}', [CommunityController::class, 'destroyComment'])->whereNumber('id');
            foreach (['question', 'answer'] as $t) { // literal segments (not a {type} parameter): the route table stays explicit
                Route::match(['put', 'delete'], "$t/{id}/vote", [CommunityController::class, 'vote'])->defaults('type', $t)->whereNumber('id')->middleware('throttle:community-vote');
            }
            Route::match(['put', 'delete'], 'questions/{id}/accepted-answer', [CommunityController::class, 'accept'])->whereNumber('id');
            foreach (['question', 'answer', 'comment'] as $t) {
                Route::post("$t/{id}/report", [CommunityController::class, 'report'])->defaults('type', $t)->whereNumber('id')->middleware('throttle:reports');
            }
            Route::get('blocks', [CommunityController::class, 'blocks']);
            Route::post('blocks', [CommunityController::class, 'block']);
            Route::delete('blocks/{id}', [CommunityController::class, 'unblock'])->whereNumber('id');
        });
    });

    Route::middleware(['auth:sanctum', EnsureAccountActive::class, EnsureEmailIsVerified::class])->prefix('admin/community')->group(function () {
        Route::middleware(['can:community.moderate', EnsureCommunityEnabled::class])->group(function () {
            Route::get('queue', [CommunityAdminController::class, 'queue']);
            foreach (['question', 'answer', 'comment'] as $t) {
                Route::post("$t/{id}/moderate", [CommunityAdminController::class, 'moderate'])->defaults('type', $t)->whereNumber('id');
            }
            Route::put('questions/{id}/official-guide', [CommunityAdminController::class, 'officialGuide'])->whereNumber('id');
            Route::get('reports', [CommunityAdminController::class, 'reports']);
            Route::post('reports/{id}/resolve', [CommunityAdminController::class, 'resolveReport'])->whereNumber('id');
        });
        Route::middleware(['can:community.restrict_users', EnsureCommunityEnabled::class])->group(function () {
            Route::get('users/{userId}/restriction', [CommunityAdminController::class, 'showRestriction'])->whereNumber('userId');
            Route::put('users/{userId}/restriction', [CommunityAdminController::class, 'restrict'])->whereNumber('userId');
            Route::delete('users/{userId}/restriction', [CommunityAdminController::class, 'lift'])->whereNumber('userId');
        });
    });
});
