<?php

namespace App\Domains\Dashboard\Services;

use App\Domains\Dashboard\Models\UserTask;
use App\Domains\Documents\Models\UserDocument;
use App\Domains\Guides\Models\Guide;
use App\Models\User;

class SetupCatalog
{
    /**
     * Every catalog task with this user's state and applicability.
     *
     * @return array<string,array{key:string,category:string,priority:int,applicable:bool,status:string,auto:bool,guide_slug:?string,route:?string}>
     */
    public function forUser(User $user, ?ProfileContext $ctx = null): array
    {
        $ctx ??= ProfileContext::for($user);
        $states = UserTask::where('user_id', $user->id)->pluck('status', 'task_key');
        $docs = $this->trackedDocuments($user);

        $out = [];
        foreach (config('setup.tasks') as $key => $def) {
            $state = $states[$key] ?? 'todo';
            $auto = $state === 'todo' && $this->autoDone($def['auto'] ?? null, $docs);
            $state = $auto ? 'done' : $state;
            $out[$key] = [
                'key' => $key,
                'category' => $def['category'],
                'priority' => $def['priority'],
                'applicable' => $this->applies($def['applies'], $ctx) && $state !== 'dismissed',
                'status' => $state,
                'auto' => $auto,
                'guide_slug' => $def['guide'] ?? null,
                'route' => $def['route'] ?? null,
            ];
        }

        return $out;
    }

    /** @return array<string,bool> document type key => has at least one with an expiry date */
    private function trackedDocuments(User $user): array
    {
        $out = [];
        foreach (UserDocument::where('user_id', $user->id)->with('type')->get() as $d) {
            $out[$d->type->key] = ($out[$d->type->key] ?? false) || $d->expiry_date !== null;
        }

        return $out;
    }

    private function autoDone(?array $rule, array $docs): bool
    {
        if (! $rule || ! array_key_exists($rule['document_type'], $docs)) {
            return false;
        }

        return empty($rule['requires_expiry']) || $docs[$rule['document_type']];
    }

    public function applies(array $rule, ProfileContext $ctx): bool
    {
        if (isset($rule['unless_residence']) && $ctx->residenceType && in_array($ctx->residenceType, $rule['unless_residence'], true)) {
            return false;
        }
        if (! empty($rule['always'])) {
            return true;
        }
        if (! $ctx->personalized) {
            return false;
        }

        return in_array($ctx->segment, $rule['segments'] ?? [], true)
            || array_intersect($ctx->goals, $rule['goals'] ?? []) !== [];
    }

    /** Map of slug => localized title for the subset of slugs that are actually published. */
    public function publishedGuideTitles(array $slugs): array
    {
        $slugs = array_values(array_filter(array_unique($slugs)));
        if (! $slugs) {
            return [];
        }

        return Guide::published()->whereIn('slug', $slugs)->with('translations')->get()
            ->mapWithKeys(fn (Guide $g) => [$g->slug => $g->localized('title')])->all();
    }

    public function exists(string $key): bool
    {
        return array_key_exists($key, config('setup.tasks'));
    }

    public function setStatus(User $user, string $key, ?string $status): void
    {
        if ($status === null || $status === 'todo') {
            UserTask::where('user_id', $user->id)->where('task_key', $key)->delete();

            return;
        }

        UserTask::updateOrCreate(
            ['user_id' => $user->id, 'task_key' => $key],
            ['status' => $status, 'completed_at' => $status === 'done' ? now() : null],
        );
    }
}
