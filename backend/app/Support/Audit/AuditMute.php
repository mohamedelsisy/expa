<?php

namespace App\Support\Audit;

/**
 * Bulk imports write thousands of rows; auditing each one would bury the audit log. While muted, the Auditable trait
 * skips per-record entries, and the import run records ONE summary entry instead (dataset, source, counts).
 * Reference-counted so nested runs behave; reset between tests.
 */
final class AuditMute
{
    private static int $depth = 0;

    public static function on(): void
    {
        self::$depth++;
    }

    public static function off(): void
    {
        self::$depth = max(0, self::$depth - 1);
    }

    public static function isMuted(): bool
    {
        return self::$depth > 0;
    }

    public static function reset(): void
    {
        self::$depth = 0;
    }
}
