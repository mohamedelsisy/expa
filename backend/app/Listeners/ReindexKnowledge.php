<?php

namespace App\Listeners;

use App\Domains\Ai\Services\KnowledgeIndexer;
use App\Events\ContentChanged;

class ReindexKnowledge
{
    public function __construct(private KnowledgeIndexer $indexer) {}

    public function handle(ContentChanged $event): void
    {
        $this->indexer->sync($event->item);
    }
}
