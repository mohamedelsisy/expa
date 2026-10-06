<?php

namespace App\Providers;

use App\Domains\Articles\Models\Article;
use App\Domains\Geo\Models\CityProfile;
use App\Domains\Marketplace\Models\ServiceProvider as ProviderListing;
use App\Domains\Privacy\Providers\CommunityData;
use App\Domains\Privacy\Providers\MarketplaceData;
use App\Policies\ArticlePolicy;
use App\Policies\CityProfilePolicy;
use App\Policies\ServiceProviderPolicy;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

/** Wiring for articles / city profiles, the service marketplace and the community (kept out of AppServiceProvider). */
class ContentMarketplaceServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->tag([
            MarketplaceData::class,
            CommunityData::class,
        ], 'privacy.providers');
    }

    public function boot(): void
    {
        Gate::policy(Article::class, ArticlePolicy::class);
        Gate::policy(CityProfile::class, CityProfilePolicy::class);
        Gate::policy(ProviderListing::class, ServiceProviderPolicy::class);

        RateLimiter::for('provider-reviews', fn (Request $r) => [Limit::perHour(5)->by('prv:'.$r->user()?->id), Limit::perDay(15)->by('prvd:'.$r->user()?->id)]);
        RateLimiter::for('provider-leads', fn (Request $r) => [Limit::perHour(5)->by('pld:'.$r->user()?->id), Limit::perDay(15)->by('pldd:'.$r->user()?->id)]);
        RateLimiter::for('provider-apply', fn (Request $r) => Limit::perHour(3)->by('papply:'.$r->user()?->id));
        RateLimiter::for('provider-uploads', fn (Request $r) => Limit::perHour(20)->by('pup:'.$r->user()?->id));
        RateLimiter::for('reports', fn (Request $r) => [Limit::perHour(20)->by('rep:'.$r->user()?->id)]);
        RateLimiter::for('community-post', fn (Request $r) => [Limit::perMinute(3)->by('cpm:'.$r->user()?->id), Limit::perHour(20)->by('cph:'.$r->user()?->id)]);
        RateLimiter::for('community-vote', fn (Request $r) => Limit::perMinute(30)->by('cv:'.$r->user()?->id));
    }
}
