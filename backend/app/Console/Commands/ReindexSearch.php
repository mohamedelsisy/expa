<?php

namespace App\Console\Commands;

use App\Domains\Search\Services\SearchIndexer;
use Illuminate\Console\Command;

class ReindexSearch extends Command
{
    protected $signature = 'expa:search-reindex';

    protected $description = 'Rebuild the unified search index from public content';

    public function handle(SearchIndexer $indexer): int
    {
        $this->info('Indexed '.$indexer->rebuildAll().' item(s).');

        return self::SUCCESS;
    }
}
