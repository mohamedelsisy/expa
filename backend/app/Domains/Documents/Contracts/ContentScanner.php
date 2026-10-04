<?php

namespace App\Domains\Documents\Contracts;

/** Implement with a real antivirus (e.g. ClamAV via clamd socket) and bind in AppServiceProvider for production. */
interface ContentScanner
{
    /** @return string|null a machine reason code when the file must be rejected, null when clean */
    public function reject(string $absolutePath, string $detectedMime): ?string;
}
