<?php

namespace App\Domains\GovernmentImport\Services;

use App\Domains\DataImport\Models\DataImportRun;
use App\Domains\DataImport\Support\FetchedSource;
use App\Domains\DataImport\Support\ImportRun;
use App\Domains\DataImport\Support\Lifecycle;
use App\Domains\DataImport\Support\SourceFetcher;
use App\Domains\Geo\Models\City;
use App\Domains\Geo\Models\Region;
use App\Domains\Government\Enums\BookingMethod;
use App\Domains\Government\Enums\OfficeType;
use App\Domains\Government\Models\GovernmentOffice;
use App\Domains\Government\Models\GovernmentService;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use InvalidArgumentException;
use Throwable;

/**
 * Imports public offices from the IPA open data (AgID, CC BY 4.0): datasets "Enti" and "Unità Organizzative".
 *
 * What is (and is not) imported, decided from the data itself:
 *  - asl:        entities of category L7 (Aziende Sanitarie Locali / USL / ASP) plus the L8 entities named ASST.
 *  - questure:   Polizia di Stato units whose description is "Questura ... Ufficio Immigrazione" (or the Cagliari
 *                "Ufficio Polizia per l'Immigrazione e gli Stranieri"). IPA lists most other Questura units
 *                (accounting, logistics, commissariati ...) as internal units: they are not offices for foreigners.
 *  - prefetture: Ministry of the Interior units of a Prefettura explicitly about immigration. IPA otherwise only holds
 *                accounting units of the Prefetture, which would be misleading as "the Prefettura".
 *  - comuni (opt-in): registry units (anagrafe / stato civile / servizi demografici) of municipalities (category L6).
 *
 * Staff names, staff e-mails and responsible-person phones are never read. The only e-mail kept is the PEC the
 * institution publishes for the unit.
 */
class IpaOfficesImporter
{
    public const DATASET = 'ipa-offices';

    public const LICENSE = 'CC-BY-4.0';

    public const LICENSE_URL = 'https://creativecommons.org/licenses/by/4.0/';

    public const ENTI_URL = 'https://indicepa.gov.it/ipa-dati/datastore/dump/d09adf99-dc10-4349-8c53-27b1e5aa97b6?format=csv';

    public const UO_URL = 'https://indicepa.gov.it/ipa-dati/datastore/dump/b0aa1f6c-f135-4c8a-b416-396fed4e1a5d?format=csv';

    public const ENTI_PAGE = 'https://indicepa.gov.it/ipa-dati/dataset/enti';

    public const UO_PAGE = 'https://indicepa.gov.it/ipa-dati/dataset/unita-organizzative';

    public const ISTAT_URL = 'https://www.istat.it/storage/codici-unita-amministrative/Elenco-comuni-italiani.csv';

    public const CATEGORIES = ['asl', 'questure', 'prefetture', 'comuni'];

    public const DEFAULT_CATEGORIES = ['asl', 'questure', 'prefetture'];

    /**
     * Service <-> office links that are verifiable facts, never inferred: the service is explicitly about permits
     * "in Questura" in one city (evidence: the service's own source page, Prefettura di Roma "Permessi in Questura",
     * https://prefettura.interno.gov.it/it/prefetture/roma/permessi-questura) and IPA lists that city's Questura
     * immigration office. [service slug, IPA Codice_uni_uo of the office]
     */
    public const SERVICE_OFFICE_LINKS = [
        ['permesso-di-soggiorno-roma', 'YN7RCT'], // Questura di Roma - Ufficio Immigrazione
    ];

    private const POLIZIA_DI_STATO = 'XZR4RNHR';

    private const MIN_KEEP_RATIO = 0.5;

    /** @var array<string,string> */
    private array $regionByIstat = [];

    /** @var array<string,int> region code (2 digits) => id */
    private array $regionIds = [];

    /** @var array<string,array{id:int,region_id:int}> */
    private array $cities = [];

    public function __construct(private readonly SourceFetcher $fetcher) {}

