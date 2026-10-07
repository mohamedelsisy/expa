<?php

namespace App\Domains\Dashboard\Services;

use App\Domains\Profile\Enums\ConsentPurpose;
use App\Domains\Profile\Services\ConsentService;
use App\Models\User;

/**
 * The only door through which personalization reads profile data. Without the user's
 * `profile_personalization` consent the context is empty and everything falls back to universal behaviour.
 */
final class ProfileContext
{
    public function __construct(
        public readonly bool $personalized,
        public readonly ?string $segment = null,
        public readonly array $goals = [],
        public readonly ?string $residenceType = null,
        public readonly ?int $cityId = null,
        public readonly ?string $italianLevel = null,
    ) {}

    public static function for(User $user): self
    {
        if (! app(ConsentService::class)->has($user, ConsentPurpose::ProfilePersonalization)) {
            return new self(false);
        }

        $p = $user->profile;

        return new self(true, $p?->segment?->value, $p?->goals ?? [], $p?->residence_type, $p?->city_id, $p?->italian_level?->value);
    }
}
