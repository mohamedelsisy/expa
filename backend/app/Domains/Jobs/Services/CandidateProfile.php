<?php

namespace App\Domains\Jobs\Services;

use App\Domains\Jobs\Models\JobProfile;
use App\Domains\Profile\Enums\ConsentPurpose;
use App\Domains\Profile\Services\ConsentService;
use App\Models\User;

/** Identity-free candidate facts for matching; empty unless the user consented to personalization. */
class CandidateProfile
{
    public function __construct(private ConsentService $consents) {}

    /** @return array{0:?JobProfile,1:array{italian_level:?string,english_level:?string,city_id:?int}} */
    public function for(User $user): array
    {
        if (! $this->consents->has($user, ConsentPurpose::ProfilePersonalization)) {
            return [null, ['italian_level' => null, 'english_level' => null, 'city_id' => null]];
        }
        $p = $user->profile;

        return [JobProfile::where('user_id', $user->id)->first(), [
            'italian_level' => $p?->italian_level?->value,
            'english_level' => $p?->english_level?->value,
            'city_id' => $p?->city_id,
        ]];
    }
}
