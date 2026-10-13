<?php

namespace App\Domains\GeoImport\Services;

use App\Domains\Content\Services\PublishGuard;
use App\Domains\DataImport\Models\DataImportRun;
use App\Domains\DataImport\Support\FetchedSource;
use App\Domains\DataImport\Support\ImportRun;
use App\Domains\DataImport\Support\SourceFetcher;
use App\Domains\Geo\Models\City;
use App\Domains\Geo\Models\Region;
use App\Domains\GeoImport\Support\XlsxReader;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use RuntimeException;

/**
 * Imports ISTAT's official "Elenco dei comuni italiani" (permanent XLSX link) into regions.istat_code and
 * cities / city_translations (locale `it` = "Denominazione in italiano"). Idempotent, keyed by the 6-digit ISTAT
 * municipality code; curated cities (matched by slug + region) keep their ar/en/it names and slug.
 */
class IstatComuniImporter
{
    public const DATASET = 'istat-comuni';

    public const PAGE_URL = 'https://www.istat.it/classificazione/codici-dei-comuni-delle-province-e-delle-regioni/';

    public const FILE_URL = 'https://www.istat.it/storage/codici-unita-amministrative/Elenco-comuni-italiani.xlsx';

    public const LICENSE = 'CC BY 4.0';

    public const LICENSE_URL = 'https://creativecommons.org/licenses/by/4.0/deed.it';

    /** Expected header fragments (normalised) per column: guards against ISTAT changing the layout. */
    private const HEADERS = [
        'A' => 'codice regione', 'E' => 'codice comune formato alfanumerico', 'G' => 'denominazione in italiano',
        'K' => 'denominazione regione', 'N' => 'flag comune capoluogo', 'O' => 'sigla automobilistica',
    ];

    /** @var array<string,int> */
    private array $counts = [];

    /** @var list<string> */
    public array $notes = [];

    public function __construct(private readonly SourceFetcher $fetcher, private readonly PublishGuard $guard) {}

    /** @return array{counts:array<string,int>,notes:list<string>,run:?DataImportRun,edition:?string} */
    public function run(?string $file, bool $all, bool $dryRun, ?int $limit = null): array
    {
        $host = parse_url(self::PAGE_URL, PHP_URL_HOST);
        if (! $this->guard->isOfficialHost((string) $host)) {
            throw new RuntimeException("Source host $host is not an official domain.");
        }

        $fetched = $file ? $this->fetcher->fromFile($file, self::DATASET) : $this->fetcher->fetch(self::FILE_URL, self::DATASET, 'xlsx');
        $sheet = XlsxReader::firstSheet($fetched->path);
        $edition = $this->edition($sheet['sheet']);
        $this->assertHeader($sheet['rows'][0] ?? []);

        $run = $dryRun ? null : ImportRun::start([
            'dataset' => self::DATASET,
            'source_name' => 'ISTAT — Elenco dei comuni italiani (codici statistici delle unità amministrative territoriali)',
            'source_url' => self::PAGE_URL,
            'license' => self::LICENSE,
            'license_url' => self::LICENSE_URL,
            'attribution' => 'Fonte: Istat, Elenco dei comuni italiani'.($edition ? " (aggiornato al {$edition})" : '').', licenza CC BY 4.0.',
            'source_edition' => $edition ? "ISTAT {$sheet['sheet']}" : $sheet['sheet'],
            'source_published_at' => $edition,
        ]);
        $run?->fetched($fetched);

        try {
            $this->counts = ['read' => 0, 'added' => 0, 'updated' => 0, 'unchanged' => 0, 'rejected' => 0];
            $this->process(array_slice($sheet['rows'], 1), $all, $dryRun, $limit, $run, $fetched);
            $row = $run?->finish();
        } catch (\Throwable $e) {
            $run?->finish($e->getMessage());
            throw $e;
        }

        return ['counts' => $this->counts, 'notes' => $this->notes, 'run' => $row, 'edition' => $edition];
    }

