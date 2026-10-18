<?php

namespace App\Domains\Money\Support;

use App\Domains\Billing\Models\TaxRate;
use App\Domains\Content\Services\PublishGuard;
use App\Domains\DataImport\Support\ImportRun;
use App\Domains\DataImport\Support\Lifecycle;
use App\Domains\DataImport\Support\SourceFetcher;
use App\Domains\Money\Models\TaxTable;
use App\Enums\SourceType;
use Carbon\CarbonInterface;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Throwable;

/**
 * Validates the reviewed definition (database/data/tax_reference.php) and upserts it idempotently by `source_id`.
 * Nothing here knows a tax number: every figure comes from the definition, where it carries the quoted official sentence.
 */
class TaxReferenceImporter
{
    public function __construct(private PublishGuard $guard) {}

    /** @return list<string> human-readable problems; empty = valid */
    public function validate(array $def): array
    {
        $errors = [];
        foreach ($def['tables'] ?? [] as $i => $t) {
            $id = $t['source_id'] ?? "tables[$i]";
            if (! preg_match('/^[a-z0-9-]+$/', (string) ($t['source_id'] ?? ''))) {
                $errors[] = "$id: invalid source_id";
            }
            $year = (int) ($t['tax_year'] ?? 0);
            if ($year < 2000 || $year > (int) now()->year + 1) {
                $errors[] = "$id: invalid tax_year";
            }
            if (! TaxTable::bracketsValid($t['brackets'] ?? null)) {
                $errors[] = "$id: brackets not contiguous/ascending, rates outside 0-100 or last bracket not open-ended";
            }
            foreach (['contribution_rate'] as $f) {
                if (! isset($t[$f]) || ! is_numeric($t[$f]) || $t[$f] < 0 || $t[$f] > 100) {
                    $errors[] = "$id: $f must be a percentage 0-100";
                }
            }
            if (isset($t['contribution_ceiling']) && (! is_numeric($t['contribution_ceiling']) || $t['contribution_ceiling'] <= 0)) {
                $errors[] = "$id: contribution_ceiling must be positive";
            }
            if (! isset($t['deduction_flat']) || ! is_numeric($t['deduction_flat']) || $t['deduction_flat'] < 0) {
                $errors[] = "$id: deduction_flat must be >= 0";
            }
            if (blank($t['names']['it'] ?? null)) {
                $errors[] = "$id: Italian name missing";
            }
            foreach (['brackets', 'contribution_rate', 'contribution_ceiling', 'deduction_flat'] as $figure) {
                foreach ($this->sourceProblems($t['sources'][$figure] ?? null) as $p) {
                    $errors[] = "$id.$figure: $p";
                }
            }
        }
        foreach ($def['rates'] ?? [] as $i => $r) {
            $id = $r['source_id'] ?? "rates[$i]";
            if (! isset($r['rate']) || ! is_numeric($r['rate']) || $r['rate'] < 0 || $r['rate'] > 100) {
                $errors[] = "$id: rate must be a percentage 0-100";
            }
            if (! preg_match('/^[A-Z]{2}$/', (string) ($r['country'] ?? '')) || blank($r['label'] ?? null)) {
                $errors[] = "$id: country/label invalid";
            }
            foreach ($this->sourceProblems(['url' => $r['source_url'] ?? null] + $r) as $p) {
                $errors[] = "$id: $p";
            }
        }

        return $errors;
    }

    /** @return list<string> */
    private function sourceProblems(?array $s): array
    {
        if (! $s) {
            return ['no source'];
        }
        $p = [];
        $host = $this->guard->httpsHost($s['url'] ?? null);
        if ($host === null || ! $this->guard->isOfficialHost($host)) {
            $p[] = 'source url is not an https URL on an official host';
        }
        if (empty($s['quotes']) || ! is_array($s['quotes']) || collect($s['quotes'])->contains(fn ($q) => blank($q))) {
            $p[] = 'quoted official sentence missing';
        }
        if (! preg_match('/^\d{4}-\d{2}-\d{2}$/', (string) ($s['read_on'] ?? ''))) {
            $p[] = 'read_on date missing';
        }

        return $p;
    }

    /**
     * Re-reads each HTML official page and checks that every quoted sentence is still there.
     *
     * @return list<string> problems
     */
    public function verifySources(array $def, SourceFetcher $fetcher): array
    {
        $cache = [];
        $problems = [];
        $check = function (string $label, array $s) use (&$cache, &$problems, $fetcher) {
            if (! ($s['verify'] ?? false)) {
                return;
            }
            try {
                $cache[$s['url']] ??= $this->normalize(strip_tags((string) preg_replace('#<(script|style)\b.*?</\1>#is', ' ', file_get_contents($fetcher->fetch($s['url'], 'tax-reference', 'html')->path))));
            } catch (Throwable $e) {
                $problems[] = "$label: cannot fetch {$s['url']} ({$e->getMessage()})";

                return;
            }
            foreach ($s['quotes'] as $q) {
                if (! str_contains($cache[$s['url']], $this->normalize($q))) {
                    $problems[] = "$label: quote not found on the page: \"$q\"";
                }
            }
        };
        foreach ($def['tables'] as $t) {
            foreach ($t['sources'] as $figure => $s) {
                $check("{$t['source_id']}.$figure", $s);
            }
        }
        foreach ($def['rates'] as $r) {
            $check($r['source_id'], ['url' => $r['source_url']] + $r);
        }

        return $problems;
    }

