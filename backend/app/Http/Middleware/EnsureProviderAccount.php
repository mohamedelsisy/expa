<?php

namespace App\Http\Middleware;

use App\Domains\Marketplace\Models\ServiceProvider;
use App\Support\ApiResponse;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/** The caller must own a provider listing (role provider + a service_providers row). The listing is resolved from the account, never from the URL. */
class EnsureProviderAccount
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();
        $provider = $user && $user->hasRole('provider') ? ServiceProvider::with('translations')->where('user_id', $user->id)->first() : null;
        if (! $provider) {
            return ApiResponse::error('provider_account_required', __('marketplace.provider_account_required'), 403);
        }
        $request->attributes->set('provider', $provider);

        return $next($request);
    }
}
