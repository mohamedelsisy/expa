<?php

namespace App\Policies;

use App\Domains\Content\Policies\ContentPolicy;

class ItalianLessonPolicy extends ContentPolicy
{
    protected function prefix(): string
    {
        return 'italian_lessons';
    }
}
