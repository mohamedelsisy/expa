<?php

namespace App\Policies;

use App\Domains\Content\Policies\ContentPolicy;

class GovernmentServicePolicy extends ContentPolicy
{
    protected function prefix(): string
    {
        return 'government_services';
    }
}
