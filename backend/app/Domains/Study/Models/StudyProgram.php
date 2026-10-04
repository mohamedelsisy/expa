<?php

namespace App\Domains\Study\Models;

use App\Casts\DateOnly;
use App\Domains\Content\Concerns\HasContentLifecycle;
use App\Domains\Content\Concerns\HasSource;
use App\Domains\Content\Concerns\HasTranslations;
use App\Domains\Profile\Enums\CefrLevel;
use App\Domains\Study\Enums\DegreeLevel;
use App\Domains\Study\Enums\StudyField;
use App\Support\Audit\Auditable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class StudyProgram extends Model
{
    use Auditable, HasContentLifecycle, HasSource, HasTranslations, SoftDeletes;

    protected $guarded = ['id', 'status', 'publish_at', 'published_at', 'created_by', 'updated_by'];

    protected array $translatable = ['title', 'summary', 'admission_requirements', 'notes'];

    public array $requiredTranslatableFields = ['title', 'summary'];

    protected bool $requiresSource = true;

    protected function casts(): array
    {
        return [
            'degree_level' => DegreeLevel::class, 'field' => StudyField::class,
            'required_italian_level' => CefrLevel::class, 'required_english_level' => CefrLevel::class,
            'application_deadline' => DateOnly::class,
        ];
    }

    public static function contentAttributes(): array
    {
        return ['slug', 'university_id', 'degree_level', 'field', 'instruction_language', 'duration_years', 'tuition_min_year', 'tuition_max_year',
            'required_italian_level', 'required_english_level', 'application_deadline', 'program_url', 'sort_order',
            'source_name', 'source_url', 'source_type', 'last_verified_at'];
    }

    public function urlFields(): array
    {
        return ['program_url'];
    }

    /** A published program must belong to a published university. */
    public function extraPublishProblems(): array
    {
        return $this->university?->status?->value === 'published' ? [] : [['code' => 'university_not_published', 'field' => 'university_id']];
    }

    public function university(): BelongsTo
    {
        return $this->belongsTo(University::class);
    }
}
