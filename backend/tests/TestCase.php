<?php

namespace Tests;

use Illuminate\Foundation\Testing\TestCase as BaseTestCase;

abstract class TestCase extends BaseTestCase
{
    /**
     * Strict comparison of JSON objects that ignores key order. MySQL's JSON type re-orders object keys
     * (shorter keys first), MariaDB/SQLite keep insertion order; key order is not meaningful in JSON.
     */
    protected function assertSameJson(mixed $expected, mixed $actual, string $message = ''): void
    {
        $this->assertSame(self::sortKeys($expected), self::sortKeys($actual), $message);
    }

    private static function sortKeys(mixed $value): mixed
    {
        if (! is_array($value)) {
            return $value;
        }
        $value = array_map(self::sortKeys(...), $value);
        if (! array_is_list($value)) {
            ksort($value);
        }

        return $value;
    }
}
