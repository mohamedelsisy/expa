<?php

namespace App\Policies;

use App\Domains\Content\Policies\ContentPolicy;

class PatenteCategoryPolicy extends ContentPolicy
{
    protected function prefix(): string
    {
        return 'patente';
    }
}
