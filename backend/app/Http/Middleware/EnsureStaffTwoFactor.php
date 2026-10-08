<?php

namespace App\Http\Middleware;

use App\Domains\TwoFactor\Services\TwoFactorService;
use App\Support\ApiResponse;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/** With STAFF_2FA_REQUIRED=true, staff without active 2FA may sign in but cannot use the admin area until they enable it. */
class EnsureStaffTwoFactor
{
    public function __construct(private TwoFactorService $tf) {}

    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();
        if ($user && $this->tf->setupRequired($user)) {
            return ApiResponse::error('two_factor_setup_required', __('errors.two_factor_setup_required'), 403);
        }

        return $next($request);
    }
}
