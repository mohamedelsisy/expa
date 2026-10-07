<?php

namespace App\Console\Commands;

use App\Domains\Search\Services\SearchIndexer;
use Illuminate\Console\Command;

class PruneSearchProviders extends Command
{
    protected $signature = 'expa:search-prune-providers';

    protected $description = 'Remove providers whose verification expired (or that are no longer listable) from the search index';

    public function handle(SearchIndexer $indexer): int
    {
        $this->info('Pruned '.$indexer->pruneProviders().' provider document(s).');

        return self::SUCCESS;
    }
}
