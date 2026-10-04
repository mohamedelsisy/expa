<?php

namespace App\Casts;

use Illuminate\Contracts\Database\Eloquent\CastsAttributes;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Carbon;

/**
 * Calendar dates (expiry, issue, remind-on) are stored as plain `Y-m-d` on every engine and read as
 * start-of-day Carbon. Eloquent's built-in `date` cast writes a full datetime string, which makes
 * boundary-day string comparisons behave differently on SQLite and MySQL.
 */
class DateOnly implements CastsAttributes
{
    public function get(Model $model, string $key, mixed $value, array $attributes): ?Carbon
    {
        return $value === null ? null : Carbon::parse($value)->startOfDay();
    }

    public function set(Model $model, string $key, mixed $value, array $attributes): ?string
    {
        if ($value === null || $value === '') {
            return null;
        }

        return ($value instanceof \DateTimeInterface ? Carbon::instance($value) : Carbon::parse($value))->toDateString();
    }

    public function serialize(Model $model, string $key, mixed $value, array $attributes): ?string
    {
        return $value?->toDateString();
    }
}
