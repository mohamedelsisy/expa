<?php

namespace App\Policies;

use App\Domains\Content\Policies\ContentPolicy;

class CityProfilePolicy extends ContentPolicy
{
    protected function prefix(): string
    {
        return 'cities';
    }
}
