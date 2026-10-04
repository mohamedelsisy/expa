<?php

namespace App\Domains\Privacy\Providers;

use App\Domains\Privacy\Contracts\PersonalDataProvider;
use App\Domains\Profile\Models\Consent;
use App\Models\User;

class ConsentData implements PersonalDataProvider
{
    public function key(): string
    {
        return 'consents';
    }

    public function export(User $user): array
    {
        return Consent::where('user_id', $user->id)->orderBy('id')->get()->map(fn (Consent $c) => [
            'purpose' => $c->purpose->value,
            'granted' => $c->granted,
            'policy_version' => $c->policy_version,
            'source' => $c->source,
            'at' => $c->created_at?->toIso8601String(),
        ])->all();
    }

    /**
     * The decision history is kept (accountability, Art. 5(2) / 7(1): proof that consent was obtained)
     * but severed from the person: the row points at the anonymized stub and the IP hash is dropped.
     */
    public function erase(User $user): void
    {
        Consent::where('user_id', $user->id)->toBase()->update(['ip_hash' => null]);
    }
}
