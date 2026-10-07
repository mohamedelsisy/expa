<?php

namespace App\Domains\Travel\Policies;

use App\Domains\Content\Policies\ContentPolicy;

class TravelRequirementPolicy extends ContentPolicy
{
    protected function prefix(): string
    {
        return 'travel_requirements';
    }
}