    /** Date the reviewer read the official pages (oldest `read_on` of the definition). */
    public function reviewedOn(array $def): CarbonInterface
    {
        $dates = [];
        foreach ($def['tables'] as $t) {
            foreach ($t['sources'] as $s) {
                $dates[] = $s['read_on'];
            }
        }
        foreach ($def['rates'] as $r) {
            $dates[] = $r['read_on'];
        }
        sort($dates);

        return Carbon::parse($dates[0])->startOfDay();
    }

    private function normalize(string $s): string
    {
        $s = html_entity_decode($s, ENT_QUOTES | ENT_HTML5, 'UTF-8');
        $s = str_replace(["\u{00A0}", '’', '‘'], [' ', "'", "'"], $s);
        $s = (string) preg_replace('/\s+/u', ' ', $s);

        return (string) preg_replace('/\s+([,.;:%])/u', '$1', trim($s));
    }

    /** Key-order and int/float independent form of a decoded JSON value. */
    private function canonical(mixed $value): string
    {
        $normalise = function (mixed $v) use (&$normalise) {
            if (is_array($v)) {
                $v = array_map($normalise, $v);
                if (! array_is_list($v)) {
                    ksort($v);
                }

                return $v;
            }

            return is_int($v) || is_float($v) ? (float) $v : $v;
        };

        return json_encode($normalise($value));
    }

    /** @param CarbonInterface $verified when the figures were last checked against the official pages */
    public function import(array $def, ImportRun $run, bool $dryRun, CarbonInterface $verified): void
    {
        foreach ($def['tables'] as $t) {
            $run->read();
            $sourceUrl = $t['sources']['brackets']['url'];
            $attrs = [
                'slug' => $t['slug'], 'tax_year' => $t['tax_year'], 'sort_order' => $t['sort_order'] ?? 0,
                'brackets' => $t['brackets'], 'deduction_flat' => $t['deduction_flat'],
                'contribution_rate' => $t['contribution_rate'], 'contribution_ceiling' => $t['contribution_ceiling'] ?? null,
                'source_name' => $def['source_name'], 'source_url' => $sourceUrl, 'source_type' => SourceType::Official,
                'source_license' => $def['license'] ?? 'normative figures; no reuse licence stated on the pages',
            ];
            try {
                if ($dryRun) {
                    TaxTable::withTrashed()->where('source_id', $t['source_id'])->exists() ? $run->unchanged() : $run->added();

                    continue;
                }
                DB::transaction(function () use ($t, $attrs, $verified, $run) {
                    $row = TaxTable::withTrashed()->where('source_id', $t['source_id'])->first();
                    if (! $row) {
                        $row = new TaxTable($attrs + ['source_id' => $t['source_id']]);
                        $row->forceFill(Lifecycle::attributes() + ['last_verified_at' => $verified]);
                        $row->save();
                        $row->setTranslations($this->translations($t));
                        $run->added();

                        return;
                    }
                    // MySQL/MariaDB return JSON with its own key order and number types: compare the brackets by value.
                    if ($this->canonical($row->brackets) === $this->canonical($attrs['brackets'])) {
                        unset($attrs['brackets']);
                    }
                    $row->fill($attrs);
                    $trChanged = $this->translationsChanged($row, $t);
                    if (! $row->isDirty() && ! $trChanged) {
                        $row->forceFill(['last_verified_at' => $verified])->save(); // freshness only: still "unchanged" content
                        $run->unchanged();

                        return;
                    }
                    $row->forceFill(['last_verified_at' => $verified])->save();
                    $row->setTranslations($this->translations($t));
                    $run->updated();
                });
            } catch (Throwable $e) {
                $run->reject($e->getMessage(), ['source_id' => $t['source_id']]);
            }
        }

        foreach ($def['rates'] as $r) {
            $run->read();
            try {
                if ($dryRun) {
                    $this->findRate($r) ? $run->unchanged() : $run->added();

                    continue;
                }
                $row = $this->findRate($r);
                $values = ['rate' => $r['rate'], 'source_url' => $r['source_url']];
                if (! $row) {
                    TaxRate::create(['country' => $r['country'], 'label' => $r['label'], 'valid_from' => $r['valid_from']] + $values + ['verified_at' => $verified]);
                    $run->added();
                } elseif ((float) $row->rate !== (float) $r['rate'] || $row->source_url !== $r['source_url']) {
                    $row->forceFill($values + ['verified_at' => $verified])->save();
                    $run->updated();
                } else {
                    $row->forceFill(['verified_at' => $verified])->save();
                    $run->unchanged();
                }
            } catch (Throwable $e) {
                $run->reject($e->getMessage(), ['source_id' => $r['source_id']]);
            }
        }
    }

    private function findRate(array $r): ?TaxRate
    {
        return TaxRate::where('country', $r['country'])->where('label', $r['label'])
            ->when($r['valid_from'], fn ($q, $d) => $q->whereDate('valid_from', $d), fn ($q) => $q->whereNull('valid_from'))->first();
    }

    /** @return array<string,array<string,string>> */
    private function translations(array $t): array
    {
        $out = [];
        foreach ($t['names'] as $locale => $name) {
            $out[$locale] = ['name' => $name, 'notes' => $t['notes'][$locale] ?? null];
        }

        return $out;
    }

    private function translationsChanged(TaxTable $row, array $t): bool
    {
        foreach ($this->translations($t) as $locale => $fields) {
            $tr = $row->translations()->where('locale', $locale)->first();
            if (! $tr || $tr->name !== $fields['name'] || $tr->notes !== $fields['notes']) {
                return true;
            }
        }

        return false;
    }
}
