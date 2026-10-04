<?php

namespace App\Domains\Reminders\Services;

use App\Domains\Analytics\Analytics;
use App\Domains\Analytics\AnalyticsEvent;
use App\Domains\Documents\Models\UserDocument;
use App\Domains\Reminders\Models\Reminder;
use Illuminate\Support\Facades\DB;

/**
 * Keeps the `reminders` table in step with a document.
 *
 *  - expiry changed (renewal)            → whole cycle starts again (old rows, sent or not, are dropped)
 *  - only offsets / enabled flag changed → pending rows are recomputed, history is kept
 *  - rows are created only for dates still in the future: adding a document that expires in 20 days does
 *    NOT back-fill the 90/60/30-day reminders, and an already-expired document never produces an "expired" notice.
 */
class ReminderScheduler
{
    public function sync(UserDocument $doc, bool $expiryChanged = false): void
    {
        DB::transaction(function () use ($doc, $expiryChanged) {
            if ($expiryChanged) {
                Reminder::where('user_document_id', $doc->id)->delete();
            } else {
                Reminder::where('user_document_id', $doc->id)->where('status', 'pending')->delete();
            }

            if (! $doc->reminders_enabled || ! $doc->expiry_date) {
                return;
            }

            $today = now()->startOfDay();
            $expiry = $doc->expiry_date->copy()->startOfDay();

            foreach ($doc->effectiveOffsets() as $offset) {
                $on = $expiry->copy()->subDays($offset);
                if ($on->gte($today)) {
                    $this->make($doc, 'before', $offset, $on->toDateString());
                }
            }

            if ($doc->wasRecentlyCreated) {
                app(Analytics::class)->system(AnalyticsEvent::ReminderCreated);
            }

            $expired = $expiry->copy()->addDay();
            if ($expired->gte($today)) {
                $this->make($doc, 'expired', -1, $expired->toDateString());
            }
        });
    }

    private function make(UserDocument $doc, string $kind, int $offset, string $on): void
    {
        // firstOrCreate: a row that was already dispatched for this offset must never be recreated as pending.
        Reminder::firstOrCreate(
            ['user_document_id' => $doc->id, 'kind' => $kind, 'offset_days' => $offset],
            ['user_id' => $doc->user_id, 'remind_on' => $on, 'status' => 'pending'],
        );
    }
}