    /**
     * @param  array<int,string>  $categories
     * @param  array{enti?:?string,uo?:?string,istat?:?string,limit?:?int}  $opts
     * @return array{counts:array<string,int>,notes:array<int,string>,run:?DataImportRun,per_category:array<string,int>}
     */
    public function run(array $categories, bool $dryRun = false, array $opts = []): array
    {
        // The Unità Organizzative dump is ~34 MB and SourceFetcher holds the response body in memory.
        @ini_set('memory_limit', '512M');
        $categories = array_values(array_unique($categories));
        foreach ($categories as $c) {
            if (! in_array($c, self::CATEGORIES, true)) {
                throw new InvalidArgumentException("Unknown category [$c]. Allowed: ".implode(', ', self::CATEGORIES));
            }
        }
        if (! $categories) {
            throw new InvalidArgumentException('No category selected.');
        }

        $notes = [];
        $needsUo = (bool) array_intersect($categories, ['questure', 'prefetture', 'comuni']);
        $limit = $opts['limit'] ?? null;

        $run = $dryRun ? null : ImportRun::start([
            'dataset' => self::DATASET,
            'source_name' => 'IndicePA (AgID) — Enti'.($needsUo ? ' e Unità Organizzative' : ''),
            'source_url' => $needsUo ? self::UO_PAGE : self::ENTI_PAGE,
            'license' => self::LICENSE,
            'license_url' => self::LICENSE_URL,
            'attribution' => 'Fonte: IndicePA – Indice dei domicili digitali delle Pubbliche Amministrazioni e dei gestori di pubblici servizi (AgID), dati aperti, licenza CC BY 4.0. Categorie: '.implode(', ', $categories).'.',
            'source_edition' => $this->edition('5baa3eb8-266e-455a-8de8-b1f434c279b2'),
        ]);
        $counts = ['read' => 0, 'added' => 0, 'updated' => 0, 'unchanged' => 0, 'rejected' => 0, 'stale' => 0];
        $perCategory = [];

        try {
            $enti = $this->source($opts['enti'] ?? null, self::ENTI_URL, 'enti');
            $run?->fetched($enti);
            $uo = $needsUo ? $this->source($opts['uo'] ?? null, self::UO_URL, 'uo') : null;
            $this->loadGeography($opts['istat'] ?? null, $notes);

            $entiMap = $this->readEnti($enti->path);
            $records = [];
            foreach ($categories as $category) {
                $found = match ($category) {
                    'asl' => $this->aslRecords($entiMap),
                    'questure' => $this->uoRecords($uo->path, $entiMap, 'questure'),
                    'prefetture' => $this->uoRecords($uo->path, $entiMap, 'prefetture'),
                    'comuni' => $this->uoRecords($uo->path, $entiMap, 'comuni'),
                };
                $perCategory[$category] = count($found);
                array_push($records, ...$found);
            }
            if ($limit) {
                $records = array_slice($records, 0, $limit);
            }

            $seen = [];
            $fetchDate = ($enti->fetchedAt)->startOfDay();
            foreach ($records as $rec) {
                $counts['read']++;
                $run?->read();
                try {
                    $attrs = $this->validate($rec, $seen);
                } catch (InvalidArgumentException $e) {
                    $counts['rejected']++;
                    $run?->reject($e->getMessage(), ['source_id' => $rec['source_id'] ?? null, 'name' => $rec['name'] ?? null]);

                    continue;
                }
                $outcome = $dryRun ? $this->predict($attrs) : $this->upsert($attrs, $fetchDate);
                $counts[$outcome]++;
                $run?->{$outcome}();
            }

            // Disappeared from the source => archived (never deleted), only on full runs and sane datasets.
            if (! $limit) {
                $counts['stale'] = $this->markStale($categories, array_keys($seen), $dryRun, $notes, $run);
            }

            if (! $dryRun && ! $limit) {
                $this->linkServices($notes);
            }
            $row = $run?->finish();
        } catch (Throwable $e) {
            $run?->finish($e->getMessage());
            throw $e;
        }

        return ['counts' => $counts, 'notes' => $notes, 'run' => $row ?? null, 'per_category' => $perCategory];
    }

