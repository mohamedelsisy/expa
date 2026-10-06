<?php

namespace App\Domains\Patente\Models;

use App\Domains\Content\Concerns\HasContentLifecycle;
use App\Domains\Content\Concerns\HasSource;
use App\Domains\Content\Concerns\HasTranslations;
use App\Support\Audit\Auditable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class PatenteQuestion extends Model
{
    use Auditable, HasContentLifecycle, HasSource, HasTranslations, SoftDeletes;

    protected $guarded = ['id', 'status', 'publish_at', 'published_at', 'created_by', 'updated_by'];

    protected array $translatable = ['statement', 'explanation'];

    public array $requiredTranslatableFields = ['statement'];

    protected bool $requiresSource = true;

    protected function casts(): array
    {
        return ['is_true' => 'boolean'];
    }

    /** The Italian original is the exam text; the Arabic explanation is what helps the learner. Both are needed to publish. */
    public function requiredLocales(): array
    {
        return ['it', 'ar'];
    }

    public static function contentAttributes(): array
    {
        return ['slug', 'patente_topic_id', 'is_true', 'rights_note', 'sort_order', 'source_name', 'source_url', 'source_type', 'last_verified_at'];
    }

    public function topic(): BelongsTo
    {
        return $this->belongsTo(PatenteTopic::class, 'patente_topic_id');
    }

    /** Publishing requires a recorded provenance/licence for the question text. */
    public function extraPublishProblems(): array
    {
        // BE-34: a placeholder is not provenance. At least 20 characters (licence / author / permission) and not a stub word.
        $note = trim((string) $this->rights_note);
        $weak = mb_strlen($note) < 20 || in_array(mb_strtolower($note), ['todo', 'tbd', 'n/a', 'none', 'unknown', 'placeholder'], true);

        return config('patente.require_rights_note') && $weak
            ? [['code' => 'missing_rights_note', 'field' => 'rights_note']] : [];
    }
}
