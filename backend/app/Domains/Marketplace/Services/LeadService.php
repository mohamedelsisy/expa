<?php

namespace App\Domains\Marketplace\Services;

use App\Domains\Marketplace\Models\ProviderLead;
use App\Domains\Marketplace\Models\ServiceProvider;
use App\Domains\Moderation\Services\ContentSanitizer;
use App\Exceptions\ApiException;
use App\Models\User;

/** A lead is a contact/booking REQUEST. It is not a booking: nothing is confirmed by EXPA. */
class LeadService
{
    public function __construct(private ContentSanitizer $text) {}

    public function create(User $user, ServiceProvider $p, array $data): ProviderLead
    {
        if (! $user->hasVerifiedEmail()) {
            throw new ApiException('email_not_verified', __('errors.email_not_verified'), 403);
        }
        if ($p->user_id === $user->id) {
            throw new ApiException('cannot_contact_own_provider', __('marketplace.cannot_contact_own_provider'), 403);
        }
        if (empty($data['consent_share_contact'])) {
            throw new ApiException('consent_required', __('marketplace.consent_required'), 422);
        }

        $cfg = config('marketplace.leads');
        $recent = ProviderLead::where('user_id', $user->id)->where('service_provider_id', $p->id)
            ->where('created_at', '>=', now()->subHours($cfg['per_user_provider_cooldown_hours']))->exists();
        if ($recent) {
            throw new ApiException('lead_cooldown', __('marketplace.lead_cooldown'), 429);
        }
        if (ProviderLead::where('user_id', $user->id)->whereIn('status', ['new', 'seen'])->count() >= $cfg['max_open_per_user']) {
            throw new ApiException('too_many_open_leads', __('marketplace.too_many_open_leads'), 429);
        }

        $clean = $this->text->clean($data['message'], $cfg['message_min'], $cfg['message_max']);

        $lead = new ProviderLead([
            'message' => $clean['text'], 'preferred_language' => $data['preferred_language'] ?? null, 'request_type' => $data['request_type'] ?? 'contact',
            // Shared only because the user ticked the consent for THIS provider; defaults to the account's own data.
            'contact_name' => trim(strip_tags($data['contact_name'] ?? $user->name)),
            'contact_email' => $data['contact_email'] ?? $user->email,
            'contact_phone' => $data['contact_phone'] ?? null,
            'consent_given_at' => now(), 'consent_version' => $cfg['consent_version'],
        ]);
        $lead->service_provider_id = $p->id;
        $lead->user_id = $user->id;
        $lead->status = 'new';
        $lead->save();

        return $lead;
    }
}
