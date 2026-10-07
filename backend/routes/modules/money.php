<?php

use App\Http\Controllers\Api\V1\Admin\TaxTableAdminController;
use App\Http\Controllers\Api\V1\MoneyController;
use App\Http\Middleware\EnsureAccountActive;
use App\Http\Middleware\EnsureEmailIsVerified;
use Illuminate\Support\Facades\Route;

// Loaded inside the /v1 group (routes/api.php).
Route::post('money/net-salary', [MoneyController::class, 'netSalary'])->middleware('throttle:60,1');

Route::middleware(['auth:sanctum', EnsureAccountActive::class, EnsureEmailIsVerified::class])->prefix('admin')->group(function () {
    Route::middleware('can:tax_tables.view')->group(function () {
        $c = TaxTableAdminController::class;
        Route::get('money/tax-tables', [$c, 'index']);
        Route::post('money/tax-tables', [$c, 'store']);
        Route::get('money/tax-tables/{id}', [$c, 'show'])->whereNumber('id');
        Route::match(['put', 'patch'], 'money/tax-tables/{id}', [$c, 'update'])->whereNumber('id');
        Route::patch('money/tax-tables/{id}/translations', [$c, 'updateTranslations'])->whereNumber('id');
        Route::delete('money/tax-tables/{id}', [$c, 'destroy'])->whereNumber('id');
        Route::post('money/tax-tables/{id}/transition', [$c, 'transition'])->whereNumber('id');
        Route::post('money/tax-tables/{id}/schedule', [$c, 'schedule'])->whereNumber('id');
    });
});
