<?php

namespace App\Policies;

use App\Domains\Content\Policies\ContentPolicy;

class GovernmentOfficePolicy extends ContentPolicy
{
    protected function prefix(): string
    {
        return 'government_offices';
    }
}
