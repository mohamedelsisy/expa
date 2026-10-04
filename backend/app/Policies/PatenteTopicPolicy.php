<?php

namespace App\Policies;

use App\Domains\Content\Policies\ContentPolicy;

class PatenteTopicPolicy extends ContentPolicy
{
    protected function prefix(): string
    {
        return 'patente';
    }
}
