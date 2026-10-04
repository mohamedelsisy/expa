<?php

namespace App\Providers;

use App\Domains\Audit\Services\AuditLogger;
use App\Domains\Dashboard\Actions\ConsentActions;
use App\Domains\Dashboard\Actions\OnboardingActions;
use App\Domains\Dashboard\Actions\SetupTaskActions;
use App\Domains\Dashboard\Services\NextActionAggregator;
use App\Domains\Guides\Models\Guide;
use App\Domains\Privacy\Providers\AccountData;
use App\Domains\Privacy\Providers\AuditData;
use App\Domains\Privacy\Providers\ConsentData;
use App\Domains\Privacy\Providers\ProfileData;
use App\Domains\Privacy\Providers\SetupTaskData;
use App\Domains\Privacy\Services\PersonalDataExporter;
use App\Domains\Privacy\Services\UserEraser;
use App\Models\User;
use App\Policies\GuidePolicy;
use App\Policies\UserPolicy;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Database\Schema\Blueprint;
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
        // Every module holding personal data must be added here (see PersonalDataProvider).
        $this->app->tag([
            AccountData::class,
            ProfileData::class,
            ConsentData::class,
            AuditData::class,
            SetupTaskData::class,
        ], 'privacy.providers');

        // Modules add "What should I do next?" suggestions here (see NextActionProvider).
        $this->app->tag([
            OnboardingActions::class,
            ConsentActions::class,
            SetupTaskActions::class,
        ], 'dashboard.action_providers');
        $this->app->bind(NextActionAggregator::class, fn ($app) => new NextActionAggregator($app->tagged('dashboard.action_providers')));

        $this->app->bind(PersonalDataExporter::class, fn ($app) => new PersonalDataExporter($app->tagged('privacy.providers')));
        $this->app->bind(UserEraser::class, fn ($app) => new UserEraser($app->tagged('privacy.providers'), $app->make(AuditLogger::class)));
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Blueprint::macro('contentLifecycle', function () {
            /** @var Blueprint $this */
            $this->string('status', 20)->default('draft')->index();
            $this->timestamp('publish_at')->nullable();
            $this->timestamp('published_at')->nullable();
        });
        Blueprint::macro('sourceFields', function () {
            /** @var Blueprint $this */
            $this->string('source_name')->nullable();
            $this->string('source_url', 2048)->nullable();
            $this->string('source_type', 20)->nullable();
            $this->timestamp('last_verified_at')->nullable();
        });

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
        Gate::policy(Guide::class, GuidePolicy::class);

        RateLimiter::for('login', fn (Request $r) => [
            Limit::perMinute(5)->by('login:'.mb_strtolower((string) $r->input('email')).'|'.$r->ip()),
            Limit::perMinute(30)->by('login-ip:'.$r->ip()),
        ]);
        RateLimiter::for('register', fn (Request $r) => Limit::perMinute(10)->by('register:'.$r->ip()));
        RateLimiter::for('privacy', fn (Request $r) => Limit::perHour(5)->by('privacy:'.$r->user()?->id));
        RateLimiter::for('password-reset', fn (Request $r) => Limit::perMinute(5)->by('pwreset:'.$r->ip()));
    }
}
