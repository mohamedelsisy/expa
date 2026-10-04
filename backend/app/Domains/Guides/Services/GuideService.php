<?php

namespace App\Domains\Guides\Services;

use App\Domains\Guides\Models\Guide;
use App\Enums\ContentStatus;
use App\Exceptions\ApiException;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class GuideService
{
    private const ATTRIBUTES = ['slug', 'category', 'italian_term', 'region_id', 'city_id', 'sort_order',
        'source_name', 'source_url', 'source_type', 'last_verified_at'];

    public function create(array $data, User $actor): Guide
    {
        return DB::transaction(function () use ($data, $actor) {
            $guide = new Guide(array_intersect_key($data, array_flip(self::ATTRIBUTES)));
            $guide->created_by = $actor->id;
            $guide->updated_by = $actor->id;
            $guide->save();
            $guide->setTranslations($this->nonNull($data['translations'] ?? []));

            return $guide->load('translations');
        });
    }

    public function update(Guide $guide, array $data, User $actor): Guide
    {
        return DB::transaction(function () use ($guide, $data, $actor) {
            $guide->fill(array_intersect_key($data, array_flip(self::ATTRIBUTES)));
            $guide->updated_by = $actor->id;
            $guide->save();

            $translations = $data['translations'] ?? [];
            $this->assertRequiredTranslationsKept($guide, $translations);

            $guide->setTranslations($this->nonNull($translations));
            foreach (array_keys(array_filter($translations, 'is_null')) as $locale) {
                $guide->translations()->where('locale', $locale)->delete();
            }
            $guide->unsetRelation('translations');

            return $guide->load('translations');
        });
    }

    public function delete(Guide $guide): void
    {
        if (! in_array($guide->status, [ContentStatus::Draft, ContentStatus::Archived], true)) {
            throw new ApiException('cannot_delete_live_content', __('errors.cannot_delete_live_content'), 422);
        }
        $guide->delete();
    }

    private function nonNull(array $translations): array
    {
        return array_filter($translations, fn ($t) => is_array($t) && $t !== []);
    }

    /** A live guide must keep the translations that publishing required. */
    private function assertRequiredTranslationsKept(Guide $guide, array $translations): void
    {
        if ($guide->status !== ContentStatus::Published) {
            return;
        }
        foreach (config('content.required_locales_to_publish') as $locale) {
            if (array_key_exists($locale, $translations) && $translations[$locale] === null) {
                throw new ApiException('cannot_remove_required_translation', __('errors.cannot_remove_required_translation'), 422);
            }
        }
    }
}
