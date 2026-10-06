<?php

namespace App\Domains\Moderation\Services;

use App\Domains\Moderation\Models\ContentReport;
use App\Exceptions\ApiException;
use App\Models\User;

class ReportService
{
    /** One open report per user per item; `$type` is a morph-free short key (provider_review, community_question…). */
    public function report(User $user, string $type, int $id, string $reason, ?string $note): ContentReport
    {
        $exists = ContentReport::where('user_id', $user->id)->where('reportable_type', $type)->where('reportable_id', $id)->where('status', 'open')->exists();
        if ($exists) {
            throw new ApiException('already_reported', __('moderation.already_reported'), 409);
        }
        $r = new ContentReport(['reportable_type' => $type, 'reportable_id' => $id, 'reason' => $reason, 'note' => $note ? mb_substr(strip_tags($note), 0, 500) : null]);
        $r->user_id = $user->id;
        $r->save();

        return $r;
    }

    public function resolve(ContentReport $report, User $moderator, string $status): ContentReport
    {
        $report->forceFill(['status' => $status, 'handled_by' => $moderator->id, 'handled_at' => now()])->save();

        return $report;
    }
}
