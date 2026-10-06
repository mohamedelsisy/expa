<?php

// Articles + city landing profiles (loaded inside the /v1 group by routes/api.php).

use App\Http\Controllers\Api\V1\Admin\ArticleAdminController;
use App\Http\Controllers\Api\V1\Admin\CityProfileAdminController;
use App\Http\Controllers\Api\V1\ArticleController;
use App\Http\Controllers\Api\V1\CityProfileController;
use App\Http\Middleware\EnsureAccountActive;
use App\Http\Middleware\EnsureEmailIsVerified;
use Illuminate\Support\Facades\Route;

Route::get('articles/categories', [ArticleController::class, 'categories']);
Route::get('articles', [ArticleController::class, 'index']);
Route::get('articles/{slug}', [ArticleController::class, 'show']);
Route::get('city-profiles', [CityProfileController::class, 'index']);
Route::get('cities/{slug}', [CityProfileController::class, 'show']);
Route::get('guides/{slug}/local-info', [CityProfileController::class, 'guideLocalInfo']);

$moduleContentAdmin = function (string $uri, string $controller, string $permission) {
    Route::middleware("can:$permission.view")->group(function () use ($uri, $controller) {
        Route::get($uri, [$controller, 'index']);
        Route::post($uri, [$controller, 'store']);
        Route::get("$uri/{id}", [$controller, 'show'])->whereNumber('id');
        Route::match(['put', 'patch'], "$uri/{id}", [$controller, 'update'])->whereNumber('id');
        Route::patch("$uri/{id}/translations", [$controller, 'updateTranslations'])->whereNumber('id');
        Route::delete("$uri/{id}", [$controller, 'destroy'])->whereNumber('id');
        Route::post("$uri/{id}/transition", [$controller, 'transition'])->whereNumber('id');
        Route::post("$uri/{id}/schedule", [$controller, 'schedule'])->whereNumber('id');
    });
};

Route::middleware(['auth:sanctum', EnsureAccountActive::class, EnsureEmailIsVerified::class])->prefix('admin')->group(function () use ($moduleContentAdmin) {
    $moduleContentAdmin('articles', ArticleAdminController::class, 'articles');
    $moduleContentAdmin('city-profiles', CityProfileAdminController::class, 'cities');
});
