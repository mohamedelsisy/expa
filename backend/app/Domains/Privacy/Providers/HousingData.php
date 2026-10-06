<?php

namespace App\Domains\Privacy\Providers;

use App\Domains\Housing\Models\HousingCheck;
use App\Domains\Privacy\Contracts\PersonalDataProvider;
use App\Models\User;

/** Saved rental-checker results (explicitly saved by the user; the pasted text is never stored). */
class HousingData implements PersonalDataProvider
{
    public function key(): string
    {
        return 'housing_checks';
    }

    public function export(User $user): array
    {
        return HousingCheck::where('user_id', $user->id)->orderBy('id')->get()
            ->map(fn ($c) => ['label' => $c->label, 'locale' => $c->locale, 'created_at' => $c->created_at?->toIso8601String(), 'expires_at' => $c->expires_at?->toIso8601String(), 'result' => $c->result])->all();
    }

    public function erase(User $user): void
    {
        HousingCheck::where('user_id', $user->id)->delete();
    }
}