    // ---------------------------------------------------------------- sources

    private function source(?string $file, string $url, string $name): FetchedSource
    {
        return $file ? $this->fetcher->fromFile($file, self::DATASET.'-'.$name) : $this->fetcher->fetch($url, self::DATASET.'-'.$name, 'csv');
    }

    private function edition(string $packageId): ?string
    {
        try {
            $this->fetcher->assertAllowed('https://indicepa.gov.it/');
            $res = Http::withUserAgent((string) config('dataimport.user_agent'))->timeout(20)
                ->get('https://indicepa.gov.it/ipa-dati/api/3/action/package_show', ['id' => $packageId]);

            return $res->successful() ? substr((string) $res->json('result.metadata_modified'), 0, 10) ?: null : null;
        } catch (Throwable) {
            return null;
        }
    }

    /** ISTAT comune code (6 digits) => ISTAT region code, plus lookup tables of our own regions/cities. */
    private function loadGeography(?string $istatFile, array &$notes): bool
    {
        foreach (Region::query()->get(['id', 'code']) as $r) {
            $this->regionIds[$r->code] = $r->id;
        }
        $this->cities = City::query()->whereNotNull('istat_code')->get(['id', 'region_id', 'istat_code'])
            ->mapWithKeys(fn ($c) => [$c->istat_code => ['id' => $c->id, 'region_id' => $c->region_id]])->all();

        try {
            $src = $istatFile ? $this->fetcher->fromFile($istatFile, 'istat-comuni') : $this->fetcher->fetch(self::ISTAT_URL, 'istat-comuni', 'csv');
            $h = fopen($src->path, 'rb');
            fgetcsv($h, 0, ';', '"', '');
            while (($row = fgetcsv($h, 0, ';', '"', '')) !== false) {
                if (isset($row[4], $row[0]) && preg_match('/^\d{6}$/', $row[4])) {
                    $this->regionByIstat[$row[4]] = str_pad(trim($row[0]), 2, '0', STR_PAD_LEFT);
                }
            }
            fclose($h);
        } catch (Throwable $e) {
            $notes[] = 'ISTAT municipality list unavailable ('.$e->getMessage().'): region_id only resolved through known cities.';
        }

        return $this->regionByIstat !== [];
    }

    /** @return array<string,array<string,string>> Codice_IPA => selected entity columns */
    private function readEnti(string $path): array
    {
        $out = [];
        foreach ($this->csvRows($path) as $r) {
            if (($r['Codice_IPA'] ?? '') !== '') {
                // Only what is needed; staff names and the unused columns are dropped immediately.
                $out[$r['Codice_IPA']] = array_intersect_key($r, array_flip([
                    'Denominazione_ente', 'Codice_Categoria', 'Ente_in_liquidazione', 'CAP', 'Indirizzo', 'Codice_comune_ISTAT', 'Sito_istituzionale',
                    'Data_aggiornamento', 'Mail1', 'Tipo_Mail1', 'Mail2', 'Tipo_Mail2', 'Mail3', 'Tipo_Mail3', 'Mail4', 'Tipo_Mail4', 'Mail5', 'Tipo_Mail5',
                ]));
            }
        }

        return $out;
    }

    /** @return \Generator<int,array<string,string>> */
    private function csvRows(string $path): \Generator
    {
        $h = fopen($path, 'rb');
        if (! $h) {
            throw new InvalidArgumentException("Cannot open $path");
        }
        $head = fgetcsv($h, 0, ',', '"', '');
        if ($head && str_starts_with($head[0], "\xEF\xBB\xBF")) {
            $head[0] = substr($head[0], 3);
        }
        if (! $head || ! in_array('Codice_IPA', $head, true)) {
            fclose($h);
            throw new InvalidArgumentException('Unexpected IPA file: header does not contain Codice_IPA.');
        }
        $n = count($head);
        while (($row = fgetcsv($h, 0, ',', '"', '')) !== false) {
            if ($row === [null]) {
                continue;
            }
            $row = array_pad(array_slice($row, 0, $n), $n, '');
            yield array_combine($head, $row);
        }
        fclose($h);
    }

