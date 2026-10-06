<?php

use App\Http\Controllers\Api\V1\Admin\PatenteAdminMetaController;
use App\Http\Controllers\Api\V1\PatenteLearningController;
use App\Http\Middleware\EnsureAccountActive;
use App\Http\Middleware\EnsureEmailIsVerified;
use Illuminate\Support\Facades\Route;

// Loaded inside the /v1 group (routes/api.php).
Route::get('patente/glossary', [PatenteLearningController::class, 'glossary']);

Route::middleware(['auth:sanctum', EnsureAccountActive::class])->prefix('patente')->group(function () {
    Route::get('weak-topics', [PatenteLearningController::class, 'weakTopics']);
    Route::post('topics/{slug}/practice', [PatenteLearningController::class, 'practiceTopic'])->where('slug', '[a-z0-9-]+')
        ->middleware([EnsureEmailIsVerified::class, 'throttle:patente-exams']);
    Route::post('practice/weak', [PatenteLearningController::class, 'practiceWeak'])->middleware([EnsureEmailIsVerified::class, 'throttle:patente-exams']);
    Route::post('exams/{id}/check', [PatenteLearningController::class, 'check'])->whereNumber('id')->middleware('throttle:italian-practice');
});

Route::middleware(['auth:sanctum', EnsureAccountActive::class, EnsureEmailIsVerified::class])->prefix('admin')->group(function () {
    Route::get('patente/meta', PatenteAdminMetaController::class)->middleware('can:patente.view');
});
