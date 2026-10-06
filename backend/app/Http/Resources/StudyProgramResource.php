<?php

namespace App\Http\Resources;

use App\Domains\Study\Models\StudyProgram;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin StudyProgram */
class StudyProgramResource extends JsonResource
{
    public function __construct($resource, private bool $full = false, private ?array $match = null)
    {
        parent::__construct($resource);
    }

    public function toArray(Request $request): array
    {
        $uni = $this->university;
        $deadline = $this->application_deadline;
        $tuition = ($this->tuition_min_year !== null || $this->tuition_max_year !== null)
            ? ['min' => $this->tuition_min_year, 'max' => $this->tuition_max_year, 'currency' => 'EUR', 'period' => 'year'] : null;

        $data = [
            'id' => $this->id,
            'slug' => $this->slug,
            'title' => $this->localized('title'),
            'summary' => $this->localized('summary'),
            'university' => ['slug' => $uni->slug, 'name' => $uni->localized('name'), 'city' => $uni->city ? ['slug' => $uni->city->slug, 'name' => $uni->city->localized('name')] : null],
            'degree_level' => $this->degree_level->value,
            'degree_level_label' => __('study.degree_levels.'.$this->degree_level->value),
            'field' => $this->field->value,
            'field_label' => __('study.fields.'.$this->field->value),
            'instruction_language' => $this->instruction_language,
            'instruction_language_label' => __('study.languages.'.$this->instruction_language),
            'duration_years' => $this->duration_years,
            'tuition' => $tuition, // null = the source does not state it; EXPA never estimates tuition
            'required_italian_level' => $this->required_italian_level?->value,
            'required_english_level' => $this->required_english_level?->value,
            'deadline' => ['date' => $deadline?->toDateString(), 'status' => ! $deadline ? 'not_stated' : ($deadline->isFuture() || $deadline->isToday() ? 'upcoming' : 'passed')],
            'verify_notice' => __('study.verify_notice'),
            'updated_at' => $this->updated_at?->toIso8601String(),
            'locale' => $this->resolveLocale(),
            'fallback' => $this->usesFallback(),
            'source' => $this->sourcePayload(),
            'match' => $this->match ? ['score' => $this->match['score'], 'confidence' => $this->match['confidence'], 'reasons' => array_map(
                fn ($r) => $r + ['label' => __('study.match.'.$r['key'].'.'.$r['status'])], $this->match['reasons'])] : null,
        ];

        if ($this->full) {
            $data['admission_requirements'] = $this->localized('admission_requirements');
            $data['notes'] = $this->localized('notes');
            $data['program_url'] = $this->program_url;
        }

        return $data;
    }
}
