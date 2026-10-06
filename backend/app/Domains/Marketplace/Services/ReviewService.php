<?php

namespace App\Domains\Marketplace\Services;

use App\Domains\Audit\Services\AuditLogger;
use App\Domains\Marketplace\Models\ProviderReview;
use App\Domains\Marketplace\Models\ServiceProvider;
use App\Domains\Moderation\Services\ContentSanitizer;
use App\Exceptions\ApiException;
use App\Models\User;

class ReviewService
{
    public function __construct(private ContentSanitizer $text, private AuditLogger $audit) {}

    public function create(User $user, ServiceProvider $p, int $rating, ?string $body): ProviderReview
    {
        if (! $user->hasVerifiedEmail()) {
            throw new ApiException('email_not_verified', __('errors.email_not_verified'), 403);
        }
        if ($p->user_id === $user->id) {
            throw new ApiException('cannot_review_own_provider', __('marketplace.cannot_review_own_provider'), 403);
        }
        $minHours = (int) config('marketplace.reviews.min_account_age_hours');
        if ($user->created_at && $user->created_at->gt(now()->subHours($minHours))) {
            throw new ApiException('account_too_new', __('marketplace.account_too_new'), 403);
        }
        if (ProviderReview::where('service_provider_id', $p->id)->where('user_id', $user->id)->exists()) {
            throw new ApiException('review_exists', __('marketplace.review_exists'), 409);
        }

        $clean = null;
        if (filled($body)) {
            $clean = $this->text->clean($body, 10, (int) config('marketplace.reviews.body_max'));
            $this->text->assertNotDuplicate('provider_reviews', $clean['hash']);
        }

        $review = new ProviderReview(['rating' => $rating, 'body' => $clean['text'] ?? null, 'locale' => app()->getLocale(), 'content_hash' => $clean['hash'] ?? null]);
        $review->service_provider_id = $p->id;
        $review->user_id = $user->id;
        $review->status = 'pending'; // every review is moderated before it is public or counted
        $review->save();

        return $review;
    }

    public function moderate(ProviderReview $review, User $moderator, string $decision, ?string $reason): ProviderReview
    {
        $review->forceFill(['status' => $decision, 'moderated_by' => $moderator->id, 'moderated_at' => now(), 'moderation_reason' => $reason ? mb_substr($reason, 0, 255) : null])->save();
        $review->provider->refreshRating();
        $this->audit->log("marketplace.review_{$decision}", $review, ['reason' => $reason]);

        return $review;
    }

    public function delete(ProviderReview $review): void
    {
        $provider = $review->provider;
        $review->delete();
        $provider->refreshRating();
    }

    public function reply(ProviderReview $review, string $text): ProviderReview
    {
        if ($review->status !== 'approved') {
            throw new ApiException('review_not_public', __('marketplace.review_not_public'), 422);
        }
        $clean = $this->text->clean($text, 5, (int) config('marketplace.reviews.reply_max'));
        $review->forceFill(['provider_reply' => $clean['text'], 'provider_reply_status' => 'pending', 'provider_reply_at' => now()])->save();

        return $review;
    }

    public function moderateReply(ProviderReview $review, User $moderator, string $decision): ProviderReview
    {
        $review->forceFill(['provider_reply_status' => $decision])->save();
        $this->audit->log("marketplace.reply_{$decision}", $review);

        return $review;
    }
}
