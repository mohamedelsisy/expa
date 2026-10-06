<?php

namespace App\Domains\Reminders\Services;

use App\Domains\Reminders\Models\Reminder;
use App\Events\ReminderDue;

class ReminderDispatcher
{
    /**
     * Fires `ReminderDue` for what is due today. Per document only the reminder closest to the expiry date
     * is sent; earlier ones that were also due (e.g. after scheduler downtime) are marked skipped.
     *
     * @return int number of reminders dispatched
     */
    public function dispatchDue(): int
    {
        $this->requeueLost();
        $count = 0;
        $dueDocs = Reminder::where('status', 'pending')->where('remind_on', '<=', now()->toDateString())
            ->whereHas('document', fn ($q) => $q->where('reminders_enabled', true))->distinct()->orderBy('user_document_id');

        // Work through due documents in bounded chunks: memory stays flat however many reminders are due.
        $dueDocs->pluck('user_document_id')->chunk(200)->each(function ($docIds) use (&$count) {
            $due = Reminder::where('status', 'pending')->where('remind_on', '<=', now()->toDateString())->whereIn('user_document_id', $docIds)
                ->orderBy('user_document_id')->orderBy('offset_days')->get();

            foreach ($due->groupBy('user_document_id') as $reminders) {
                // 'expired' (-1) sorts first, then the smallest offset: the most relevant message wins.
                $winner = $reminders->first();

                foreach ($reminders->skip(1) as $older) {
                    Reminder::whereKey($older->id)->where('status', 'pending')->update(['status' => 'skipped']);
                }

                // Atomic claim: if two runners race, only one flips the row and dispatches.
                $claimed = Reminder::whereKey($winner->id)->where('status', 'pending')
                    ->update(['status' => 'dispatched', 'dispatched_at' => now()]);
                if ($claimed === 1) {
                    ReminderDue::dispatch($winner->id);
                    $count++;
                }
            }
        });

        return $count;
    }

    /** Reminders whose delivery never completed (worker died, queue lost the job) go back to pending: never silently lost. */
    private function requeueLost(): void
    {
        Reminder::where('status', 'dispatched')->whereNull('notified_at')
            ->where('dispatched_at', '<', now()->subMinutes(Reminder::STALE_AFTER_MINUTES))
            ->get()->each->releaseForRetry();
    }
}
