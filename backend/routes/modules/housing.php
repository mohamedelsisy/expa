<?php

use App\Http\Controllers\Api\V1\Admin\HousingRuleAdminController;
use App\Http\Controllers\Api\V1\HousingController;
use App\Http\Middleware\EnsureAccountActive;
use App\Http\Middleware\EnsureEmailIsVerified;
use Illuminate\Support\Facades\Route;

// Loaded inside the /v1 group (routes/api.php).
Route::middleware(['auth:sanctum', EnsureAccountActive::class])->prefix('housing')->group(function () {
    // Paid LLM + personal text: verified email, consent (checked in the controller), plan quota and a rate limit.
    Route::post('check', [HousingController::class, 'check'])->middleware([EnsureEmailIsVerified::class, 'throttle:housing-check']);
    Route::get('usage', [HousingController::class, 'usage']);
    Route::get('checks', [HousingController::class, 'index']);
    Route::get('checks/{id}', [HousingController::class, 'show'])->whereNumber('id');
    Route::delete('checks/{id}', [HousingController::class, 'destroy'])->whereNumber('id');
});

Route::middleware(['auth:sanctum', EnsureAccountActive::class, EnsureEmailIsVerified::class])->prefix('admin')->group(function () {
    Route::middleware('can:housing_rules.view')->group(function () {
        $c = HousingRuleAdminController::class;
        Route::get('housing/rules/meta', [$c, 'meta']);
        Route::get('housing/rules', [$c, 'index']);
        Route::post('housing/rules', [$c, 'store']);
        Route::get('housing/rules/{id}', [$c, 'show'])->whereNumber('id');
        Route::match(['put', 'patch'], 'housing/rules/{id}', [$c, 'update'])->whereNumber('id');
        Route::patch('housing/rules/{id}/translations', [$c, 'updateTranslations'])->whereNumber('id');
        Route::delete('housing/rules/{id}', [$c, 'destroy'])->whereNumber('id');
        Route::post('housing/rules/{id}/transition', [$c, 'transition'])->whereNumber('id');
        Route::post('housing/rules/{id}/schedule', [$c, 'schedule'])->whereNumber('id');
    });
});
