<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;

class AdminCityProfileResource extends AdminContentResource
{
    protected string $primary = 'headline';

    protected function extra(Request $request): array
    {
        $data = ['city_id' => $this->city_id];
        if ($this->full) {
            $data['blocks'] = $this->blocks()->with('translations')->get()->map(fn ($b) => [
                'id' => $b->id, 'key' => $b->block_key->value, 'info_type' => $b->info_type, 'sort_order' => $b->sort_order,
                'source' => $b->sourcePayload(),
                'translations' => $b->translations->mapWithKeys(fn ($t) => [$t->locale => ['title' => $t->title, 'body' => $t->body]]),
            ])->values();
        }

        return $data;
    }
}