    // --------------------------------------------------------------- selection

    /** @return array<int,array<string,mixed>> */
    private function aslRecords(array $enti): array
    {
        $out = [];
        foreach ($enti as $code => $e) {
            $cat = $e['Codice_Categoria'] ?? '';
            $isAsl = $cat === 'L7' || ($cat === 'L8' && preg_match('/^\s*ASST\b/i', $e['Denominazione_ente'] ?? ''));
            // Entities in liquidation (e.g. "Liquidazione Coatta Amministrativa Ex U.S.L. ...") are not offices to visit.
            if (! $isAsl || strtoupper(trim($e['Ente_in_liquidazione'] ?? '')) === 'S'
                || preg_match('/liquidazione|liquidatoria/i', $e['Denominazione_ente'] ?? '')) {
                continue;
            }
            $out[] = [
                'category' => 'asl', 'type' => OfficeType::Asl, 'source_id' => $code,
                'name' => $e['Denominazione_ente'], 'address' => $e['Indirizzo'] ?? '', 'cap' => $e['CAP'] ?? '',
                'istat' => $e['Codice_comune_ISTAT'] ?? '', 'phone' => '',
                'pec' => $this->pec($e, 5), 'url' => $e['Sito_istituzionale'] ?? '', 'updated' => $e['Data_aggiornamento'] ?? '',
            ];
        }

        return $out;
    }

    /** @return array<int,array<string,mixed>> */
    private function uoRecords(string $path, array $enti, string $category): array
    {
        $comuniCodes = $category === 'comuni'
            ? array_flip(array_keys(array_filter($enti, fn ($e) => ($e['Codice_Categoria'] ?? '') === 'L6')))
            : [];
        $out = [];
        foreach ($this->csvRows($path) as $u) {
            $ipa = $u['Codice_IPA'];
            $desc = trim(preg_replace('/\s+/', ' ', $u['Descrizione_uo']));
            $type = null;
            if ($category === 'questure' && $ipa === self::POLIZIA_DI_STATO
                && preg_match('/^questura\b/i', $desc) && preg_match('/\b(ufficio\s+immigrazione|polizia\s+per\s+l.?immigrazione)\b/i', $desc)) {
                $type = OfficeType::Questura;
            } elseif ($category === 'prefetture' && $ipa === 'm_it'
                && preg_match('/^prefettura\b/i', $desc) && preg_match('/immigrazione/i', $desc)) {
                $type = OfficeType::Prefettura;
            } elseif ($category === 'comuni' && isset($comuniCodes[$ipa])
                && preg_match('/\b(anagrafe|stato\s+civile|servizi\s+demografici|ufficio\s+demografico)\b/i', $desc)) {
                $type = OfficeType::Anagrafe;
            }
            if (! $type) {
                continue;
            }
            $parent = $enti[$ipa] ?? [];
            $out[] = [
                'category' => $category, 'type' => $type, 'source_id' => $u['Codice_uni_uo'],
                'name' => $desc, 'address' => $u['Indirizzo'], 'cap' => $u['CAP'], 'istat' => $u['Codice_comune_ISTAT'],
                'phone' => $u['Telefono'], 'pec' => $this->pec($u, 3),
                'url' => $u['Url'] !== '' ? $u['Url'] : ($parent['Sito_istituzionale'] ?? ''), 'updated' => $u['Data_aggiornamento'],
            ];
        }

        return $out;
    }

    /** Only the institution's PEC is kept: "Altro" mailboxes are frequently personal. */
    private function pec(array $row, int $max): ?string
    {
        for ($i = 1; $i <= $max; $i++) {
            $mail = trim((string) ($row["Mail$i"] ?? ''));
            if (strcasecmp(trim((string) ($row["Tipo_Mail$i"] ?? '')), 'Pec') === 0 && filter_var($mail, FILTER_VALIDATE_EMAIL)) {
                return mb_strtolower($mail);
            }
        }

        return null;
    }

    // -------------------------------------------------------------- validation

