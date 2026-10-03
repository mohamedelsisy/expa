<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Support\ApiResponse;

class HealthController extends Controller
{
    public function __invoke()
    {
        // Intentionally minimal: no versions, env or dependency details.
        return ApiResponse::data(['status' => 'ok']);
    }
}
