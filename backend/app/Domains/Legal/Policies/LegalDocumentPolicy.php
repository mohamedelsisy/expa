<?php

namespace App\Domains\Legal\Policies;

use App\Domains\Content\Policies\ContentPolicy;

class LegalDocumentPolicy extends ContentPolicy
{
    protected function prefix(): string
    {
        return 'legal';
    }
}
