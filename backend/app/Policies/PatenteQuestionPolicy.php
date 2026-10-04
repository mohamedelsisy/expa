<?php

namespace App\Policies;

use App\Domains\Content\Policies\ContentPolicy;

class PatenteQuestionPolicy extends ContentPolicy
{
    protected function prefix(): string
    {
        return 'patente';
    }
}
