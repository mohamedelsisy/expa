<?php

namespace App\Events;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Foundation\Events\Dispatchable;

/** A lifecycle content item (guide, service, office, appointment guide) was created, edited, deleted or changed status. */
class ContentChanged
{
    use Dispatchable;

    public function __construct(public Model $item) {}
}
