<?php

namespace App\Domains\Housing\Models;

use App\Domains\Content\Concerns\HasContentLifecycle;
use App\Domains\Content\Concerns\HasSource;
use App\Domains\Content\Concerns\HasTranslations;
use App\Domains\Housing\Services\HousingExtractor;
use App\Support\Audit\Auditable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * One row of the rental checker's rule table. `general_guidance` rules make NO legal claim and may only test whether a
 * signal is present/absent. Anything that encodes a number (a limit, a threshold) is a `sourced` rule: it needs a
 * source (name, https URL, type, last verified) before it can be published. EXPA ships no statutory thresholds.
 */
class HousingRule extends Model
{
    use Auditable, HasContentLifecycle, HasSource, HasTranslations, SoftDeletes;

    public const KINDS = ['red_flag', 'question'];

    public const CONDITIONS = ['present', 'absent', 'gt', 'lt'];

    public const SEVERITIES = ['info', 'caution', 'warning'];

    public const BASES = ['general_guidance', 'sourced'];

    protected $guarded = ['id', 'status', 'publish_at', 'published_at', 'created_by', 'updated_by'];

    protected $attributes = ['basis' => 'general_guidance', 'severity' => 'info'];

    protected array $translatable = ['title', 'explanation', 'question'];

    public array $requiredTranslatableFields = ['title', 'explanation'];

    protected function casts(): array
    {
        return ['threshold' => 'decimal:2'];
    }

    public static function contentAttributes(): array
    {
        return ['slug', 'kind', 'signal', 'condition', 'threshold', 'severity', 'basis', 'sort_order', 'source_name', 'source_url', 'source_type', 'last_verified_at'];
    }

    public function requiresSource(): bool
    {
        return $this->basis === 'sourced';
    }

    public function extraPublishProblems(): array
    {
        $p = [];
        if (! in_array($this->signal, HousingExtractor::SIGNALS, true)) {
            $p[] = ['code' => 'unknown_signal', 'field' => 'signal'];
        }
        $numeric = in_array($this->condition, ['gt', 'lt'], true);
        if ($numeric && ($this->threshold === null || ! in_array($this->signal, HousingExtractor::NUMERIC_SIGNALS, true))) {
            $p[] = ['code' => 'invalid_threshold', 'field' => 'threshold'];
        }
        if (! $numeric && $this->threshold !== null) {
            $p[] = ['code' => 'invalid_threshold', 'field' => 'threshold'];
        }
        // A number is a factual/legal claim: it must be backed by a source, never shipped as general guidance.
        if (($numeric || $this->threshold !== null) && $this->basis !== 'sourced') {
            $p[] = ['code' => 'threshold_requires_sourced_basis', 'field' => 'basis'];
        }
        if ($this->kind === 'question' && blank($this->translation('ar')?->question)) {
            $p[] = ['code' => 'missing_question_text', 'locale' => 'ar'];
        }

        return $p;
    }

    public function sourceForResponse(): ?array
    {
        return $this->basis === 'sourced' ? $this->sourcePayload() : null;
    }
}
