<?php

namespace App\Domains\Privacy\Providers;

use App\Domains\Marketplace\Models\ProviderLead;
use App\Domains\Marketplace\Models\ProviderReview;
use App\Domains\Marketplace\Models\ServiceProvider;
use App\Domains\Marketplace\Services\EvidenceStore;
use App\Domains\Moderation\Models\ContentReport;
use App\Domains\Privacy\Contracts\PersonalDataProvider;
use App\Models\User;
use Illuminate\Support\Facades\DB;

/**
 * Marketplace data of a person: reviews written, contact requests (leads) sent, reports filed, and the provider
 * listing they own.
 * Erasure: reviews are ANONYMISED (author link and free text removed; the star rating stays so the provider's
 * aggregate is not silently altered); leads are deleted (they hold the contact details the user shared); reports keep
 * the moderation outcome but lose the reporter; an owned listing is unpublished, stripped of contact data,
 * evidence files and leads, and soft-deleted.
 */
class MarketplaceData implements PersonalDataProvider
{
    public function key(): string
    {
        return 'marketplace';
    }

    public function export(User $user): array
    {
        $provider = ServiceProvider::withTrashed()->with('translations')->where('user_id', $user->id)->first();

        return [
            'reviews' => ProviderReview::where('user_id', $user->id)->with('provider')->orderBy('id')->get()->map(fn ($r) => [
                'provider' => $r->provider?->display_name, 'rating' => $r->rating, 'body' => $r->body, 'status' => $r->status, 'created_at' => $r->created_at?->toIso8601String(),
            ])->all(),
            'contact_requests' => ProviderLead::where('user_id', $user->id)->with('provider')->orderBy('id')->get()->map(fn ($l) => [
                'provider' => $l->provider?->display_name, 'message' => $l->message, 'status' => $l->status, 'request_type' => $l->request_type,
                'shared_contact' => ['name' => $l->contact_name, 'email' => $l->contact_email, 'phone' => $l->contact_phone],
                'consent_given_at' => $l->consent_given_at?->toIso8601String(), 'consent_version' => $l->consent_version, 'created_at' => $l->created_at?->toIso8601String(),
            ])->all(),
            'reports_filed' => ContentReport::where('user_id', $user->id)->orderBy('id')->get(['reportable_type', 'reason', 'note', 'status', 'created_at'])->map(fn ($r) => $r->toArray())->all(),
            'provider_listing' => $provider ? [
                'display_name' => $provider->display_name, 'category' => $provider->category->value, 'status' => $provider->status->value,
                'verification_status' => $provider->verification_status->value, 'languages' => $provider->languages,
                'contact_email' => $provider->contact_email, 'contact_phone' => $provider->contact_phone, 'website' => $provider->website,
                'translations' => $provider->translations->map(fn ($t) => $t->only(['locale', 'headline', 'description', 'availability_note']))->all(),
                'received_requests_count' => $provider->leads()->count(),
            ] : null,
        ];
    }

    public function erase(User $user): void
    {
        ProviderReview::where('user_id', $user->id)->where('status', '!=', 'approved')->delete();
        ProviderReview::where('user_id', $user->id)->update(['user_id' => null, 'body' => null, 'content_hash' => null]);
        ProviderLead::where('user_id', $user->id)->delete();
        ContentReport::where('user_id', $user->id)->update(['user_id' => null, 'note' => null]);

        $provider = ServiceProvider::withTrashed()->where('user_id', $user->id)->first();
        if ($provider) {
            app(EvidenceStore::class)->purge($provider);
            $provider->leads()->delete();
            $provider->services()->get()->each->delete();
            $provider->areas()->delete();
            $provider->translations()->delete();
            $provider->forceFill([
                'user_id' => null, 'display_name' => 'Removed provider', 'contact_email' => null, 'contact_phone' => null, 'website' => null,
                'languages' => null, 'status' => 'archived', 'publish_at' => null, 'pending_changes' => null, 'pending_changes_at' => null,
                'verification_status' => 'unverified', 'verification_basis' => null, 'verified_by' => null, 'verified_at' => null, 'verification_expires_at' => null,
                'commission_percent' => null, 'commission_note' => null,
                'slug' => 'removed-'.$provider->id, 'deleted_at' => $provider->deleted_at ?? now(),
            ])->saveQuietly();
            $provider->refreshRating();
        }
        DB::table('provider_reviews')->whereNotNull('provider_reply')->whereIn('service_provider_id', $provider ? [$provider->id] : [])->update(['provider_reply' => null, 'provider_reply_status' => null]);
    }
}
