<?php

namespace App\Domains\Documents\Services;

use App\Domains\Documents\Contracts\ContentScanner;

/** Runs scanners in order and returns the first rejection: cheap structural checks first, antivirus last. */
class ScannerChain implements ContentScanner
{
    /** @param  list<ContentScanner>  $scanners */
    public function __construct(private array $scanners) {}

    public function reject(string $absolutePath, string $detectedMime): ?string
    {
        foreach ($this->scanners as $scanner) {
            if (($reason = $scanner->reject($absolutePath, $detectedMime)) !== null) {
                return $reason;
            }
        }

        return null;
    }
}
