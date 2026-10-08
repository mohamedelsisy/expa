<?php

namespace App\Providers;

use App\Domains\Ai\Contracts\LlmClient;
use App\Domains\Ai\Services\AnthropicClient;
use App\Domains\Ai\Services\FakeLlmClient;
use App\Domains\Analytics\Analytics;
use App\Domains\Appointments\Models\AppointmentGuide;
use App\Domains\Audit\Services\AuditLogger;
use App\Domains\Billing\Contracts\PaymentProvider;
use App\Domains\Billing\Services\FakePaymentProvider;
use App\Domains\Billing\Services\StripePaymentProvider;
use App\Domains\Billing\Services\SubscriptionService;
use App\Domains\Dashboard\Actions\ConsentActions;
use App\Domains\Dashboard\Actions\DocumentActions;
use App\Domains\Dashboard\Actions\LearningActions;
use App\Domains\Dashboard\Actions\OnboardingActions;
use App\Domains\Dashboard\Actions\SetupTaskActions;
use App\Domains\Dashboard\Services\NextActionAggregator;
use App\Domains\Dashboard\Services\SetupCatalog;
use App\Domains\Documents\Contracts\ContentScanner;
use App\Domains\Documents\Models\UserDocument;
use App\Domains\Documents\Services\BasicContentScanner;
use App\Domains\Documents\Services\ClamdScanner;
use App\Domains\Documents\Services\ScannerChain;
use App\Domains\Government\Models\GovernmentOffice;
use App\Domains\Government\Models\GovernmentService;
use App\Domains\Guides\Models\Guide;
use App\Domains\Learning\Models\ItalianLesson;
use App\Domains\Notifications\Contracts\PushSender;
use App\Domains\Notifications\Services\FcmPushSender;
use App\Domains\Notifications\Services\LogPushSender;
use App\Domains\Patente\Models\PatenteCategory;
use App\Domains\Patente\Models\PatenteQuestion;
use App\Domains\Patente\Models\PatenteTopic;
use App\Domains\Privacy\Providers\AccountData;
use App\Domains\Privacy\Providers\AiData;
use App\Domains\Privacy\Providers\AuditData;
use App\Domains\Privacy\Providers\BillingData;
use App\Domains\Privacy\Providers\ConsentData;
use App\Domains\Privacy\Providers\DocumentData;
use App\Domains\Privacy\Providers\JobsData;
use App\Domains\Privacy\Providers\LearningData;
use App\Domains\Privacy\Providers\NotificationData;
use App\Domains\Privacy\Providers\PatenteData;
use App\Domains\Privacy\Providers\ProfileData;
use App\Domains\Privacy\Providers\SetupTaskData;
use App\Domains\Privacy\Providers\TwoFactorData;
use App\Domains\Privacy\Services\PersonalDataExporter;
use App\Domains\Privacy\Services\UserEraser;
use App\Domains\Reminders\Services\UserDocumentObserver;
use App\Domains\Study\Models\Scholarship;
use App\Domains\Study\Models\StudyProgram;
use App\Domains\Study\Models\University;
use App\Models\User;
use App\Policies\AppointmentGuidePolicy;
use App\Policies\GovernmentOfficePolicy;
use App\Policies\GovernmentServicePolicy;
use App\Policies\GuidePolicy;
use App\Policies\ItalianLessonPolicy;
use App\Policies\PatenteCategoryPolicy;
use App\Policies\PatenteQuestionPolicy;
use App\Policies\PatenteTopicPolicy;
use App\Policies\ScholarshipPolicy;
use App\Policies\StudyProgramPolicy;
use App\Policies\UniversityPolicy;
use App\Policies\UserPolicy;
use App\Support\LoginGuard;
use App\Support\TrustedProxies;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\URL;
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
            LearningData::class,
            PatenteData::class,
            JobsData::class,
            BillingData::class,
            TwoFactorData::class,
        ], 'privacy.providers');

        $this->app->bind(PushSender::class, fn () => match (config('notifications.push_driver')) {
            'fcm' => new FcmPushSender((array) config('notifications.fcm')),
            'log' => new LogPushSender,
            default => throw new \RuntimeException('Unknown notifications.push_driver ['.config('notifications.push_driver').'].'),
        });
        $this->app->singleton(PaymentProvider::class, fn () => match (config('billing.provider')) {
            'fake' => new FakePaymentProvider,
            'stripe' => new StripePaymentProvider((array) config('billing.stripe')),
            default => throw new \RuntimeException('No payment provider bound for ['.config('billing.provider').']; implement PaymentProvider and bind it here.'),
        });
        $this->app->scoped(SubscriptionService::class);
        $this->app->singleton(Analytics::class);

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
            LearningActions::class,
        ], 'dashboard.action_providers');

        $this->app->bind(ContentScanner::class, fn () => match (config('documents.scanner')) {
            'basic' => new BasicContentScanner,
            // Cheap structural pre-filter first, then the antivirus (clamd INSTREAM, fail-closed by default).
            'clamav' => new ScannerChain([new BasicContentScanner, new ClamdScanner((array) config('documents.clamav'))]),
            default => throw new \RuntimeException('Unknown documents.scanner ['.config('documents.scanner').']; bind a ContentScanner implementation.'),
        });
        $this->app->scoped(SetupCatalog::class);
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

        // Behind a TLS-terminating balancer the client IP (rate limits) and scheme come from forwarded headers: honour them
        // only from explicitly trusted proxies (TRUSTED_PROXIES="10.0.0.0/8,..." or "*" on a private network). Read from
        // config (never env()) so it survives `config:cache`.
        TrustedProxies::apply(config('expa.trusted_proxies'));

        UserDocument::observe(UserDocumentObserver::class);
        // NotifyUserOfReminder is registered by Laravel's listener auto-discovery (app/Listeners); do not register it twice.

        if ($this->app->isProduction()) {
            URL::forceScheme('https');
            // Links (mail, signed URLs) always use the configured origin, never a client-supplied Host header.
            URL::forceRootUrl(config('app.url'));
        }

        Gate::before(fn (User $user) => $user->isSuperAdmin() ? true : null);
        foreach (config('permissions.permissions') as $key) {
            Gate::define($key, fn (User $user) => $user->hasPermission($key));
        }
        Gate::policy(User::class, UserPolicy::class);
        Gate::policy(Guide::class, GuidePolicy::class);
        Gate::policy(University::class, UniversityPolicy::class);
        Gate::policy(StudyProgram::class, StudyProgramPolicy::class);
        Gate::policy(Scholarship::class, ScholarshipPolicy::class);
        Gate::policy(PatenteCategory::class, PatenteCategoryPolicy::class);
        Gate::policy(PatenteTopic::class, PatenteTopicPolicy::class);
        Gate::policy(PatenteQuestion::class, PatenteQuestionPolicy::class);
        Gate::policy(ItalianLesson::class, ItalianLessonPolicy::class);
        Gate::policy(GovernmentService::class, GovernmentServicePolicy::class);
        Gate::policy(GovernmentOffice::class, GovernmentOfficePolicy::class);
        Gate::policy(AppointmentGuide::class, AppointmentGuidePolicy::class);

        RateLimiter::for('api', fn (Request $r) => Limit::perMinute(180)->by('api:'.($r->user('sanctum')?->id ?? $r->ip())));
        RateLimiter::for('login', function (Request $r) {
            // Normalise first (trim/case; arrays or junk must not throw or open a second bucket for the same account).
            $email = LoginGuard::normalise($r->input('email'));

            // Per-request buckets only reach the attacker's own (email, IP) / IP. The per-ACCOUNT policy counts failures only
            // and never hard-blocks the owner: see App\Support\LoginGuard (BE-2).
            return [
                Limit::perMinute(5)->by('login:'.$email.'|'.$r->ip()),
                Limit::perMinute(30)->by('login-ip:'.$r->ip()),
            ];
        });
        // Per-IP ceiling on the second login step; the per-user+IP FAILURE budget lives in TwoFactorService.
        RateLimiter::for('two-factor', fn (Request $r) => Limit::perMinute(20)->by('2fa-ip:'.$r->ip()));
        RateLimiter::for('two-factor-manage', fn (Request $r) => Limit::perMinute(30)->by('2fa-u:'.($r->user('sanctum')?->id ?? $r->ip())));
        RateLimiter::for('register', fn (Request $r) => Limit::perMinute(10)->by('register:'.$r->ip()));
        RateLimiter::for('patente-exams', fn (Request $r) => Limit::perHour(20)->by('patente:'.$r->user()?->id));
        RateLimiter::for('search', fn (Request $r) => Limit::perMinute(60)->by('search:'.($r->user('sanctum')?->id ?? $r->ip())));
        RateLimiter::for('billing-webhook', fn (Request $r) => Limit::perMinute(120)->by('wh:'.$r->ip()));
        RateLimiter::for('analytics', fn (Request $r) => Limit::perMinute(60)->by('an:'.($r->user('sanctum')?->id ?? $r->ip())));
        RateLimiter::for('ai', fn (Request $r) => Limit::perMinute(20)->by('ai:'.$r->user()?->id));
        RateLimiter::for('uploads', fn (Request $r) => Limit::perHour(30)->by('upload:'.$r->user()?->id));
        RateLimiter::for('privacy', fn (Request $r) => Limit::perHour(5)->by('privacy:'.$r->user()?->id));
        RateLimiter::for('password-reset', fn (Request $r) => Limit::perMinute(5)->by('pwreset:'.$r->ip()));
    }
}
