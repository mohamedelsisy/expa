<?php

namespace App\Domains\Dashboard\Services;

use App\Domains\Documents\Models\UserDocument;
use App\Domains\Geo\Models\City;
use App\Domains\Guides\Models\Guide;
use App\Domains\Learning\Models\ItalianLesson;
use App\Domains\Learning\Models\LessonProgress;
use App\Domains\Marketplace\Models\ServiceProvider;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;

/**
 * CLAUDE.md s57: "recommended guides / lessons / services / reminders", every item with an explainable reason.
 * Only PUBLISHED content is ever recommended. Profile-derived signals (goals, city, level) are read through
 * ProfileContext, i.e. only with the user's `profile_personalization` consent; without it the result is
 * universal (setup-checklist guides, the user's own documents) and says so. Providers are third-party listings
 * and never carry contact data here.
 */
class RecommendationService
{
    private const LIMIT = 5;

    private const GOAL_GUIDE_CATEGORY = ['documents' => 'documents', 'work' => 'work', 'study' => 'study', 'italian' => 'language', 'housing' => 'housing',
        'healthcare' => 'healthcare', 'driving' => 'driving', 'business' => 'business', 'family' => 'family'];

    private const GOAL_PROVIDER_CATEGORY = ['documents' => ['caf', 'patronato'], 'work' => ['patronato'], 'business' => ['commercialista'],
        'driving' => ['driving_school'], 'housing' => ['moving'], 'italian' => ['translator']];

    public function __construct(private SetupCatalog $catalog) {}

    public function for(User $user): array
    {
        $ctx = $this->catalog->context($user);

        return [
            'personalization' => ['enabled' => $ctx->personalized],
            'guides' => $this->guides($user, $ctx),
            'lessons' => $this->lessons($user, $ctx),
            'services' => $this->services($ctx),
            'reminders' => $this->reminders($user),
        ];
    }

    private function guides(User $user, ProfileContext $ctx): array
    {
        $out = [];
        // 1. open setup tasks that point at a guide (the same catalogue the dashboard uses)
        $tasks = collect($this->catalog->forUser($user, $ctx))->filter(fn ($t) => $t['applicable'] && $t['status'] === 'todo' && $t['guide_slug'])
            ->sortBy('priority');
        $bySlug = Guide::published()->with('translations')->whereIn('slug', $tasks->pluck('guide_slug'))->get()->keyBy('slug');
        foreach ($tasks as $t) {
            if ($g = $bySlug[$t['guide_slug']] ?? null) {
                $out[$g->id] = $this->item('guide', $g, 'guides/'.$g->slug, 'setup_task', ['task' => __("setup.tasks.{$t['key']}.title")], 'title');
            }
        }
        if ($ctx->personalized) {
            // 2. goals
            $cats = collect($ctx->goals)->map(fn ($g) => self::GOAL_GUIDE_CATEGORY[$g] ?? null)->filter()->unique()->values();
            if ($cats->isNotEmpty()) {
                $city = $ctx->cityId ? City::find($ctx->cityId) : null;
                foreach (Guide::published()->with('translations')->whereIn('category', $cats)->applicableTo($city)->orderBy('sort_order')->limit(self::LIMIT)->get() as $g) {
                    $out[$g->id] ??= $this->item('guide', $g, 'guides/'.$g->slug, 'goal', ['goal' => __('recommendations.goals.'.array_search($g->category->value, self::GOAL_GUIDE_CATEGORY))], 'title');
                }
            }
            // 3. guides written for the user's own city
            if ($ctx->cityId) {
                foreach (Guide::published()->with('translations')->where('city_id', $ctx->cityId)->orderBy('sort_order')->limit(self::LIMIT)->get() as $g) {
                    $out[$g->id] ??= $this->item('guide', $g, 'guides/'.$g->slug, 'city', [], 'title');
                }
            }
        }

        return array_slice(array_values($out), 0, self::LIMIT);
    }

    private function lessons(User $user, ProfileContext $ctx): array
    {
        $done = LessonProgress::where('user_id', $user->id)->where('status', 'completed')->pluck('italian_lesson_id');
        $level = $ctx->italianLevel;
        $q = ItalianLesson::published()->with('translations')->whereNotIn('id', $done)->orderBy('sort_order')->orderBy('id');
        $q->where('level', $level ?? 'a0'); // unknown level: start at the beginning, say so

        return $q->limit(3)->get()->map(fn ($l) => $this->item('lesson', $l, 'learn-italian/lessons/'.$l->slug, $level ? 'level' : 'start', ['level' => strtoupper($level ?? 'a0')], 'title'))->all();
    }

    private function services(ProfileContext $ctx): array
    {
        if (! $ctx->personalized) {
            return [];
        }
        $cats = collect($ctx->goals)->flatMap(fn ($g) => self::GOAL_PROVIDER_CATEGORY[$g] ?? [])->unique()->values();
        if ($cats->isEmpty()) {
            return [];
        }
        $q = ServiceProvider::listable()->with('translations')->whereIn('category', $cats)
            ->where(fn ($w) => $w->where('serves_online', true)->when($ctx->cityId, fn ($c) => $c->orWhere('city_id', $ctx->cityId)))
            ->orderByDesc('rating_avg')->orderBy('id');

        return $q->limit(3)->get()->map(function (ServiceProvider $p) {
            $i = $this->item('service', $p, 'providers/'.$p->slug, 'goal', ['goal' => __('recommendations.categories.'.$p->category->value)], 'headline');
            $i['title'] = $p->display_name;
            $i['label'] = 'third_party'; // EXPA does not recommend or guarantee providers
            $i['verification'] = $p->effectiveVerification();

            return $i;
        })->all();
    }

    private function reminders(User $user): array
    {
        $docs = UserDocument::where('user_id', $user->id)->with(['type.translations', 'reminders'])->orderBy('id')->limit(20)->get();
        $out = [];
        foreach ($docs as $d) {
            if ($d->expiry_date === null) {
                $out[] = ['type' => 'reminder', 'document_id' => $d->id, 'title' => $d->displayName(), 'route' => 'my-documents/'.$d->id,
                    'reason' => $this->reason('missing_expiry', [])];
            } elseif ($d->daysRemaining() >= 0 && ! $d->reminders->where('status', 'pending')->count()) {
                $out[] = ['type' => 'reminder', 'document_id' => $d->id, 'title' => $d->displayName(), 'route' => 'my-documents/'.$d->id,
                    'reason' => $this->reason('no_pending_reminder', ['days' => $d->daysRemaining()])];
            }
        }

        return array_slice($out, 0, 3);
    }

    private function item(string $type, Model $m, string $route, string $reason, array $params, string $titleField): array
    {
        return ['type' => $type, 'slug' => $m->slug, 'title' => $m->localized($titleField), 'route' => $route, 'reason' => $this->reason($reason, $params)];
    }

    private function reason(string $code, array $params): array
    {
        return ['code' => $code, 'text' => __('recommendations.reasons.'.$code, $params)];
    }
}
