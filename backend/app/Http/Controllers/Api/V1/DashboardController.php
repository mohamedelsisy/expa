<?php

namespace App\Http\Controllers\Api\V1;

use App\Domains\Dashboard\Services\NextActionAggregator;
use App\Domains\Dashboard\Services\ProfileContext;
use App\Domains\Dashboard\Services\ScoreCalculator;
use App\Domains\Dashboard\Services\SetupCatalog;
use App\Domains\Profile\Services\OnboardingService;
use App\Http\Controllers\Controller;
use App\Support\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class DashboardController extends Controller
{
    public function __construct(
        private SetupCatalog $catalog,
        private ScoreCalculator $score,
        private NextActionAggregator $actions,
        private OnboardingService $onboarding,
    ) {}

    public function show(Request $request)
    {
        $user = $request->user();
        $ctx = ProfileContext::for($user);
        $tasks = $this->catalog->forUser($user, $ctx);
        $onboarding = $this->onboarding->state($user->profile()->firstOrNew());

        return ApiResponse::data([
            'greeting' => ['name' => $user->name],
            'personalization' => ['enabled' => $ctx->personalized],
            'onboarding' => [
                'completed' => $onboarding['completed'],
                'required_complete' => $onboarding['required_complete'],
                'progress_percent' => $onboarding['progress_percent'],
            ],
            'score' => $this->score->calculate($tasks) + [
                'how_calculated' => __('setup.score.how_calculated'),
                'note' => $ctx->personalized ? null : __('setup.score.personalization_off'),
            ],
            'next_actions' => $this->actions->actionsFor($user),
        ]);
    }

    public function tasks(Request $request)
    {
        $tasks = $this->catalog->forUser($request->user());
        $guides = $this->catalog->publishedGuideTitles(array_column($tasks, 'guide_slug'));

        $items = collect($tasks)->map(fn ($t) => [
            'key' => $t['key'],
            'category' => $t['category'],
            'category_label' => __('setup.categories.'.$t['category']),
            'title' => __("setup.tasks.{$t['key']}.title"),
            'hint' => __("setup.tasks.{$t['key']}.hint"),
            'status' => $t['status'],
            'applicable' => $t['applicable'],
            'guide' => ($t['guide_slug'] && isset($guides[$t['guide_slug']])) ? ['slug' => $t['guide_slug'], 'title' => $guides[$t['guide_slug']]] : null,
            'route' => $t['route'],
        ])->sortBy(fn ($t) => $tasks[$t['key']]['priority'])->values();

        return ApiResponse::data($items);
    }

    public function setTask(Request $request, string $key)
    {
        abort_unless($this->catalog->exists($key), 404);
        $data = $request->validate(['status' => ['required', Rule::in(['todo', 'done', 'dismissed'])]]);

        $this->catalog->setStatus($request->user(), $key, $data['status']);

        return $this->tasks($request);
    }
}
