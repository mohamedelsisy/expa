<?php

namespace App\Domains\Ai\Services;

use App\Domains\Documents\Models\UserDocument;
use App\Domains\Profile\Enums\ConsentPurpose;
use App\Domains\Profile\Services\ConsentService;
use App\Models\User;

/**
 * Minimal, consent-gated context for the model. Never includes name, email, document labels/notes or files.
 * Without the `ai_personalization` consent the context is empty.
 */
class UserContextBuilder
{
    public function __construct(private ConsentService $consents) {}

    /** @return array<string,mixed> */
    public function build(User $user): array
    {
        if (! $this->consents->has($user, ConsentPurpose::AiPersonalization)) {
            return [];
        }

        $p = $user->profile()->with('city.translations')->first();
        $ctx = array_filter([
            'nationality' => $p?->nationality,
            'city' => $p?->city?->localized('name'),
            'situation' => $p?->segment?->value,
            'residence_type' => $p?->residence_type,
            'italian_level' => $p?->italian_level?->value,
        ]);

        $expiring = UserDocument::where('user_id', $user->id)->whereNotNull('expiry_date')
            ->where('expiry_date', '<=', now()->addDays(120)->toDateString())->with('type')->orderBy('expiry_date')->limit(3)->get()
            ->map(fn (UserDocument $d) => ['type' => $d->type->key, 'days_remaining' => $d->daysRemaining()])->all();
        if ($expiring) {
            $ctx['documents_expiring'] = $expiring;
        }

        return $ctx;
    }
}
