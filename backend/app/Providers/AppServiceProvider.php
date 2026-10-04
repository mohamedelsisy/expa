<?php

namespace App\Providers;

use App\Domains\Ai\Contracts\LlmClient;
use App\Domains\Ai\Services\AnthropicClient;
use App\Domains\Ai\Services\FakeLlmClient;
use App\Domains\Appointments\Models\AppointmentGuide;
use App\Domains\Audit\Services\AuditLogger;
use App\Domains\Dashboard\Actions\ConsentActions;
use App\Domains\Dashboard\Actions\DocumentActions;
use App\Domains\Dashboard\Actions\OnboardingActions;
use App\Domains\Dashboard\Actions\SetupTaskActions;
use App\Domains\Dashboard\Services\NextActionAggregator;
use App\Domains\Documents\Contracts\ContentScanner;
use App\Domains\Documents\Models\UserDocument;
use App\Domains\Documents\Services\BasicContentScanner;
use App\Domains\Government\Models\GovernmentOffice;
use App\Domains\Government\Models\GovernmentService;
use App\Domains\Guides\Models\Guide;
use App\Domains\Notifications\Contracts\PushSender;
use App\Domains\Notifications\Services\LogPushSender;
use App\Domains\Privacy\Providers\AccountData;
use App\Domains\Privacy\Providers\AiData;
use App\Domains\Privacy\Providers\AuditData;
use App\Domains\Privacy\Providers\ConsentData;
use App\Domains\Privacy\Providers\DocumentData;
use App\Domains\Privacy\Providers\NotificationData;
use App\Domains\Privacy\Providers\ProfileData;
use App\Domains\Privacy\Providers\SetupTaskData;
use App\Domains\Privacy\Services\PersonalDataExporter;
use App\Domains\Privacy\Services\UserEraser;
use App\Domains\Reminders\Services\UserDocumentObserver;
use App\Models\User;
use App\Policies\AppointmentGuidePolicy;
use App\Policies\GovernmentOfficePolicy;
use App\Policies\GovernmentServicePolicy;
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
            DocumentData::class,
            NotificationData::class,
            AiData::class,
        ], 'privacy.providers');

        $this->app->bind(PushSender::class, LogPushSender::class);

        // One shared instance so tests can script the fake client; the driver is chosen by config only.
        $this->app->singleton(LlmClient::class, fn () => match (config('ai.driver')) {
            'anthropic' => new AnthropicClient,
            'fake' => new FakeLlmClient,
            default => throw new \RuntimeException('Unknown ai.driver ['.config('ai.driver').'].'),
        });

        // Modules add "What should I do next?" suggestions here (see NextActionProvider).
        $this->app->tag([
            OnboardingActions::class,
            ConsentActions::class,
            SetupTaskActions::class,
            DocumentActions::class,
        ], 'dashboard.action_providers');

        $this->app->bind(ContentScanner::class, fn () => match (config('documents.scanner')) {
            'basic' => new BasicContentScanner,
            default => throw new \RuntimeException('Unknown documents.scanner ['.config('documents.scanner').']; bind a ContentScanner implementation.'),
        });
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

        UserDocument::observe(UserDocumentObserver::class);
        // NotifyUserOfReminder is registered by Laravel's listener auto-discovery (app/Listeners); do not register it twice.

        Gate::before(fn (User $user) => $user->isSuperAdmin() ? true : null);
        foreach (config('permissions.permissions') as $key) {
            Gate::define($key, fn (User $user) => $user->hasPermission($key));
        }
        Gate::policy(User::class, UserPolicy::class);
        Gate::policy(Guide::class, GuidePolicy::class);
        Gate::policy(GovernmentService::class, GovernmentServicePolicy::class);
        Gate::policy(GovernmentOffice::class, GovernmentOfficePolicy::class);
        Gate::policy(AppointmentGuide::class, AppointmentGuidePolicy::class);

        RateLimiter::for('login', fn (Request $r) => [
            Limit::perMinute(5)->by('login:'.mb_strtolower((string) $r->input('email')).'|'.$r->ip()),
            Limit::perMinute(30)->by('login-ip:'.$r->ip()),
        ]);
        RateLimiter::for('register', fn (Request $r) => Limit::perMinute(10)->by('register:'.$r->ip()));
        RateLimiter::for('ai', fn (Request $r) => Limit::perMinute(20)->by('ai:'.$r->user()?->id));
        RateLimiter::for('uploads', fn (Request $r) => Limit::perHour(30)->by('upload:'.$r->user()?->id));
        RateLimiter::for('privacy', fn (Request $r) => Limit::perHour(5)->by('privacy:'.$r->user()?->id));
        RateLimiter::for('password-reset', fn (Request $r) => Limit::perMinute(5)->by('pwreset:'.$r->ip()));
    }
}
