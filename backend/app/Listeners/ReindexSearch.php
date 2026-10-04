<?php

namespace App\Listeners;

use App\Domains\Search\Services\SearchIndexer;
use App\Events\ContentChanged;

class ReindexSearch
{
    public function __construct(private SearchIndexer $indexer) {}

    public function handle(ContentChanged $event): void
    {
        $this->indexer->sync($event->item);
    }
}
