<?php

namespace App\Domains\Billing\Services;

final class CheckoutSession
{
    public function __construct(public readonly string $url, public readonly string $providerRef) {}
}
