<?php

namespace App\Domains\Jobs\Importers;

use App\Domains\Jobs\Models\JobSource;

interface JobImporter
{
    /**
     * Raw items exactly as the source provides them. Throw on any fetch/parse failure:
     * the runner guarantees that a failure leaves existing jobs untouched.
     *
     * @return list<array<string,mixed>>
     */
    public function fetch(JobSource $source): array;

    /** Default canonical-field → raw-path mapping for this driver (overridable per source in config.map). */
    public function defaultMap(): array;
}
