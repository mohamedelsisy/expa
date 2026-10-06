<?php

namespace App\Domains\Patente\Models;

use App\Domains\Content\Concerns\HasContentLifecycle;
use App\Domains\Content\Concerns\HasSource;
use App\Domains\Content\Concerns\HasTranslations;
use App\Domains\Patente\Enums\LicenseType;
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
        return ['is_true' => 'boolean', 'license_type' => LicenseType::class];
    }

    /** The Italian original is the exam text; the Arabic explanation is what helps the learner. Both are needed to publish. */
    public function requiredLocales(): array
    {
        return ['it', 'ar'];
    }

    public static function contentAttributes(): array
    {
        return ['slug', 'patente_topic_id', 'is_true', 'rights_note', 'license_type', 'rights_holder', 'license_proof_ref', 'sort_order', 'source_name', 'source_url', 'source_type', 'last_verified_at'];
    }

    public function topic(): BelongsTo
    {
        return $this->belongsTo(PatenteTopic::class, 'patente_topic_id');
    }

    /**
     * Publishing requires documented rights. Structured licensing (license_type + rights_holder + license_proof_ref) is the
     * rule: once ANY of the three is filled, all must be, so half-documented rights never go live. Questions without any
     * structured field fall back to the legacy free-text `rights_note` only while `patente.legacy_rights_note_allowed`.
     */
    public function extraPublishProblems(): array
    {
        if (! config('patente.require_rights_note')) {
            return [];
        }

        $structured = ['license_type' => $this->license_type, 'rights_holder' => $this->rights_holder, 'license_proof_ref' => $this->license_proof_ref];
        if (array_filter($structured, fn ($v) => filled($v))) {
            $problems = [];
            foreach ($structured as $field => $value) {
                if ($this->isPlaceholder($value instanceof \BackedEnum ? $value->value : $value, $field === 'license_type' ? 1 : 3)) {
                    $problems[] = ['code' => 'missing_license_field', 'field' => $field];
                }
            }

            return $problems;
        }

        if (config('patente.legacy_rights_note_allowed') && ! $this->isPlaceholder($this->rights_note, 20)) {
            return [];
        }

        return [['code' => config('patente.legacy_rights_note_allowed') ? 'missing_rights_note' : 'missing_license_field', 'field' => config('patente.legacy_rights_note_allowed') ? 'rights_note' : 'license_type']];
    }

    /** True when a provenance field is blank, too short, or a stub word (a placeholder is not provenance, BE-34). */
    private function isPlaceholder(?string $value, int $minLength): bool
    {
        $v = trim((string) $value);

        return mb_strlen($v) < $minLength || in_array(mb_strtolower($v), ['todo', 'tbd', 'n/a', 'none', 'unknown', 'placeholder'], true);
    }

    /** Rights data complete enough to publish (for admin dashboards). */
    public function rightsComplete(): bool
    {
        return $this->extraPublishProblems() === [];
    }
}
