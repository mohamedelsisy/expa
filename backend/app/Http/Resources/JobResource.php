<?php

namespace App\Http\Resources;

use App\Domains\Jobs\Models\JobListing;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin JobListing */
class JobResource extends JsonResource
{
    public function __construct($resource, private bool $full = false, private ?array $match = null, private bool $saved = false)
    {
        parent::__construct($resource);
    }

    public function toArray(Request $request): array
    {
        $salary = ($this->salary_min || $this->salary_max)
            ? ['min' => $this->salary_min, 'max' => $this->salary_max, 'currency' => $this->salary_currency, 'period' => $this->salary_period] : null;

        $data = [
            'id' => $this->id,
            'title' => $this->title,
            'company' => $this->company,
            'location' => $this->location_text,
            'city' => $this->city ? ['slug' => $this->city->slug, 'name' => $this->city->localized('name')] : null,
            'remote_mode' => $this->remote_mode->value,
            'remote_mode_label' => __('jobs.remote.'.$this->remote_mode->value),
            'employment_type' => $this->employment_type->value,
            'employment_type_label' => __('jobs.employment.'.$this->employment_type->value),
            'category' => $this->category,
            'category_label' => __('jobs.categories.'.$this->category),
            'salary' => $salary,
            'italian_level' => $this->italian_level?->value,
            'english_level' => $this->english_level?->value,
            'experience_years' => $this->experience_years,
            'skills' => $this->skills ?? [],
            // Never implied: true only when the source's own structured data said so.
            'visa_sponsorship' => ['stated' => $this->visa_sponsorship_stated, 'label' => __($this->visa_sponsorship_stated ? 'jobs.sponsorship.stated' : 'jobs.sponsorship.not_stated')],
            'source' => $this->source?->name,
            'published_at' => $this->published_at?->toIso8601String(),
            'expires_at' => $this->expires_at?->toIso8601String(),
            'saved' => $this->saved,
            'match' => $this->match ? $this->localizedMatch($this->match) : null,
        ];

        if ($this->full) {
            $data['description'] = $this->description;
            $data['apply_url'] = $this->apply_url; // original application page
            $data['apply_notice'] = __('jobs.apply_notice');
        }

        return $data;
    }

    private function localizedMatch(array $m): array
    {
        $m['reasons'] = array_map(fn ($r) => $r + ['label' => __('jobs.match.'.$r['key'].'.'.$r['status'])], $m['reasons']);

        return $m;
    }
}
