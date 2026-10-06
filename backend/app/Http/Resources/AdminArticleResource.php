<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;

class AdminArticleResource extends AdminContentResource
{
    protected function extra(Request $request): array
    {
        $data = [
            'category' => $this->category->value,
            'region_id' => $this->region_id, 'city_id' => $this->city_id,
            'author_name' => $this->author_name, 'cover_image_url' => $this->cover_image_url,
            'reading_minutes' => $this->reading_minutes,
        ];
        if ($this->full) {
            $data['tags'] = $this->tagList();
            $data['related_guides'] = $this->guides()->pluck('slug')->all();
        }

        return $data;
    }
}