    /** @return array<string,mixed> normalised attributes + translation payload */
    private function validate(array $rec, array &$seen): array
    {
        $sid = trim((string) ($rec['source_id'] ?? ''));
        $name = trim(preg_replace('/\s+/', ' ', (string) ($rec['name'] ?? '')));
        if ($sid === '' || mb_strlen($sid) > 40) {
            throw new InvalidArgumentException('missing or invalid source id');
        }
        if ($name === '' || mb_strlen($name) > 255) {
            throw new InvalidArgumentException('missing or invalid name');
        }
        if (isset($seen[$sid])) {
            throw new InvalidArgumentException('duplicate source id in the file');
        }
        $address = trim(preg_replace('/\s+/', ' ', (string) $rec['address']));
        $istat = preg_match('/^\d{6}$/', (string) $rec['istat']) ? $rec['istat'] : null;
        if ($address === '' && ! $istat) {
            throw new InvalidArgumentException('no address and no municipality');
        }
        $seen[$sid] = true;

        $city = $istat ? ($this->cities[$istat] ?? null) : null;
        $regionCode = $istat ? ($this->regionByIstat[$istat] ?? null) : null;
        $regionId = $regionCode ? ($this->regionIds[$regionCode] ?? null) : ($city['region_id'] ?? null);
        $pec = $rec['pec'];

        return [
            'category' => $rec['category'],
            'source_id' => $sid,
            'office_type' => $rec['type']->value,
            'region_id' => $regionId,
            'city_id' => $city['id'] ?? null,
            'address' => $address !== '' ? mb_substr($address, 0, 255) : null,
            'postal_code' => preg_match('/^\d{5}$/', trim((string) $rec['cap'])) ? trim((string) $rec['cap']) : null,
            'phone' => $this->phone((string) $rec['phone']),
            'email' => $pec,
            'official_url' => $this->url((string) $rec['url']),
            'booking_method' => BookingMethod::Unknown->value,
            'name' => $name,
            'notes' => $pec ? "L'indirizzo e-mail indicato è la PEC (posta elettronica certificata) pubblicata su IndicePA per questa unità." : null,
        ];
    }

    private function phone(string $raw): ?string
    {
        $first = preg_split('/[;,]|\s-\s/', trim($raw))[0] ?? '';
        $digits = preg_replace('/[\s.\-()\/]/', '', $first);

        return preg_match('/^\+?\d{6,15}$/', (string) $digits) ? $digits : null;
    }

    /** https only (PublishGuard requires it): bare hosts and http:// are normalised to https://. */
    private function url(string $raw): ?string
    {
        $v = trim($raw);
        if ($v === '' || preg_match('/\s/', $v)) {
            return null;
        }
        if (! preg_match('#^[a-z][a-z0-9+.-]*://#i', $v)) {
            $v = 'https://'.$v;
        }
        $v = preg_replace('#^http://#i', 'https://', $v);
        $host = parse_url($v, PHP_URL_HOST);
        if (! $host || ! str_contains($host, '.') || ! filter_var($v, FILTER_VALIDATE_URL) || strlen($v) > 2048) {
            return null;
        }

        return $v;
    }

    // ------------------------------------------------------------------ upsert

    private function sourceName(string $category): string
    {
        return in_array($category, ['asl'], true) ? 'IndicePA (AgID) — Enti' : 'IndicePA (AgID) — Unità Organizzative';
    }

    private function sourceUrl(string $category): string
    {
        return $category === 'asl' ? self::ENTI_PAGE : self::UO_PAGE;
    }

    private function predict(array $a): string
    {
        $existing = GovernmentOffice::withTrashed()->where('source_id', $a['source_id'])->first();

        return $existing ? ($this->differs($existing, $a) ? 'updated' : 'unchanged') : 'added';
    }

    private function differs(GovernmentOffice $o, array $a): bool
    {
        foreach (['region_id', 'city_id', 'address', 'postal_code', 'phone', 'email', 'official_url'] as $f) {
            if ($o->{$f} !== $a[$f]) {
                return true;
            }
        }
        $t = $o->translation('it');

        return $o->office_type->value !== $a['office_type']
            || ! $t || $t->name !== $a['name'] || $t->notes !== $a['notes'];
    }

