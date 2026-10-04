<?php

namespace App\Policies;

use App\Domains\Content\Policies\ContentPolicy;

class StudyProgramPolicy extends ContentPolicy
{
    protected function prefix(): string
    {
        return 'universities';
    }
}
