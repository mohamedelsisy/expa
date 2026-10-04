<?php

namespace App\Domains\Learning\Models;

use App\Domains\Content\Concerns\HasContentLifecycle;
use App\Domains\Content\Concerns\HasSource;
use App\Domains\Content\Concerns\HasTranslations;
use App\Domains\Learning\Enums\LessonType;
use App\Domains\Learning\Enums\Scenario;
use App\Domains\Profile\Enums\CefrLevel;
use App\Support\Audit\Auditable;
use Database\Factories\ItalianLessonFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class ItalianLesson extends Model
{
    /** @use HasFactory<ItalianLessonFactory> */
    use Auditable, HasContentLifecycle, HasFactory, HasSource, HasTranslations, SoftDeletes;

    protected $guarded = ['id', 'status', 'publish_at', 'published_at', 'created_by', 'updated_by'];

    protected array $translatable = ['title', 'summary', 'body', 'items'];

    public array $requiredTranslatableFields = ['title'];

    // Lessons are original teaching material, not claims about official procedures: no external source required.
    protected bool $requiresSource = false;

    protected function casts(): array
    {
        return ['level' => CefrLevel::class, 'type' => LessonType::class, 'scenario' => Scenario::class];
    }

    public static function contentAttributes(): array
    {
        return ['slug', 'level', 'type', 'scenario', 'duration_minutes', 'sort_order',
            'source_name', 'source_url', 'source_type', 'last_verified_at'];
    }

    protected static function newFactory(): ItalianLessonFactory
    {
        return ItalianLessonFactory::new();
    }
}
