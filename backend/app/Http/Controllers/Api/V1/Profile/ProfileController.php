<?php

namespace App\Http\Controllers\Api\V1\Profile;

use App\Domains\Profile\Enums\AgeRange;
use App\Domains\Profile\Enums\CefrLevel;
use App\Domains\Profile\Enums\ConsentPurpose;
use App\Domains\Profile\Enums\Goal;
use App\Domains\Profile\Enums\ResidenceType;
use App\Domains\Profile\Enums\Segment;
use App\Domains\Profile\Models\UserProfile;
use App\Domains\Profile\Services\ConsentService;
use App\Domains\Profile\Services\OnboardingService;
use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateProfileRequest;
use App\Http\Resources\ProfileResource;
use App\Support\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ProfileController extends Controller
{
    public function __construct(private ConsentService $consents, private OnboardingService $onboarding) {}

    public function show(Request $request)
    {
        return ApiResponse::data(new ProfileResource($this->profile($request)));
    }

    public function update(UpdateProfileRequest $request)
    {
        $user = $request->user();
        $profileData = $request->profileData();

        // Personalization data may only be stored with the user's consent. Clearing data is always allowed.
        $storing = collect($profileData)->contains(fn ($v) => filled($v));
        if ($storing && ! $this->consents->has($user, ConsentPurpose::ProfilePersonalization)) {
            return ApiResponse::error('consent_required', __('errors.consent_required'), 403, [
                'purpose' => [ConsentPurpose::ProfilePersonalization->value],
            ]);
        }

        if ($account = $request->accountData()) {
            $user->update($account);
        }

        $profile = $this->profile($request);
        $profile->fill($profileData)->save();

        return ApiResponse::data(new ProfileResource($profile->refresh()->load('user')));
    }

    public function skipStep(Request $request)
    {
        $data = $request->validate([
            'step' => ['required', Rule::in(array_keys(array_filter(OnboardingService::STEPS, fn ($s) => ! $s['required'])))],
        ]);

        $profile = $this->profile($request);
        $this->onboarding->skip($profile, $data['step']);

        return ApiResponse::data(new ProfileResource($profile->refresh()->load('user')));
    }

    public function completeOnboarding(Request $request)
    {
        $profile = $this->profile($request);

        if (! $this->onboarding->complete($profile)) {
            return ApiResponse::error('onboarding_incomplete', __('errors.onboarding_incomplete'), 422);
        }

        return ApiResponse::data(new ProfileResource($profile->refresh()->load('user')));
    }

    /** Public: localized labels for every enum so clients never hard-code option text. */
    public function options()
    {
        $label = fn (string $group, array $cases) => collect($cases)->map(fn ($c) => [
            'value' => $c->value,
            'label' => __("profile.options.$group.{$c->value}"),
        ])->all();

        return ApiResponse::data([
            'segment' => $label('segment', Segment::cases()),
            'residence_type' => $label('residence_type', ResidenceType::cases()),
            'age_range' => $label('age_range', AgeRange::cases()),
            'cefr_level' => $label('cefr_level', CefrLevel::cases()),
            'goals' => $label('goals', Goal::cases()),
            'onboarding_steps' => collect(OnboardingService::STEPS)->map(fn ($s, $k) => [
                'key' => $k,
                'required' => $s['required'],
                'title' => __("profile.steps.$k.title"),
                'why' => __("profile.steps.$k.why"),
            ])->values()->all(),
        ]);
    }

    private function profile(Request $request): UserProfile
    {
        return $request->user()->profile()->firstOrCreate()->load('user');
    }
}
