<?php

namespace App\Domains\Analytics;

use App\Domains\Profile\Enums\ConsentPurpose;
use App\Domains\Profile\Services\ConsentService;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Throwable;

/**
 * Privacy-first product analytics: daily aggregate counters keyed by event, platform, language and (for content
 * popularity) a public slug. Nothing identifies a person.
 *
 *  - system(): server-side counters for core product events. They contain no personal data (only counts), so they
 *    do not depend on consent; this is a documented decision pending legal review (config analytics.system_events).
 *  - client(): behaviour reported by an app/web client; recorded only with the user's `analytics` consent.
 *    Analytics must never break the request: failures are swallowed.
 */
class Analytics
{
    public function __construct(private ConsentService $consents) {}

    public function system(AnalyticsEvent $event, ?string $subject = null): void
    {
        if (config('analytics.system_events')) {
            $this->increment($event, $subject);
        }
    }

    public function client(AnalyticsEvent $event, ?string $subject, ?User $user, bool $anonymousConsent): bool
    {
        $allowed = $user ? $this->consents->has($user, ConsentPurpose::Analytics) : $anonymousConsent;
        if (! $allowed) {
            return false;
        }
        $this->increment($event, $subject);

        return true;
    }

    private function increment(AnalyticsEvent $event, ?string $subject): void
    {
        try {
            $platform = $this->platform();
            $subject = $event->allowsSubject() ? mb_substr((string) $subject, 0, 120) : '';
            $keys = ['day' => now()->toDateString(), 'name' => $event->value, 'platform' => $platform, 'locale' => app()->getLocale(), 'subject' => $subject];

            DB::table('analytics_daily')->insertOrIgnore($keys + ['count' => 0]);
            DB::table('analytics_daily')->where($keys)->increment('count');
        } catch (Throwable $e) {
            report($e);
        }
    }

    private function platform(): string
    {
        $client = strtolower((string) request()->header('X-Client', 'api'));

        return in_array($client, ['web', 'ios', 'android'], true) ? $client : 'api';
    }
}