    private function process(array $rows, bool $all, bool $dryRun, ?int $limit, ?ImportRun $run, FetchedSource $fetched): void
    {
        $verifiedAt = $fetched->fetchedAt;

        // Parse + validate everything first so homonym slugs are decided on the full file (stable across scopes).
        $valid = [];
        $seen = [];
        foreach ($rows as $r) {
            $code = trim($r['E'] ?? '');
            $name = trim($r['G'] ?? '');
            $reason = match (true) {
                ! preg_match('/^\d{6}$/', $code) => 'invalid ISTAT municipality code',
                $name === '' || mb_strlen($name) > 120 => 'missing or oversized Italian denomination',
                ! preg_match('/^\d{2}$/', $r['A'] ?? '') => 'invalid region code',
                ! preg_match('/^[A-Z]{2}$/', $r['O'] ?? '') => 'invalid province sigla',
                ! in_array($r['N'] ?? '', ['0', '1'], true) => 'invalid capoluogo flag',
                isset($seen[$code]) => 'duplicate ISTAT code in source',
                default => null,
            };
            if ($reason) {
                $this->tally('rejected', $run, 'reject', [$reason, ['istat' => $code, 'name' => $name]]);

                continue;
            }
            $seen[$code] = true;
            $valid[] = ['istat' => $code, 'name' => $name, 'region' => $r['A'], 'region_name' => trim($r['K'] ?? ''), 'sigla' => $r['O'], 'capital' => $r['N'] === '1'];
        }
        // rejects were counted via tally (counts + run); keep 'read' for in-scope rows only.
        $baseCount = array_count_values(array_map(fn ($v) => $this->baseSlug($v['name']), $valid));

        $regionIds = $this->syncRegions($valid, $run, $dryRun);

        $scope = array_values(array_filter($valid, fn ($v) => $all || $v['capital']));
        if ($limit) {
            $scope = array_slice($scope, 0, $limit);
        }

        foreach (array_chunk($scope, 500) as $chunk) {
            $apply = function () use ($chunk, $regionIds, $baseCount, $run, $dryRun, $verifiedAt) {
                foreach ($chunk as $v) {
                    $this->upsert($v, $regionIds, $baseCount, $run, $dryRun, $verifiedAt);
                }
            };
            $dryRun ? $apply() : DB::transaction($apply);
        }

        if (! $dryRun) {
            // Truthful provenance date for rows that were re-confirmed unchanged by this fetch.
            foreach (array_chunk(array_column($scope, 'istat'), 500) as $codes) {
                City::whereIn('istat_code', $codes)->update(['source_verified_at' => $verifiedAt]);
            }
        }

        $absent = City::whereNotNull('istat_code')->whereNotIn('istat_code', array_keys($seen))->count();
        if ($absent > 0) {
            $this->notes[] = "$absent imported cities carry an ISTAT code that is no longer in the source (merged/suppressed municipalities); left untouched, review manually.";
        }
    }

    /** @return array<string,int> region code => id */
    private function syncRegions(array $valid, ?ImportRun $run, bool $dryRun): array
    {
        $fileRegions = [];
        foreach ($valid as $v) {
            $fileRegions[$v['region']] = $v['region_name'];
        }
        ksort($fileRegions);
        $ids = [];
        $db = Region::with('translations')->get()->keyBy('code');
        foreach ($fileRegions as $code => $istatName) {
            $code = (string) $code;
            $region = $db[$code] ?? null;
            if (! $region) {
                $this->notes[] = "ISTAT region $code ($istatName) does not exist in regions: its municipalities are rejected.";

                continue;
            }
            $ids[$code] = $region->id;
            $this->tally('read', $run, 'read');
            $itName = $region->translations->firstWhere('locale', 'it')?->name;
            if ($itName === null || $this->normRegion($itName) !== $this->normRegion($istatName)) {
                $this->notes[] = "Region $code name mismatch: database it='$itName' vs ISTAT '$istatName'.";
            }
            if ($region->istat_code === $code) {
                $this->tally('unchanged', $run, 'unchanged');
            } elseif ($region->istat_code === null) {
                $dryRun || $region->forceFill(['istat_code' => $code])->save();
                $this->tally('updated', $run, 'updated');
            } else {
                $this->notes[] = "Region $code has a different istat_code ({$region->istat_code}); not overwritten.";
                $this->tally('unchanged', $run, 'unchanged');
            }
        }
        foreach ($db as $code => $region) {
            if (! isset($fileRegions[(string) $code])) {
                $this->notes[] = "Database region $code ({$region->slug}) is not in the ISTAT list.";
            }
        }

        return $ids;
    }

