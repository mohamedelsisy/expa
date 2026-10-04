<?php

namespace App\Domains\Content\Services;

use App\Enums\ContentStatus;
use App\Events\ContentChanged;
use App\Exceptions\ApiException;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

/**
 * Generic create/update/delete for translatable, lifecycle-managed content.
 * Models declare `static contentAttributes(): array` (the non-translated columns an editor may set) and may
 * implement `syncContentRelations(array $data)` for pivots.
 */
class ContentService
{
    /** @param  class-string<Model>  $class */
    public function create(string $class, array $data, User $actor): Model
    {
        return DB::transaction(function () use ($class, $data, $actor) {
            $item = new $class(array_intersect_key($data, array_flip($class::contentAttributes())));
            $item->created_by = $actor->id;
            $item->updated_by = $actor->id;
            $item->save();
            $item->setTranslations($this->nonEmpty($data['translations'] ?? []));
            $this->relations($item, $data);
            ContentChanged::dispatch($item);

            return $item->load('translations');
        });
    }

    public function update(Model $item, array $data, User $actor): Model
    {
        return DB::transaction(function () use ($item, $data, $actor) {
            $item->fill(array_intersect_key($data, array_flip($item::contentAttributes())));
            $item->updated_by = $actor->id;
            // Content under review must not change silently between a reviewer reading it and approving it:
            // any edit sends it back to draft (it has to be re-submitted).
            if ($item->status === ContentStatus::Review) {
                $item->status = ContentStatus::Draft;
            }
            $item->save();

            $translations = $data['translations'] ?? [];
            $this->assertRequiredTranslationsKept($item, $translations);

            $item->setTranslations($this->nonEmpty($translations));
            foreach (array_keys(array_filter($translations, 'is_null')) as $locale) {
                $item->translations()->where('locale', $locale)->delete();
            }
            $item->unsetRelation('translations');
            $this->relations($item, $data);

            // Live or approved content must stay publishable after an edit (source, allow-listed domain, required
            // translations…): otherwise it would remain public while violating the rules it was published under.
            if (in_array($item->status, [ContentStatus::Approved, ContentStatus::Published], true)) {
                $problems = app(PublishGuard::class)->problems($item);
                if ($problems) {
                    throw new ApiException('content_not_publishable', __('errors.content_not_publishable'), 422, ['problems' => $problems]);
                }
            }
            ContentChanged::dispatch($item);

            return $item->load('translations');
        });
    }

    public function delete(Model $item): void
    {
        if (! in_array($item->status, [ContentStatus::Draft, ContentStatus::Archived], true)) {
            throw new ApiException('cannot_delete_live_content', __('errors.cannot_delete_live_content'), 422);
        }
        $item->delete();
        // Free the slug: unique indexes include soft-deleted rows and there is no restore endpoint.
        $item->newQuery()->withTrashed()->whereKey($item->getKey())->toBase()->update(['slug' => mb_substr($item->slug, 0, 90).'~deleted~'.$item->getKey()]);
        ContentChanged::dispatch($item);
    }

    private function relations(Model $item, array $data): void
    {
        if (method_exists($item, 'syncContentRelations')) {
            $item->syncContentRelations($data);
        }
    }

    private function nonEmpty(array $translations): array
    {
        return array_filter($translations, fn ($t) => is_array($t) && $t !== []);
    }

    /** A live item must keep the translations that publishing required. */
    private function assertRequiredTranslationsKept(Model $item, array $translations): void
    {
        if ($item->status !== ContentStatus::Published) {
            return;
        }
        $required = method_exists($item, 'requiredLocales') ? $item->requiredLocales() : config('content.required_locales_to_publish');
        foreach ($required as $locale) {
            if (array_key_exists($locale, $translations) && $translations[$locale] === null) {
                throw new ApiException('cannot_remove_required_translation', __('errors.cannot_remove_required_translation'), 422);
            }
        }
    }
}
