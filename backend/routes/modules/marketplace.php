<?php

// Service marketplace (provider directory, reviews, contact requests, provider portal, admin back office).
// No payments: leads are contact requests only.

use App\Http\Controllers\Api\V1\Admin\MarketplaceAdminController;
use App\Http\Controllers\Api\V1\Admin\ProviderAdminController;
use App\Http\Controllers\Api\V1\ProviderDirectoryController;
use App\Http\Controllers\Api\V1\ProviderPortalController;
use App\Http\Middleware\EnsureAccountActive;
use App\Http\Middleware\EnsureEmailIsVerified;
use App\Http\Middleware\EnsureProviderAccount;
use Illuminate\Support\Facades\Route;

Route::get('providers/meta', [ProviderDirectoryController::class, 'meta']);
Route::get('providers', [ProviderDirectoryController::class, 'index']);
Route::get('providers/{slug}', [ProviderDirectoryController::class, 'show'])->where('slug', '[a-z0-9\-]+');
Route::get('providers/{slug}/reviews', [ProviderDirectoryController::class, 'reviews'])->where('slug', '[a-z0-9\-]+');

Route::middleware(['auth:sanctum', EnsureAccountActive::class, EnsureEmailIsVerified::class])->group(function () {
    Route::post('providers/{slug}/reviews', [ProviderDirectoryController::class, 'storeReview'])->where('slug', '[a-z0-9\-]+')->middleware('throttle:provider-reviews');
    Route::post('providers/{slug}/leads', [ProviderDirectoryController::class, 'storeLead'])->where('slug', '[a-z0-9\-]+')->middleware('throttle:provider-leads');
    Route::post('provider-reviews/{id}/report', [ProviderDirectoryController::class, 'reportReview'])->whereNumber('id')->middleware('throttle:reports');
    Route::get('my/provider-reviews', [ProviderDirectoryController::class, 'myReviews']);
    Route::delete('my/provider-reviews/{id}', [ProviderDirectoryController::class, 'destroyReview'])->whereNumber('id');
    Route::get('my/provider-leads', [ProviderDirectoryController::class, 'myLeads']);
    Route::post('provider/apply', [ProviderPortalController::class, 'apply'])->middleware('throttle:provider-apply');

    Route::middleware(EnsureProviderAccount::class)->prefix('provider')->group(function () {
        Route::get('profile', [ProviderPortalController::class, 'show']);
        Route::match(['put', 'patch'], 'profile', [ProviderPortalController::class, 'update']);
        Route::post('profile/submit', [ProviderPortalController::class, 'submit']);
        Route::get('verification/documents', [ProviderPortalController::class, 'evidence']);
        Route::post('verification/documents', [ProviderPortalController::class, 'uploadEvidence'])->middleware('throttle:provider-uploads');
        Route::delete('verification/documents/{id}', [ProviderPortalController::class, 'deleteEvidence'])->whereNumber('id');
        Route::post('verification/request', [ProviderPortalController::class, 'requestVerification']);
        Route::get('leads', [ProviderPortalController::class, 'leads']);
        Route::patch('leads/{id}', [ProviderPortalController::class, 'updateLead'])->whereNumber('id');
        Route::get('reviews', [ProviderPortalController::class, 'reviews']);
        Route::post('reviews/{id}/reply', [ProviderPortalController::class, 'reply'])->whereNumber('id');
    });
});

Route::middleware(['auth:sanctum', EnsureAccountActive::class, EnsureEmailIsVerified::class])->prefix('admin')->group(function () {
    Route::middleware('can:providers.view')->group(function () {
        $uri = 'marketplace/providers';
        $c = ProviderAdminController::class;
        Route::get($uri, [$c, 'index']);
        Route::post($uri, [$c, 'store']);
        Route::get("$uri/{id}", [$c, 'show'])->whereNumber('id');
        Route::match(['put', 'patch'], "$uri/{id}", [$c, 'update'])->whereNumber('id');
        Route::patch("$uri/{id}/translations", [$c, 'updateTranslations'])->whereNumber('id');
        Route::delete("$uri/{id}", [$c, 'destroy'])->whereNumber('id');
        Route::post("$uri/{id}/transition", [$c, 'transition'])->whereNumber('id');
        Route::post("$uri/{id}/schedule", [$c, 'schedule'])->whereNumber('id');
        Route::post("$uri/{id}/changes", [MarketplaceAdminController::class, 'pendingChanges'])->whereNumber('id')->middleware('can:providers.publish');
    });
    Route::get('marketplace/verification-queue', [MarketplaceAdminController::class, 'verificationQueue'])->middleware('can:providers.verify');
    Route::post('marketplace/providers/{id}/verification', [MarketplaceAdminController::class, 'verify'])->whereNumber('id')->middleware('can:providers.verify');
    Route::get('marketplace/providers/{id}/evidence', [MarketplaceAdminController::class, 'evidence'])->whereNumber('id')->middleware('can:providers.verify');
    Route::get('marketplace/providers/{id}/evidence/{docId}', [MarketplaceAdminController::class, 'downloadEvidence'])->whereNumber(['id', 'docId'])->middleware('can:providers.verify');
    Route::middleware('can:provider_reviews.moderate')->group(function () {
        Route::get('marketplace/reviews', [MarketplaceAdminController::class, 'reviews']);
        Route::post('marketplace/reviews/{id}/moderate', [MarketplaceAdminController::class, 'moderateReview'])->whereNumber('id');
        Route::post('marketplace/reviews/{id}/reply-moderate', [MarketplaceAdminController::class, 'moderateReply'])->whereNumber('id');
        Route::get('marketplace/reports', [MarketplaceAdminController::class, 'reports']);
        Route::post('marketplace/reports/{id}/resolve', [MarketplaceAdminController::class, 'resolveReport'])->whereNumber('id');
    });
});
