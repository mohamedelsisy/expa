<?php

namespace App\Console\Commands;

use App\Enums\ContentStatus;
use App\Exceptions\ApiException;
use Illuminate\Console\Command;

class PublishScheduledContent extends Command
{
    protected $signature = 'expa:publish-scheduled';

    protected $description = 'Publish approved content whose publish_at has passed';

    public function handle(): int
    {
        $published = 0;
        foreach (config('content.models') as $class) {
            foreach ($class::query()->dueForPublishing()->get() as $item) {
                try {
                    $item->transitionTo(ContentStatus::Published);
                    $published++;
                } catch (ApiException $e) {
                    // Not publishable any more (e.g. source removed since approval): leave it approved and report.
                    $this->warn("Skipped $class #{$item->getKey()}: {$e->errorCode}");
                    report($e);
                }
            }
        }
        $this->info("Published $published item(s).");

        return self::SUCCESS;
    }
}
