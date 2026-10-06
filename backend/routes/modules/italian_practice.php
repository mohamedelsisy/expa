<?php

use App\Http\Controllers\Api\V1\Admin\ItalianExerciseAdminController;
use App\Http\Controllers\Api\V1\Admin\ItalianVocabularyAdminController;
use App\Http\Controllers\Api\V1\ItalianPracticeController;
use App\Http\Middleware\EnsureAccountActive;
use App\Http\Middleware\EnsureEmailIsVerified;
use Illuminate\Support\Facades\Route;

// Loaded inside the /v1 group (routes/api.php).
Route::get('italian/scenarios', [ItalianPracticeController::class, 'scenarios']);
Route::get('italian/vocabulary', [ItalianPracticeController::class, 'vocabulary']);
Route::get('italian/vocabulary/{slug}', [ItalianPracticeController::class, 'vocabularyItem'])->where('slug', '[a-z0-9-]+');
Route::get('italian/exercises', [ItalianPracticeController::class, 'exercises']);
Route::get('italian/exercises/{slug}', [ItalianPracticeController::class, 'exercise'])->where('slug', '[a-z0-9-]+');

Route::middleware(['auth:sanctum', EnsureAccountActive::class, 'throttle:italian-practice'])->prefix('italian')->group(function () {
    Route::get('practice/review', [ItalianPracticeController::class, 'review']);
    Route::get('practice/progress', [ItalianPracticeController::class, 'progress']);
    Route::post('vocabulary/{slug}/review', [ItalianPracticeController::class, 'recordReview'])->where('slug', '[a-z0-9-]+');
    Route::post('exercises/{slug}/attempt', [ItalianPracticeController::class, 'attempt'])->where('slug', '[a-z0-9-]+');
});

Route::middleware(['auth:sanctum', EnsureAccountActive::class, EnsureEmailIsVerified::class])->prefix('admin')->group(function () {
    foreach ([['italian/vocabulary', ItalianVocabularyAdminController::class], ['italian/exercises', ItalianExerciseAdminController::class]] as [$uri, $c]) {
        Route::middleware('can:italian_lessons.view')->group(function () use ($uri, $c) {
            Route::get($uri, [$c, 'index']);
            Route::post($uri, [$c, 'store']);
            Route::get("$uri/{id}", [$c, 'show'])->whereNumber('id');
            Route::match(['put', 'patch'], "$uri/{id}", [$c, 'update'])->whereNumber('id');
            Route::patch("$uri/{id}/translations", [$c, 'updateTranslations'])->whereNumber('id');
            Route::delete("$uri/{id}", [$c, 'destroy'])->whereNumber('id');
            Route::post("$uri/{id}/transition", [$c, 'transition'])->whereNumber('id');
            Route::post("$uri/{id}/schedule", [$c, 'schedule'])->whereNumber('id');
            Route::post("$uri/{id}/teacher-review", [$c, 'markReviewed'])->whereNumber('id');
            Route::delete("$uri/{id}/teacher-review", [$c, 'clearReviewed'])->whereNumber('id');
        });
    }
});
