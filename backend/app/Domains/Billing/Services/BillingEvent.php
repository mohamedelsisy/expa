<?php

namespace App\Domains\Billing\Services;

/** Provider-neutral webhook event. type: checkout.completed | payment.succeeded | payment.failed | payment.refunded | subscription.canceled */
final class BillingEvent
{
    public function __construct(
        public readonly string $id,
        public readonly string $type,
        public readonly int $userId,
        public readonly ?string $planKey = null,
        public readonly ?string $subscriptionRef = null,
        public readonly ?string $paymentRef = null,
        public readonly ?int $amountMinor = null,
        public readonly ?string $currency = null,
        public readonly ?\DateTimeInterface $periodStart = null,
        public readonly ?\DateTimeInterface $periodEnd = null,
        public readonly ?string $failureCode = null,
    ) {}
}
