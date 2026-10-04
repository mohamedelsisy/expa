<?php

namespace App\Domains\Profile\Services;

use App\Domains\Profile\Enums\ConsentPurpose;
use App\Domains\Profile\Models\Consent;
use App\Models\User;

class ConsentService
{
    /** Client-declared origin (X-Client header); anything else is stored as `api`. */
    private const SOURCES = ['web', 'ios', 'android', 'api'];

    /** Latest decision per purpose, with whether it was made under the current policy version. */
    public function current(User $user): array
    {
        $latest = [];
        foreach (Consent::where('user_id', $user->id)->orderBy('id')->get() as $row) {
            $latest[$row->purpose->value] = $row;
        }

        $out = [];
        foreach (ConsentPurpose::cases() as $purpose) {
            $row = $latest[$purpose->value] ?? null;
            $out[$purpose->value] = [
                'granted' => (bool) $row?->granted,
                'decided' => $row !== null,
                'policy_version' => $row?->policy_version,
                'outdated' => $row !== null && $row->policy_version !== config('privacy.policy_version'),
                'updated_at' => $row?->created_at?->toIso8601String(),
            ];
        }

        return $out;
    }

    public function has(User $user, ConsentPurpose $purpose): bool
    {
        return (bool) Consent::where('user_id', $user->id)
            ->where('purpose', $purpose->value)
            ->latest('id')
            ->value('granted');
    }

    /**
     * Record decisions. Only changes (or re-confirmation under a newer policy version) create rows.
     *
     * @param  array<string,bool>  $decisions  purpose value => granted
     */
    public function record(User $user, array $decisions, ?string $ip = null, string $source = 'api'): void
    {
        $current = $this->current($user);

        foreach ($decisions as $key => $granted) {
            $purpose = ConsentPurpose::from($key);
            $state = $current[$purpose->value];

            if ($state['decided'] && $state['granted'] === $granted && ! $state['outdated']) {
                continue;
            }

            Consent::create([
                'user_id' => $user->id,
                'purpose' => $purpose,
                'granted' => $granted,
                'policy_version' => config('privacy.policy_version'),
                'source' => in_array($source, self::SOURCES, true) ? $source : 'api',
                'ip_hash' => $ip ? hash_hmac('sha256', $ip, config('app.key')) : null,
            ]);
        }
    }
}
