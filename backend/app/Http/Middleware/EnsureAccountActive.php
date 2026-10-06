<?php

namespace App\Http\Middleware;

use App\Support\ApiResponse;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/** Defence in depth (BE-13): a suspended / erasing account is refused even if an old token survived a status change. */
class EnsureAccountActive
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        // `status` can be null on a model that was created in-process and never reloaded (DB default); only known non-active states are refused.
        if ($user && $user->status !== null && ! $user->isActive()) {
            return ApiResponse::error('unauthenticated', __('errors.unauthenticated'), 401);
        }

        return $next($request);
    }
}
