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
            $item->save();

            $translations = $data['translations'] ?? [];
            $this->assertRequiredTranslationsKept($item, $translations);

            $item->setTranslations($this->nonEmpty($translations));
            foreach (array_keys(array_filter($translations, 'is_null')) as $locale) {
                $item->translations()->where('locale', $locale)->delete();
            }
            $item->unsetRelation('translations');
            $this->relations($item, $data);
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
