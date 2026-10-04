<?php

namespace App\Providers;

use App\Models\User;
use App\Policies\UserPolicy;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;
use Illuminate\Validation\Rules\Password;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Password::defaults(function () {
            $rule = Password::min(10)->letters()->numbers();

            // Breached-password check calls an external API; only enforce where it is reachable.
            return $this->app->isProduction() ? $rule->uncompromised() : $rule;
        });

        Gate::before(fn (User $user) => $user->isSuperAdmin() ? true : null);
        foreach (config('permissions.permissions') as $key) {
            Gate::define($key, fn (User $user) => $user->hasPermission($key));
        }
        Gate::policy(User::class, UserPolicy::class);

        RateLimiter::for('login', fn (Request $r) => [
            Limit::perMinute(5)->by('login:'.mb_strtolower((string) $r->input('email')).'|'.$r->ip()),
            Limit::perMinute(30)->by('login-ip:'.$r->ip()),
        ]);
        RateLimiter::for('register', fn (Request $r) => Limit::perMinute(10)->by('register:'.$r->ip()));
        RateLimiter::for('password-reset', fn (Request $r) => Limit::perMinute(5)->by('pwreset:'.$r->ip()));
    }
}
