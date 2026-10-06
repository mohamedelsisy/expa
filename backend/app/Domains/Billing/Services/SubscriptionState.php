<?php

namespace App\Domains\Billing\Services;

/**
 * Subscription state machine (provider independent).
 *
 *   trialing ──► active ◄──────────────┐
 *      │           │  payment failed   │ payment succeeded
 *      │           ▼                   │
 *      │        past_due (grace) ──────┘
 *      ▼           │ grace over / provider gave up
 *   canceled ◄─────┤        expired  = paid period ended (cancel-at-period-end, manual grant) or grace over
 *   (terminal)     └──────► expired (terminal)
 *
 * `past_due` keeps access until `grace_ends_at` (Subscription::grantsAccess). `canceled` and `expired` are terminal:
 * a late payment event never revives them (it is still recorded and invoiced).
 */
final class SubscriptionState
{
    public const ACTIVE = 'active';

    public const TRIALING = 'trialing';

    public const PAST_DUE = 'past_due';

    public const CANCELED = 'canceled';

    public const EXPIRED = 'expired';

    /** @var array<string,list<string>> */
    private const TRANSITIONS = [
        self::TRIALING => [self::ACTIVE, self::PAST_DUE, self::CANCELED, self::EXPIRED],
        self::ACTIVE => [self::PAST_DUE, self::CANCELED, self::EXPIRED],
        self::PAST_DUE => [self::ACTIVE, self::CANCELED, self::EXPIRED],
        self::CANCELED => [],
        self::EXPIRED => [],
    ];

    public static function can(string $from, string $to): bool
    {
        return $from === $to || in_array($to, self::TRANSITIONS[$from] ?? [], true);
    }

    public static function isTerminal(string $status): bool
    {
        return in_array($status, [self::CANCELED, self::EXPIRED], true);
    }

    /** @return list<string> */
    public static function all(): array
    {
        return array_keys(self::TRANSITIONS);
    }
}
