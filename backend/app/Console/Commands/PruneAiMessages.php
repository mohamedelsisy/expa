<?php

namespace App\Console\Commands;

use App\Domains\Ai\Models\AiConversation;
use App\Domains\Ai\Models\AiMessage;
use Illuminate\Console\Command;

class PruneAiMessages extends Command
{
    protected $signature = 'expa:prune-ai-messages';

    protected $description = 'Delete AI messages (and emptied conversations) past the retention period';

    public function handle(): int
    {
        $cutoff = now()->subMonths(config('ai.retention_months'));
        $messages = AiMessage::where('created_at', '<', $cutoff)->delete();
        $conversations = AiConversation::whereDoesntHave('messages')->delete();
        $this->info("Pruned $messages message(s) and $conversations empty conversation(s).");

        return self::SUCCESS;
    }
}
