<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;

class AdminProviderResource extends AdminContentResource
{
    protected string $primary = 'headline';

    protected function extra(Request $request): array
    {
        $data = [
            'category' => $this->category->value, 'display_name' => $this->display_name,
            'owner_user_id' => $this->user_id,
            'verification_status' => $this->verification_status->value, 'effective_verification' => $this->effectiveVerification(),
            'verified_at' => $this->verified_at?->toIso8601String(), 'verification_expires_at' => $this->verification_expires_at?->toIso8601String(),
            'rating_avg' => $this->rating_avg, 'rating_count' => $this->rating_count,
            'has_pending_changes' => $this->pending_changes !== null,
        ];
        if ($this->full) {
            $data += [
                'region_id' => $this->region_id, 'city_id' => $this->city_id, 'serves_online' => $this->serves_online, 'languages' => $this->languages ?? [],
                'contact_email' => $this->contact_email, 'contact_phone' => $this->contact_phone, 'website' => $this->website,
                'show_email' => $this->show_email, 'show_phone' => $this->show_phone, 'show_website' => $this->show_website,
                'commission_percent' => $this->commission_percent, 'commission_note' => $this->commission_note,
                'verification_basis' => $this->verification_basis, 'verified_by' => $this->verified_by,
                'verification_requested_at' => $this->verification_requested_at?->toIso8601String(),
                'areas' => $this->areas()->get(['region_id', 'city_id'])->all(),
                'services' => $this->services()->with('translations')->get()->map(fn ($s) => [
                    'id' => $s->id, 'price_from_eur' => $s->price_from_eur,
                    'translations' => $s->translations->mapWithKeys(fn ($t) => [$t->locale => ['name' => $t->name, 'description' => $t->description]]),
                ])->all(),
                'pending_changes' => $this->pending_changes, 'pending_changes_at' => $this->pending_changes_at?->toIso8601String(),
                'evidence_count' => $this->evidence()->count(),
            ];
        }

        return $data;
    }
}
