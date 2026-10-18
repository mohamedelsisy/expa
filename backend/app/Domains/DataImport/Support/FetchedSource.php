<?php

namespace App\Domains\DataImport\Support;

use Carbon\CarbonImmutable;

final class FetchedSource
{
    public function __construct(
        public readonly string $path,        // absolute path of the cached raw download
        public readonly string $sha256,
        public readonly int $bytes,
        public readonly CarbonImmutable $fetchedAt,
        public readonly string $url,
    ) {}
}
