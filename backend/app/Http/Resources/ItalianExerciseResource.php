<?php

namespace App\Http\Resources;

use App\Domains\Learning\Models\ItalianExercise;
use App\Domains\Learning\Services\ExerciseGrader;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin ItalianExercise */
class ItalianExerciseResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $e = $this->resource;

        return [
            'slug' => $e->slug,
            'type' => $e->type->value,
            'type_label' => __('italian.exercise_types.'.$e->type->value),
            'level' => $e->level->value,
            'level_label' => __('italian.levels.'.$e->level->value),
            'scenario' => $e->scenario?->value,
            'scenario_label' => $e->scenario ? __('italian.scenarios.'.$e->scenario->value) : null,
            'vocabulary' => $e->vocabulary?->slug,
            'prompt' => $e->localized('prompt'),
            'locale' => $e->resolveLocale(),
            'fallback' => $e->usesFallback(),
            'status' => 'published',
            'source' => filled($e->source_url) ? $e->sourcePayload() : null, // optional attribution, shown when present
            // `audio: null` on a listening exercise means no recording exists yet: clients may use text-to-speech or skip it.
            'audio' => $e->audio_url ? ['url' => $e->audio_url, 'rights_note' => $e->audio_rights_note] : null,
            'form' => app(ExerciseGrader::class)->publicForm($e), // never contains the answers
        ] + $e->reviewPayload();
    }
}
