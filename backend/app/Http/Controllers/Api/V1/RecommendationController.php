<?php

namespace App\Http\Controllers\Api\V1;

use App\Domains\Dashboard\Services\RecommendationService;
use App\Http\Controllers\Controller;
use App\Support\ApiResponse;
use Illuminate\Http\Request;

class RecommendationController extends Controller
{
    public function index(Request $request, RecommendationService $service)
    {
        return ApiResponse::data($service->for($request->user()));
    }
}
