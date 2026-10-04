<?php

namespace App\Domains\Dashboard\Actions;

use App\Domains\Dashboard\Contracts\NextActionProvider;
use App\Domains\Documents\Models\UserDocument;
use App\Models\User;

/** Expired / soon-to-expire documents outrank every routine suggestion (priority 0–99). */
class DocumentActions implements NextActionProvider
{
    private const MAX = 3;

    public function actionsFor(User $user): array
    {
        $horizon = now()->addDays(config('documents.expiring_soon_days'))->toDateString();

        $docs = UserDocument::where('user_id', $user->id)
            ->whereNotNull('expiry_date')->where('expiry_date', '<=', $horizon)
            ->with('type.translations')->orderBy('expiry_date')->limit(self::MAX)->get();

        return $docs->map(function (UserDocument $d) {
            $days = $d->daysRemaining();
            $expired = $days < 0;

            return [
                'key' => 'document.'.$d->id,
                'type' => 'document',
                'priority' => $expired ? 0 : 3 + $days, // 3..93
                'title' => $expired
                    ? __('documents.actions.expired.title', ['document' => $d->displayName()])
                    : __('documents.actions.expiring.title', ['document' => $d->displayName(), 'days' => $days]),
                'description' => __($expired ? 'documents.actions.expired.description' : 'documents.actions.expiring.description'),
                'cta' => ['type' => 'route', 'target' => 'my-documents/'.$d->id],
            ];
        })->all();
    }
}
