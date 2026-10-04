<?php

namespace App\Console\Commands;

use App\Domains\Access\Services\AccessSynchronizer;
use Illuminate\Console\Command;

class SyncAccess extends Command
{
    protected $signature = 'expa:sync-access';

    protected $description = 'Sync roles and permissions from config/permissions.php';

    public function handle(AccessSynchronizer $sync): int
    {
        $sync->sync();
        $this->info('Roles and permissions synchronized.');

        return self::SUCCESS;
    }
}
