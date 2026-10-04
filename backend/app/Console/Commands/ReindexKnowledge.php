<?php

namespace App\Console\Commands;

use App\Domains\Ai\Services\KnowledgeIndexer;
use Illuminate\Console\Command;

class ReindexKnowledge extends Command
{
    protected $signature = 'expa:ai-reindex';

    protected $description = 'Rebuild the AI knowledge index from published content';

    public function handle(KnowledgeIndexer $indexer): int
    {
        $this->info('Indexed '.$indexer->rebuildAll().' content item(s).');

        return self::SUCCESS;
    }
}
