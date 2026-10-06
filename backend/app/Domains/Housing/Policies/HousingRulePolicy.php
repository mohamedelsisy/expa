<?php

namespace App\Domains\Housing\Policies;

use App\Domains\Content\Policies\ContentPolicy;

class HousingRulePolicy extends ContentPolicy
{
    protected function prefix(): string
    {
        return 'housing_rules';
    }
}
