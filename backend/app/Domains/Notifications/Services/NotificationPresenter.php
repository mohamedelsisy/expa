<?php

namespace App\Domains\Notifications\Services;

use App\Domains\Documents\Models\UserDocument;
use App\Domains\Notifications\Models\UserNotification;
use Illuminate\Support\Collection;

/** Turns stored, locale-neutral notification data into localized text at read/send time. */
class NotificationPresenter
{
    public function title(UserNotification $n): string
    {
        if ($n->type === 'announcement') {
            return $this->announcement($n, 'title');
        }

        return __("notifications.types.{$n->type}.title", $this->params($n));
    }

    public function body(UserNotification $n): string
    {
        if ($n->type === 'announcement') {
            return $this->announcement($n, 'body');
        }

        return __("notifications.types.{$n->type}.body", $this->params($n));
    }

    /** @return array{type:string,target:string}|null */
    public function cta(UserNotification $n, ?Collection $existingDocIds = null): ?array
    {
        $id = $n->data['document_id'] ?? null;
        if (! $id) {
            return null;
        }
        $exists = $existingDocIds ? $existingDocIds->contains($id) : UserDocument::whereKey($id)->where('user_id', $n->user_id)->exists();

        return $exists ? ['type' => 'route', 'target' => "my-documents/$id"] : null;
    }

    /** Admin-written text stored per locale; falls back along the content chain (ar -> en -> it). */
    private function announcement(UserNotification $n, string $field): string
    {
        $texts = (array) ($n->data[$field] ?? []);
        foreach ([app()->getLocale(), ...(config('content.fallbacks.'.app()->getLocale()) ?? []), 'ar'] as $l) {
            if (! empty($texts[$l])) {
                return (string) $texts[$l];
            }
        }

        return '';
    }

    private function params(UserNotification $n): array
    {
        return [
            'name' => $n->data['name'] ?? '',
            'days' => $n->data['days'] ?? '',
            'date' => $n->data['expiry_date'] ?? '',
            'source' => $n->data['source'] ?? '',
            'failures' => $n->data['failures'] ?? '',
        ];
    }
}
