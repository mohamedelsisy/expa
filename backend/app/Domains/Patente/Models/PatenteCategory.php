<?php

namespace App\Domains\Patente\Models;

use App\Domains\Content\Concerns\HasContentLifecycle;
use App\Domains\Content\Concerns\HasSource;
use App\Domains\Content\Concerns\HasTranslations;
use App\Support\Audit\Auditable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class PatenteCategory extends Model
{
    use Auditable, HasContentLifecycle, HasSource, HasTranslations, SoftDeletes;

    protected $guarded = ['id', 'status', 'publish_at', 'published_at', 'created_by', 'updated_by'];

    protected array $translatable = ['title', 'summary', 'body'];

    public array $requiredTranslatableFields = ['title', 'summary'];

    protected bool $requiresSource = true;

    public static function contentAttributes(): array
    {
        return ['slug', 'sort_order', 'source_name', 'source_url', 'source_type', 'last_verified_at'];
    }
}
