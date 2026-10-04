<?php

namespace App\Domains\Study\Models;

use App\Casts\DateOnly;
use App\Domains\Content\Concerns\HasContentLifecycle;
use App\Domains\Content\Concerns\HasSource;
use App\Domains\Content\Concerns\HasTranslations;
use App\Support\Audit\Auditable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Scholarship extends Model
{
    use Auditable, HasContentLifecycle, HasSource, HasTranslations, SoftDeletes;

    protected $guarded = ['id', 'status', 'publish_at', 'published_at', 'created_by', 'updated_by'];

    protected array $translatable = ['name', 'summary', 'eligibility', 'how_to_apply'];

    public array $requiredTranslatableFields = ['name', 'summary'];

    protected bool $requiresSource = true;

    protected function casts(): array
    {
        return ['degree_levels' => 'array', 'deadline' => DateOnly::class];
    }

    public static function contentAttributes(): array
    {
        return ['slug', 'degree_levels', 'deadline', 'apply_url', 'sort_order', 'source_name', 'source_url', 'source_type', 'last_verified_at'];
    }

    public function urlFields(): array
    {
        return ['apply_url'];
    }
}
