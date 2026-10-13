<?php

namespace App\Domains\Patente\Support;

use App\Domains\Content\Services\PublishGuard;
use App\Domains\DataImport\Support\ImportRun;
use App\Domains\DataImport\Support\Lifecycle;
use App\Domains\DataImport\Support\SourceFetcher;
use App\Domains\Patente\Models\PatenteCategory;
use App\Enums\SourceType;
use Carbon\CarbonInterface;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Throwable;

/**
 * Imports the licence categories (vehicles + minimum age) from the reviewed definition
 * (database/data/patente_categories.php), idempotently by `source_id`. Exam questions are never part of this.
 */
class PatenteCategoriesImporter
{
    public function __construct(private PublishGuard $guard) {}

    /** @return list<string> */
    public function validate(array $def): array
    {
        $errors = [];
        $host = $this->guard->httpsHost($def['source_url'] ?? null);
        if ($host === null || ! $this->guard->isOfficialHost($host)) {
            $errors[] = 'source_url is not an https URL on an official host';
        }
        if (! preg_match('/^\d{4}-\d{2}-\d{2}$/', (string) ($def['read_on'] ?? ''))) {
            $errors[] = 'read_on date missing';
        }
        $seen = [];
        foreach ($def['categories'] ?? [] as $i => $c) {
            $id = $c['code'] ?? "categories[$i]";
            if (! preg_match('/^[A-Z0-9]{1,3}$/', (string) ($c['code'] ?? ''))) {
                $errors[] = "$id: invalid code";
            }
            if (isset($seen[$c['code'] ?? ''])) {
                $errors[] = "$id: duplicate code";
            }
            $seen[$c['code'] ?? ''] = true;
            if (! is_int($c['min_age'] ?? null) || $c['min_age'] < 14 || $c['min_age'] > 30) {
                $errors[] = "$id: min_age must be a plausible licence age (14-30)";
            }
            if (blank($c['quote'] ?? null)) {
                $errors[] = "$id: quoted official sentence missing";
            }
            foreach (['vehicles', 'conditions'] as $f) {
                foreach ($c[$f] ?? [] as $locale => $text) {
                    if (! in_array($locale, ['ar', 'en', 'it'], true) || blank($text)) {
                        $errors[] = "$id: invalid $f.$locale";
                    }
                }
            }
            if (blank($c['vehicles']['it'] ?? null)) {
                $errors[] = "$id: Italian vehicle description (paraphrase of the page) missing";
            }
            // the declared minimum age must be the one the quoted official sentence(s) state
            if (isset($c['min_age'], $c['quote']) && ! preg_match('/\b'.$c['min_age'].'\b/', $c['quote'].' '.implode(' ', $c['quote_extra'] ?? []))) {
                $errors[] = "$id: min_age {$c['min_age']} is not stated in the quoted official sentence";
            }
        }
        if (empty($def['categories'])) {
            $errors[] = 'no categories';
        }

        return $errors;
    }

    /** @return list<string> */
    public function verifySource(array $def, SourceFetcher $fetcher): array
    {
        try {
            $html = (string) file_get_contents($fetcher->fetch($def['source_url'], 'patente-categories', 'html')->path);
        } catch (Throwable $e) {
            return ["cannot fetch {$def['source_url']} ({$e->getMessage()})"];
        }
        $page = $this->normalize(strip_tags((string) preg_replace('#<(script|style)\b.*?</\1>#is', ' ', $html)));
        $problems = [];
        foreach ($def['categories'] as $c) {
            foreach ([$c['quote'], ...($c['quote_extra'] ?? [])] as $q) {
                if (! str_contains($page, $this->normalize($q))) {
                    $problems[] = "{$c['code']}: quote not found on the page: \"$q\"";
                }
            }
        }

        return $problems;
    }

    private function normalize(string $s): string
    {
        $s = html_entity_decode($s, ENT_QUOTES | ENT_HTML5, 'UTF-8');
        $s = str_replace(["\u{00A0}", '’', '‘'], [' ', "'", "'"], $s);
        $s = (string) preg_replace('/\s+/u', ' ', $s);

        return (string) preg_replace('/\s+([,.;:%])/u', '$1', trim($s));
    }

    public function reviewedOn(array $def): CarbonInterface
    {
        return Carbon::parse($def['read_on'])->startOfDay();
    }

    public function import(array $def, ImportRun $run, bool $dryRun, CarbonInterface $verified): void
    {
        foreach ($def['categories'] as $i => $c) {
            $run->read();
            $sourceId = 'it-patente-'.strtolower($c['code']);
            $attrs = [
                'slug' => strtolower($c['code']), 'sort_order' => ($i + 1) * 10,
                'source_name' => $def['source_name'], 'source_url' => $def['source_url'], 'source_type' => SourceType::Official,
                'source_license' => $def['license'] ?? 'public legal facts; no reuse licence stated on the page',
            ];
            try {
                $row = PatenteCategory::withTrashed()->where('source_id', $sourceId)->first();
                if ($dryRun) {
                    $row ? $run->unchanged() : $run->added();

                    continue;
                }
                DB::transaction(function () use (&$row, $attrs, $sourceId, $c, $def, $verified, $run) {
                    $translations = $this->translations($c, $def);
                    if (! $row) {
                        $row = new PatenteCategory($attrs + ['source_id' => $sourceId]);
                        $row->forceFill(Lifecycle::attributes() + ['last_verified_at' => $verified])->save();
                        $row->setTranslations($translations);
                        $run->added();

                        return;
                    }
                    $row->fill($attrs);
                    $changed = $row->isDirty() || $this->translationsChanged($row, $translations);
                    $row->forceFill(['last_verified_at' => $verified])->save();
                    if ($changed) {
                        $row->setTranslations($translations);
                        $run->updated();
                    } else {
                        $run->unchanged();
                    }
                });
            } catch (Throwable $e) {
                $run->reject($e->getMessage(), ['code' => $c['code']]);
            }
        }
    }

    private function summary(array $c, string $locale): ?string
    {
        $v = $c['vehicles'][$locale] ?? null;
        if ($v === null) {
            return null;
        }

        return match ($locale) {
            'it' => rtrim($v, '.').". Età minima: {$c['min_age']} anni.",
            'en' => rtrim($v, '.').". Minimum age: {$c['min_age']}.",
            'ar' => rtrim($v, '.').". الحد الأدنى للسن: {$c['min_age']} سنة.",
        };
    }

    /** @return array<string,array{title:string,summary:string,body:string}> */
    private function translations(array $c, array $def): array
    {
        $titles = ['it' => "Patente categoria {$c['code']}", 'en' => "Driving licence – category {$c['code']}", 'ar' => "رخصة القيادة – الفئة {$c['code']}"];
        $out = [];
        foreach ($titles as $locale => $title) {
            if (! isset($c['vehicles'][$locale])) {
                continue;
            }
            $out[$locale] = [
                'title' => $title,
                'summary' => $this->summary($c, $locale),
                'body' => trim(($c['conditions'][$locale] ?? '')."\n\n".$def['source_note'][$locale]),
            ];
        }

        return $out;
    }

    private function translationsChanged(PatenteCategory $row, array $translations): bool
    {
        foreach ($translations as $locale => $fields) {
            $tr = $row->translations()->where('locale', $locale)->first();
            if (! $tr || $tr->title !== $fields['title'] || $tr->summary !== $fields['summary'] || $tr->body !== $fields['body']) {
                return true;
            }
        }

        return false;
    }
}
