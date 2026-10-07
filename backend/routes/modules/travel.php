<?php

use App\Http\Controllers\Api\V1\Admin\TravelRequirementAdminController;
use App\Http\Controllers\Api\V1\TravelController;
use App\Http\Middleware\EnsureAccountActive;
use App\Http\Middleware\EnsureEmailIsVerified;
use Illuminate\Support\Facades\Route;

// Loaded inside the /v1 group (routes/api.php).
Route::get('travel/requirements', [TravelController::class, 'requirements'])->middleware('throttle:60,1');

Route::middleware(['auth:sanctum', EnsureAccountActive::class, EnsureEmailIsVerified::class])->prefix('admin')->group(function () {
    Route::middleware('can:travel_requirements.view')->group(function () {
        $c = TravelRequirementAdminController::class;
        Route::get('travel/requirements', [$c, 'index']);
        Route::post('travel/requirements', [$c, 'store']);
        Route::get('travel/requirements/{id}', [$c, 'show'])->whereNumber('id');
        Route::match(['put', 'patch'], 'travel/requirements/{id}', [$c, 'update'])->whereNumber('id');
        Route::patch('travel/requirements/{id}/translations', [$c, 'updateTranslations'])->whereNumber('id');
        Route::delete('travel/requirements/{id}', [$c, 'destroy'])->whereNumber('id');
        Route::post('travel/requirements/{id}/transition', [$c, 'transition'])->whereNumber('id');
        Route::post('travel/requirements/{id}/schedule', [$c, 'schedule'])->whereNumber('id');
    });
});
