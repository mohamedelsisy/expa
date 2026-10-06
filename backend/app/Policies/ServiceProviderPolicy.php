<?php

namespace App\Policies;

use App\Domains\Content\Policies\ContentPolicy;

class ServiceProviderPolicy extends ContentPolicy
{
    protected function prefix(): string
    {
        return 'providers';
    }
}
