<?php

namespace App\Http\Resources;

use App\Domains\Learning\Models\ItalianLesson;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin ItalianLesson */
class ItalianLessonResource extends JsonResource
{
    public function __construct($resource, private bool $full = false, private array $progress = [])
    {
        parent::__construct($resource);
    }

    public function toArray(Request $request): array
    {
        $p = $this->progress[$this->id] ?? null;
        $data = [
            'id' => $this->id,
            'slug' => $this->slug,
            'level' => $this->level->value,
            'level_label' => __('italian.levels.'.$this->level->value),
            'type' => $this->type->value,
            'type_label' => __('italian.types.'.$this->type->value),
            'scenario' => $this->scenario?->value,
            'scenario_label' => $this->scenario ? __('italian.scenarios.'.$this->scenario->value) : null,
            'duration_minutes' => $this->duration_minutes,
            'title' => $this->localized('title'),
            'summary' => $this->localized('summary'),
            'locale' => $this->resolveLocale(),
            'fallback' => $this->usesFallback(),
            'progress' => $p ? ['status' => $p['status'], 'score' => $p['score']] : null,
        ];
        if ($this->full) {
            $data['body'] = $this->localized('body');
            $data['items'] = $this->localized('items') ?? [];
        }

        return $data;
    }
}
