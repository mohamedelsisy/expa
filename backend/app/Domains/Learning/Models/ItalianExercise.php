<?php

namespace App\Domains\Learning\Models;

use App\Domains\Content\Concerns\HasContentLifecycle;
use App\Domains\Content\Concerns\HasSource;
use App\Domains\Content\Concerns\HasTranslations;
use App\Domains\Learning\Concerns\HasTeacherReview;
use App\Domains\Learning\Enums\ExerciseType;
use App\Domains\Learning\Enums\Scenario;
use App\Domains\Learning\Services\ExerciseGrader;
use App\Domains\Profile\Enums\CefrLevel;
use App\Support\Audit\Auditable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class ItalianExercise extends Model
{
    use Auditable, HasContentLifecycle, HasSource, HasTeacherReview, HasTranslations, SoftDeletes;

    protected $guarded = ['id', 'status', 'publish_at', 'published_at', 'created_by', 'updated_by', 'reviewed_by_teacher_at', 'reviewed_by'];

    protected array $translatable = ['prompt', 'explanation', 'options'];

    public array $requiredTranslatableFields = ['prompt'];

    protected bool $requiresSource = false;

    protected function translationModelClass(): string
    {
        return ItalianExerciseTranslation::class;
    }

    protected function casts(): array
    {
        return ['type' => ExerciseType::class, 'level' => CefrLevel::class, 'scenario' => Scenario::class, 'content' => 'array'];
    }

    public static function contentAttributes(): array
    {
        return ['slug', 'type', 'level', 'scenario', 'italian_vocabulary_id', 'content', 'audio_url', 'audio_rights_note', 'sort_order',
            'source_name', 'source_url', 'source_type', 'last_verified_at'];
    }

    public function urlFields(): array
    {
        return ['audio_url'];
    }

    public function vocabulary(): BelongsTo
    {
        return $this->belongsTo(ItalianVocabulary::class, 'italian_vocabulary_id');
    }

    public function extraPublishProblems(): array
    {
        $p = [...$this->audioPublishProblems(), ...$this->reviewPublishProblems()];
        foreach (app(ExerciseGrader::class)->structureProblems($this) as $code) {
            $p[] = ['code' => $code, 'field' => 'content'];
        }

        return $p;
    }
}
