<?php

namespace App\Policies;

use App\Domains\Content\Policies\ContentPolicy;

class UniversityPolicy extends ContentPolicy
{
    protected function prefix(): string
    {
        return 'universities';
    }
}
