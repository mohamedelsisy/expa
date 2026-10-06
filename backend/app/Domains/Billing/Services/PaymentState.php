<?php

namespace App\Domains\Billing\Services;

/**
 * Payment state machine: pending -> succeeded | failed ; failed -> succeeded (provider retry of the same invoice) ;
 * succeeded -> refunded. `refunded` is terminal. A late "failed" event never downgrades a succeeded/refunded payment.
 */
final class PaymentState
{
    public const PENDING = 'pending';

    public const SUCCEEDED = 'succeeded';

    public const FAILED = 'failed';

    public const REFUNDED = 'refunded';

    /** @var array<string,list<string>> */
    private const TRANSITIONS = [
        self::PENDING => [self::SUCCEEDED, self::FAILED],
        self::FAILED => [self::SUCCEEDED],
        self::SUCCEEDED => [self::REFUNDED],
        self::REFUNDED => [],
    ];

    public static function can(string $from, string $to): bool
    {
        return $from === $to || in_array($to, self::TRANSITIONS[$from] ?? [], true);
    }
}
