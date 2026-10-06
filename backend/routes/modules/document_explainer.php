<?php

use App\Http\Controllers\Api\V1\DocumentExplainController;
use App\Http\Middleware\EnsureAccountActive;
use App\Http\Middleware\EnsureEmailIsVerified;
use Illuminate\Support\Facades\Route;

// Loaded inside the /v1 group (routes/api.php).
Route::middleware(['auth:sanctum', EnsureAccountActive::class])->prefix('documents')->group(function () {
    Route::post('explain', [DocumentExplainController::class, 'explain'])->middleware([EnsureEmailIsVerified::class, 'throttle:document-explain']);
    Route::get('explain/usage', [DocumentExplainController::class, 'usage']);
});
