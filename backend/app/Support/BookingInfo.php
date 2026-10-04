<?php

namespace App\Support;

/**
 * Booking payload shared by offices and appointment guides. EXPA never books on a user's behalf:
 * every payload says so explicitly, so no client can present a redirect as a completed booking.
 */
final class BookingInfo
{
    public static function make(?string $method, ?string $url): array
    {
        $method ??= 'unknown';

        return [
            'method' => $method,
            'method_label' => __("government.booking_methods.$method"),
            'url' => $url,
            'booked_by_expa' => false,
            'notice' => __('government.booking_notice'),
        ];
    }
}
