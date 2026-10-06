<?php

namespace App\Http\Resources;

use App\Domains\Learning\Enums\Scenario;
use App\Domains\Learning\Models\ItalianVocabulary;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin ItalianVocabulary */
class ItalianVocabularyResource extends JsonResource
{
    public function __construct($resource, private array $progress = [])
    {
        parent::__construct($resource);
    }

    public static function categoryLabel(?string $category): ?string
    {
        if ($category === null) {
            return null;
        }

        return Scenario::tryFrom($category) ? __("italian.scenarios.$category") : __("italian.categories.$category");
    }

    public function toArray(Request $request): array
    {
        $p = $this->progress[$this->id] ?? null;

        return [
            'slug' => $this->slug,
            'lemma' => $this->lemma,
            'part_of_speech' => $this->part_of_speech,
            'level' => $this->level->value,
            'level_label' => __('italian.levels.'.$this->level->value),
            'category' => $this->category,
            'category_label' => self::categoryLabel($this->category),
            'gloss' => $this->localized('gloss'),
            'example_it' => $this->example_it,
            'example_gloss' => $this->localized('example_gloss'),
            'locale' => $this->resolveLocale(),
            'fallback' => $this->usesFallback(),
            // The recording is only exposed together with its rights note (publishing requires both).
            'audio' => $this->audio_url ? ['url' => $this->audio_url, 'rights_note' => $this->audio_rights_note] : null,
            'progress' => $p ? ['box' => $p['box'], 'due_at' => $p['due_at']] : null,
        ] + $this->resource->reviewPayload();
    }
}
