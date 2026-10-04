<?php

namespace App\Domains\Content\Concerns;

use App\Domains\Audit\Services\AuditLogger;
use App\Domains\Content\Services\PublishGuard;
use App\Enums\ContentStatus;
use App\Exceptions\ApiException;
use Illuminate\Database\Eloquent\Builder;

/**
 * Columns (see Blueprint::contentLifecycle): status, publish_at, published_at.
 *
 * Scheduling = status `approved` + future `publish_at`; `expa:publish-scheduled` promotes it.
 * Models may set `protected bool $requiresSource = true` to enforce source metadata before publishing.
 */
trait HasContentLifecycle
{
    public function initializeHasContentLifecycle(): void
    {
        $this->casts['status'] = ContentStatus::class;
        $this->casts['publish_at'] = 'datetime';
        $this->casts['published_at'] = 'datetime';
        $this->attributes['status'] ??= ContentStatus::Draft->value;
    }

    public function scopePublished(Builder $query): Builder
    {
        return $query->where($query->getModel()->getTable().'.status', ContentStatus::Published->value);
    }

    public function scopeDueForPublishing(Builder $query): Builder
    {
        return $query->where('status', ContentStatus::Approved->value)
            ->whereNotNull('publish_at')->where('publish_at', '<=', now());
    }

    public function requiresSource(): bool
    {
        return $this->requiresSource ?? false;
    }

    public function transitionTo(ContentStatus $to): static
    {
        $from = $this->status;

        if (! $from->canTransitionTo($to)) {
            throw new ApiException('invalid_status_transition', __('errors.invalid_status_transition', [
                'from' => $from->value, 'to' => $to->value,
            ]), 422);
        }

        if ($to === ContentStatus::Published) {
            $problems = app(PublishGuard::class)->problems($this);
            if ($problems) {
                throw new ApiException('content_not_publishable', __('errors.content_not_publishable'), 422, ['problems' => $problems]);
            }
            $this->published_at = now();
        }

        $this->status = $to;
        if ($to !== ContentStatus::Approved && $to !== ContentStatus::Published) {
            $this->publish_at = null;
        }
        $this->save();

        app(AuditLogger::class)->log('content.status_changed', $this, ['status' => ['old' => $from->value, 'new' => $to->value]]);

        return $this;
    }

    /** Approve and schedule for later; the scheduler publishes it when due. */
    public function schedule(\DateTimeInterface $at): static
    {
        if ($this->status !== ContentStatus::Approved) {
            throw new ApiException('invalid_status_transition', __('errors.schedule_requires_approved'), 422);
        }
        if ($at <= now()) {
            throw new ApiException('invalid_schedule', __('errors.schedule_in_past'), 422);
        }

        $this->update(['publish_at' => $at]);

        return $this;
    }
}
