<?php

namespace App\Domains\Money\Policies;

use App\Domains\Content\Policies\ContentPolicy;

class TaxTablePolicy extends ContentPolicy
{
    protected function prefix(): string
    {
        return 'tax_tables';
    }
}
