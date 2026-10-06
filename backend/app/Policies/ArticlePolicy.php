<?php

namespace App\Policies;

use App\Domains\Content\Policies\ContentPolicy;

class ArticlePolicy extends ContentPolicy
{
    protected function prefix(): string
    {
        return 'articles';
    }
}
