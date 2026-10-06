<?php

namespace App\Http\Middleware;

use App\Support\ApiResponse;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/** Feature flag `community.enabled`: while off, the whole community surface behaves as if it did not exist. */
class EnsureCommunityEnabled
{
    public function handle(Request $request, Closure $next): Response
    {
        if (! config('community.enabled')) {
            return ApiResponse::error('not_found', __('moderation.not_found'), 404);
        }

        return $next($request);
    }
}