    private function upsert(array $a, \DateTimeInterface $fetchDate): string
    {
        return DB::transaction(function () use ($a, $fetchDate) {
            $o = GovernmentOffice::withTrashed()->where('source_id', $a['source_id'])->first();
            $cols = [
                'office_type' => $a['office_type'], 'region_id' => $a['region_id'], 'city_id' => $a['city_id'],
                'address' => $a['address'], 'postal_code' => $a['postal_code'], 'phone' => $a['phone'], 'email' => $a['email'],
                'official_url' => $a['official_url'],
            ];
            $source = [
                'source_name' => $this->sourceName($a['category']), 'source_url' => $this->sourceUrl($a['category']),
                'source_type' => 'official', 'last_verified_at' => $fetchDate, 'source_license' => self::LICENSE,
            ];

            if (! $o) {
                $o = new GovernmentOffice;
                $o->forceFill($cols + $source + [
                    'slug' => $this->slug($a), 'source_id' => $a['source_id'], 'booking_method' => $a['booking_method'],
                    'sort_order' => 0,
                ] + Lifecycle::attributes());
                $o->save();
                $o->setTranslations(['it' => ['name' => $a['name'], 'notes' => $a['notes']]]);

                return 'added';
            }

            if ($this->differs($o, $a)) {
                $o->forceFill($cols + $source)->save();
                $o->setTranslations(['it' => ['name' => $a['name'], 'notes' => $a['notes']]]);

                return 'updated';
            }

            // Still present in the source: refresh the verification date without churning audit history.
            DB::table('government_offices')->where('id', $o->id)->update(['last_verified_at' => $fetchDate, 'source_license' => self::LICENSE]);

            return 'unchanged';
        });
    }

    private function slug(array $a): string
    {
        $base = Str::slug($a['office_type'].' '.Str::limit($a['name'], 70, ''));
        $slug = Str::limit($base, 100, '').'-'.Str::lower($a['source_id']);

        return Str::limit(Str::slug($slug), 120, '');
    }

    private function linkServices(array &$notes): void
    {
        foreach (self::SERVICE_OFFICE_LINKS as [$serviceSlug, $officeSourceId]) {
            $service = GovernmentService::where('slug', $serviceSlug)->first();
            $office = GovernmentOffice::where('source_id', $officeSourceId)->first();
            if ($service && $office) {
                $service->offices()->syncWithoutDetaching([$office->id]);
            } else {
                $notes[] = "Service/office link skipped ($serviceSlug <-> $officeSourceId): one side is not in the database.";
            }
        }
    }

    // -------------------------------------------------------------------- stale

    /** @param array<int,string> $seenIds */
    private function markStale(array $categories, array $seenIds, bool $dryRun, array &$notes, ?ImportRun $run): int
    {
        $types = [];
        foreach ($categories as $c) {
            $types = array_merge($types, match ($c) {
                'asl' => ['asl'], 'questure' => ['questura'], 'prefetture' => ['prefettura'], 'comuni' => ['anagrafe'],
            });
        }
        $query = GovernmentOffice::query()->where('source_license', self::LICENSE)->whereNotNull('source_id')
            ->whereIn('office_type', $types)->where('status', '!=', 'archived');
        $existing = (clone $query)->count();
        if ($existing === 0) {
            return 0;
        }
        $gone = (clone $query)->whereNotIn('source_id', $seenIds ?: [''])->get(['id', 'source_id']);
        if ($gone->count() > $existing * self::MIN_KEEP_RATIO) {
            $notes[] = "Stale marking skipped: {$gone->count()} of $existing records would be archived (more than ".(int) ((1 - self::MIN_KEEP_RATIO) * 100).'% of the data set is missing; the source looks incomplete).';

            return 0;
        }
        if (! $dryRun) {
            foreach ($gone as $o) {
                GovernmentOffice::whereKey($o->id)->first()?->forceFill(['status' => 'archived'])->save();
            }
            $run?->staleMarked($gone->count());
        }

        return $gone->count();
    }
}
