<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** A review as the public sees it: no author identity of any kind. */
class ProviderReviewResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id, 'rating' => $this->rating, 'body' => $this->body, 'locale' => $this->locale,
            'created_at' => $this->created_at?->toDateString(),
            'reply' => $this->provider_reply_status === 'approved' ? ['body' => $this->provider_reply, 'at' => $this->provider_reply_at?->toDateString()] : null,
            'label' => __('marketplace.review_label'),
        ];
    }
}
