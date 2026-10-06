<?php

namespace App\Domains\Learning\Concerns;

use App\Models\User;

/**
 * Columns: reviewed_by_teacher_at, reviewed_by. Learning content is original teaching material; until a qualified
 * teacher / native Arabic speaker has reviewed it the API says `reviewed: false` and clients show a notice.
 * Any change to the content text clears the review (see ReviewResetOnTranslationChange).
 */
trait HasTeacherReview
{
    public static function bootHasTeacherReview(): void
    {
        // Editing the teaching content itself (not just its translations) also voids the review.
        static::updating(function ($m) {
            if ($m->isDirty(['lemma', 'example_it', 'content', 'audio_url', 'level']) && ! $m->isDirty('reviewed_by_teacher_at')) {
                $m->reviewed_by_teacher_at = null;
                $m->reviewed_by = null;
            }
        });
    }

    public function initializeHasTeacherReview(): void
    {
        $this->casts['reviewed_by_teacher_at'] = 'datetime';
    }

    public function isReviewed(): bool
    {
        return $this->reviewed_by_teacher_at !== null;
    }

    public function markReviewed(User $by): static
    {
        $this->forceFill(['reviewed_by_teacher_at' => now(), 'reviewed_by' => $by->id])->save();

        return $this;
    }

    public function clearReview(): static
    {
        $this->forceFill(['reviewed_by_teacher_at' => null, 'reviewed_by' => null])->save();

        return $this;
    }

    /** Public payload fragment shared by every learning resource. */
    public function reviewPayload(): array
    {
        return [
            'reviewed' => $this->isReviewed(),
            'reviewed_at' => $this->reviewed_by_teacher_at?->toIso8601String(),
            'review_notice' => $this->isReviewed() ? null : __('italian.review_pending'),
        ];
    }

    protected function reviewPublishProblems(): array
    {
        return config('learning.require_teacher_review_to_publish') && ! $this->isReviewed()
            ? [['code' => 'pending_teacher_review', 'field' => 'reviewed_by_teacher_at']] : [];
    }

    protected function audioPublishProblems(): array
    {
        $p = [];
        if (filled($this->audio_url) && blank($this->audio_rights_note)) {
            $p[] = ['code' => 'audio_rights_missing', 'field' => 'audio_rights_note']; // no recording goes live without a documented licence
        }

        return $p;
    }
}
