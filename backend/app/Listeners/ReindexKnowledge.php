<?php

namespace App\Listeners;

use App\Domains\Ai\Services\KnowledgeIndexer;
use App\Events\ContentChanged;
use Illuminate\Contracts\Queue\ShouldQueue;

class ReindexKnowledge implements ShouldQueue
{
    /** Queued after the admin transaction commits: a reindex failure must not roll back the editor's save (BE-36). */
    public bool $afterCommit = true;

    public function __construct(private KnowledgeIndexer $indexer) {}

    public function handle(ContentChanged $event): void
    {
        $this->indexer->sync($event->item);
    }
}
