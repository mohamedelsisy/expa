<?php

namespace App\Domains\DataImport\Support;

use Illuminate\Support\Carbon;

/**
 * Same rule as the content seeders: imported content is published immediately only in local/testing so the app is
 * usable; everywhere else it enters the normal review workflow (four-eyes is never bypassed).
 */
final class Lifecycle
{
    public static function isLocalPublish(): bool
    {
        return app()->environment('local', 'testing');
    }

    /** @return array{status:string,published_at:?Carbon} */
    public static function attributes(?\DateTimeInterface $alreadyPublishedAt = null): array
    {
        return self::isLocalPublish()
            ? ['status' => 'published', 'published_at' => $alreadyPublishedAt ?? now()]
            : ['status' => 'review', 'published_at' => null];
    }
}