    private function upsert(array $v, array $regionIds, array $baseCount, ?ImportRun $run, bool $dryRun, \DateTimeInterface $verifiedAt): void
    {
        $this->tally('read', $run, 'read');
        $regionId = $regionIds[$v['region']] ?? null;
        if (! $regionId) {
            $this->tally('rejected', $run, 'reject', ['region not present in the regions table', ['istat' => $v['istat'], 'region' => $v['region']]]);

            return;
        }
        $data = ['region_id' => $regionId, 'province_code' => $v['sigla'], 'is_province_capital' => $v['capital'], 'source_license' => self::LICENSE];
        $base = $this->baseSlug($v['name']);

        $city = City::with('translations')->where('istat_code', $v['istat'])->first();
        if (! $city && $base !== '') {
            // Attach ISTAT data to a curated city (same slug, same region, not yet coded) instead of duplicating it.
            $city = City::with('translations')->where('slug', $base)->whereNull('istat_code')->where('region_id', $regionId)->first();
        }

        if (! $city) {
            $slug = $this->freeSlug($base, $v, $baseCount);
            if ($slug === null) {
                $this->tally('rejected', $run, 'reject', ['cannot derive a slug', ['istat' => $v['istat'], 'name' => $v['name']]]);

                return;
            }
            if (! $dryRun) {
                $city = City::create($data + ['slug' => $slug, 'istat_code' => $v['istat'], 'source_verified_at' => $verifiedAt]);
                $city->setTranslations(['it' => ['name' => $v['name']]]);
            }
            $this->tally('added', $run, 'added');

            return;
        }

        $changes = [];
        foreach ($data as $k => $val) {
            if ($city->{$k} != $val) {
                $changes[$k] = $val;
            }
        }
        if ($city->istat_code === null) {
            $changes['istat_code'] = $v['istat'];
        }
        $it = $city->translations->firstWhere('locale', 'it');
        $curated = $city->translations->whereIn('locale', ['ar', 'en'])->isNotEmpty();
        $nameChange = ! $it || (! $curated && $it->name !== $v['name']);

        if (! $changes && ! $nameChange) {
            $this->tally('unchanged', $run, 'unchanged');

            return;
        }
        if (! $dryRun) {
            $changes && $city->forceFill($changes + ['source_verified_at' => $verifiedAt])->save();
            $nameChange && $city->setTranslations(['it' => ['name' => $v['name']]]);
        }
        $this->tally('updated', $run, 'updated');
    }

    private function baseSlug(string $name): string
    {
        return Str::limit(Str::slug(str_replace(["'", '’'], '-', $name)), 70, '');
    }

    /** Stable, unique slug: plain name; homonyms (in the whole file) or taken slugs get the province sigla. */
    private function freeSlug(string $base, array $v, array $baseCount): ?string
    {
        if ($base === '') {
            return null;
        }
        $sigla = strtolower($v['sigla']);
        $candidates = ($baseCount[$base] ?? 0) > 1 ? ["$base-$sigla", "$base-$sigla-{$v['istat']}"] : [$base, "$base-$sigla", "$base-$sigla-{$v['istat']}"];
        foreach ($candidates as $c) {
            if (! City::where('slug', $c)->exists()) {
                return $c;
            }
        }

        return null;
    }

    private function tally(string $key, ?ImportRun $run, string $method, array $args = []): void
    {
        // Region + city rows share the counters; `read` counts every record examined in scope.
        $this->counts[$key] = ($this->counts[$key] ?? 0) + 1;
        $run?->{$method}(...$args);
    }

    private function normRegion(string $name): string
    {
        return Str::slug(Str::before($name, '/'));
    }

    private function edition(string $sheetName): ?string
    {
        return preg_match('/(\d{2})_(\d{2})_(\d{4})/', $sheetName, $m) ? "{$m[3]}-{$m[2]}-{$m[1]}" : null;
    }

    private function assertHeader(array $header): void
    {
        foreach (self::HEADERS as $col => $fragment) {
            $text = mb_strtolower(preg_replace('/\s+/', ' ', (string) ($header[$col] ?? '')));
            if (! str_contains($text, $fragment)) {
                throw new RuntimeException("Unexpected ISTAT layout: column $col should contain '$fragment', got '$text'.");
            }
        }
    }
}
