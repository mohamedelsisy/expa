<?php

use App\Http\Controllers\Api\V1\Admin\LegalDocumentAdminController;
use App\Http\Controllers\Api\V1\LegalController;
use App\Http\Middleware\EnsureAccountActive;
use App\Http\Middleware\EnsureEmailIsVerified;
use Illuminate\Support\Facades\Route;

// Loaded inside the /v1 group (routes/api.php).
Route::get('legal/{slug}', [LegalController::class, 'show'])->where('slug', '[a-z-]+');

Route::middleware(['auth:sanctum', EnsureAccountActive::class, EnsureEmailIsVerified::class])->prefix('admin')->group(function () {
    Route::middleware('can:legal.view')->group(function () {
        $c = LegalDocumentAdminController::class;
        Route::get('legal', [$c, 'index']);
        Route::post('legal', [$c, 'store']);
        Route::get('legal/{id}', [$c, 'show'])->whereNumber('id');
        Route::match(['put', 'patch'], 'legal/{id}', [$c, 'update'])->whereNumber('id');
        Route::patch('legal/{id}/translations', [$c, 'updateTranslations'])->whereNumber('id');
        Route::delete('legal/{id}', [$c, 'destroy'])->whereNumber('id');
        Route::post('legal/{id}/transition', [$c, 'transition'])->whereNumber('id');
        Route::post('legal/{id}/schedule', [$c, 'schedule'])->whereNumber('id');
    });
});
