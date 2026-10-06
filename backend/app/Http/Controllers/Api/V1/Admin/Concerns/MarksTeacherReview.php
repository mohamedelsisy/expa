<?php

namespace App\Http\Controllers\Api\V1\Admin\Concerns;

use App\Domains\Audit\Services\AuditLogger;
use App\Support\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

/** POST/DELETE {resource}/{id}/teacher-review: a qualified teacher confirms (or withdraws) the review of a learning item. */
trait MarksTeacherReview
{
    public function markReviewed(Request $request, int $id)
    {
        $item = $this->find($id);
        Gate::authorize('review', $item);
        $item->markReviewed($request->user());
        app(AuditLogger::class)->log('learning.teacher_reviewed', $item, ['reviewed' => ['old' => false, 'new' => true]]);
        $resource = $this->resourceClass();

        return ApiResponse::data(new $resource($item->load($this->with()), full: true));
    }

    public function clearReviewed(Request $request, int $id)
    {
        $item = $this->find($id);
        Gate::authorize('review', $item);
        $item->clearReview();
        app(AuditLogger::class)->log('learning.teacher_review_cleared', $item, ['reviewed' => ['old' => true, 'new' => false]]);
        $resource = $this->resourceClass();

        return ApiResponse::data(new $resource($item->load($this->with()), full: true));
    }
}
