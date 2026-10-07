<?php

namespace App\Domains\Money\Models;

use App\Domains\Content\Concerns\HasContentLifecycle;
use App\Domains\Content\Concerns\HasSource;
use App\Domains\Content\Concerns\HasTranslations;
use App\Support\Audit\Auditable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * One tax year's parameters for the net-salary estimator. Every number here is a factual claim about Italian law, so a
 * table can only be published with a complete official source and a recent verification date (PublishGuard).
 * EXPA seeds no tables: they are entered and verified by an admin.
 */
class TaxTable extends Model
{
    use Auditable, HasContentLifecycle, HasSource, HasTranslations, SoftDeletes;

    protected $guarded = ['id', 'status', 'publish_at', 'published_at', 'created_by', 'updated_by'];

    protected $attributes = ['deduction_flat' => 0];

    protected array $translatable = ['name', 'notes'];

    public array $requiredTranslatableFields = ['name'];

    protected bool $requiresSource = true;

    protected function casts(): array
    {
        return ['brackets' => 'array', 'contribution_rate' => 'decimal:2', 'contribution_ceiling' => 'decimal:2', 'deduction_flat' => 'decimal:2'];
    }

    public static function contentAttributes(): array
    {
        return ['slug', 'tax_year', 'contribution_rate', 'contribution_ceiling', 'deduction_flat', 'brackets', 'sort_order',
            'source_name', 'source_url', 'source_type', 'last_verified_at'];
    }

    /** Valid brackets: ascending `up_to`, rates 0-100, exactly one open-ended (null) last bracket. */
    public static function bracketsValid(mixed $brackets): bool
    {
        if (! is_array($brackets) || $brackets === []) {
            return false;
        }
        $prev = 0.0;
        $last = count($brackets) - 1;
        foreach (array_values($brackets) as $i => $b) {
            if (! is_array($b) || ! isset($b['rate']) || ! is_numeric($b['rate']) || $b['rate'] < 0 || $b['rate'] > 100) {
                return false;
            }
            $upTo = $b['up_to'] ?? null;
            if ($i === $last) {
                return $upTo === null;
            }
            if (! is_numeric($upTo) || (float) $upTo <= $prev) {
                return false;
            }
            $prev = (float) $upTo;
        }

        return true;
    }

    public function extraPublishProblems(): array
    {
        $p = [];
        if (! $this->tax_year || $this->tax_year < 2000 || $this->tax_year > (int) now()->year + 1) {
            $p[] = ['code' => 'invalid_tax_year', 'field' => 'tax_year'];
        }
        if (! self::bracketsValid($this->brackets)) {
            $p[] = ['code' => 'invalid_brackets', 'field' => 'brackets'];
        }
        if ($this->contribution_rate === null && $this->contribution_ceiling !== null) {
            $p[] = ['code' => 'ceiling_without_rate', 'field' => 'contribution_rate'];
        }

        return $p;
    }

    /** Newest published table for a year (or the latest year when none is given). */
    public static function currentFor(?int $year = null): ?self
    {
        $q = static::published()->with('translations');
        if ($year) {
            $q->where('tax_year', $year);
        }

        return $q->orderByDesc('tax_year')->orderByDesc('last_verified_at')->orderByDesc('id')->first();
    }
}
