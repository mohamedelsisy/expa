<?php

namespace App\Domains\Learning\Models;

use App\Domains\Content\Concerns\HasContentLifecycle;
use App\Domains\Content\Concerns\HasSource;
use App\Domains\Content\Concerns\HasTranslations;
use App\Domains\Learning\Concerns\HasTeacherReview;
use App\Domains\Profile\Enums\CefrLevel;
use App\Support\Audit\Auditable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class ItalianVocabulary extends Model
{
    use Auditable, HasContentLifecycle, HasSource, HasTeacherReview, HasTranslations, SoftDeletes;

    protected $table = 'italian_vocabularies';

    protected $guarded = ['id', 'status', 'publish_at', 'published_at', 'created_by', 'updated_by', 'reviewed_by_teacher_at', 'reviewed_by'];

    protected array $translatable = ['gloss', 'example_gloss'];

    public array $requiredTranslatableFields = ['gloss'];

    // Teaching material, not a claim about official procedures: no external source required.
    protected bool $requiresSource = false;

    protected function translationModelClass(): string
    {
        return ItalianVocabularyTranslation::class;
    }

    protected function casts(): array
    {
        return ['level' => CefrLevel::class];
    }

    /** Arabic and English glosses are the product's promise for vocabulary (Arabic-first learner, English bridge). */
    public function requiredLocales(): array
    {
        return ['ar', 'en'];
    }

    public static function contentAttributes(): array
    {
        return ['slug', 'lemma', 'part_of_speech', 'level', 'category', 'example_it', 'audio_url', 'audio_rights_note', 'sort_order',
            'source_name', 'source_url', 'source_type', 'last_verified_at'];
    }

    public function urlFields(): array
    {
        return ['audio_url'];
    }

    public function extraPublishProblems(): array
    {
        return [...$this->audioPublishProblems(), ...$this->reviewPublishProblems()];
    }
}
