<?php

namespace App\Domains\Privacy\Contracts;

use App\Models\User;

/**
 * Every module that stores personal data implements this and is tagged `privacy.providers`
 * in AppServiceProvider. That is what makes export (Art. 15/20) and erasure (Art. 17) complete
 * by construction: a module that is not registered here is a GDPR gap.
 */
interface PersonalDataProvider
{
    /** Key of this section in the export bundle. */
    public function key(): string;

    /** @return array<string,mixed>|list<mixed> */
    public function export(User $user): array;

    /** Permanently delete or anonymize this module's data for the user. */
    public function erase(User $user): void;
}
