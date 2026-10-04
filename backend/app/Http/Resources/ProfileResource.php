<?php

namespace App\Http\Resources;

use App\Domains\Profile\Models\UserProfile;
use App\Domains\Profile\Services\OnboardingService;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin UserProfile */
class ProfileResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'user' => new UserResource($this->user),
            'segment' => $this->segment?->value,
            'nationality' => $this->nationality,
            'residence_type' => $this->residence_type,
            'age_range' => $this->age_range?->value,
            'italian_level' => $this->italian_level?->value,
            'english_level' => $this->english_level?->value,
            'goals' => $this->goals ?? [],
            'onboarding' => app(OnboardingService::class)->state($this->resource),
        ];
    }
}
