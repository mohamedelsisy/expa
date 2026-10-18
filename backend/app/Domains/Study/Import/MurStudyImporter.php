<?php

namespace App\Domains\Study\Import;

use App\Domains\DataImport\Support\FetchedSource;
use App\Domains\DataImport\Support\ImportRun;
use App\Domains\DataImport\Support\Lifecycle;
use App\Domains\Geo\Models\City;
use App\Domains\Geo\Models\Region;
use App\Domains\Study\Enums\DegreeLevel;
use App\Domains\Study\Enums\StudyField;
use App\Domains\Study\Models\StudyProgram;
use App\Domains\Study\Models\University;
use App\Enums\ContentStatus;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

/**
 * Imports universities ("Atenei") and degree courses ("Offerta formativa") from the MUR open-data portal
 * (dataset "Metadati", licence IODL 2.0). Only facts present in the source are stored; tuition, deadlines, language
 * levels and course URLs are not published there and stay NULL.
 */
class MurStudyImporter
{
    public const LICENSE = 'IODL-2.0';

    public const LICENSE_URL = 'http://www.dati.gov.it/content/italian-open-data-license-v20';

    public const ATTRIBUTION = 'MUR - Ufficio di Statistica (Ministero dell\'Università e della Ricerca), dati-ustat.mur.gov.it, dataset "Metadati", licenza IODL 2.0';

    public const DATASET_PAGE = 'https://dati-ustat.mur.gov.it/dataset/bed0c71e-9f86-4a0f-a266-963b6f7bbbd2';

    public const ATENEI_PAGE = self::DATASET_PAGE.'/resource/820aefe6-0662-4656-84ec-d8859a2a3b7e';

    public const OFFER_PAGE = self::DATASET_PAGE.'/resource/c0e63906-7190-4568-892b-0cf399f56071';

    public const ATENEI_URL = self::ATENEI_PAGE.'/download/01_atenei.csv';

    public const OFFER_URL = self::OFFER_PAGE.'/download/03_offertaformativa-corsidilaurea_2010-2025.csv';

    private const FIELD_MAP = [
        'Medico-Sanitario e Farmaceutico' => StudyField::Medicine,
        'Scientifico' => StudyField::Sciences,
        "Ingegneria industriale e dell'informazione" => StudyField::Engineering,
        'Economico' => StudyField::Economics,
        'Letterario-Umanistico' => StudyField::Humanities,
        'Architettura e Ingegneria civile' => StudyField::Architecture,
        'Arte e Design' => StudyField::ArtsDesign,
        'Linguistico' => StudyField::Languages,
        'Giuridico' => StudyField::Law,
        'Educazione e Formazione' => StudyField::Education,
        'Informatica e Tecnologie ICT' => StudyField::ComputerScience,
    ];

    // Everything else (Politico-Sociale, Psicologico, Agrario-Forestale e Veterinario, Scienze motorie) -> other.

    private const LEVEL_MAP = [
        'Laurea' => DegreeLevel::Bachelor,
        'Laurea Magistrale' => DegreeLevel::Master,
        'Laurea Magistrale Ciclo Unico' => DegreeLevel::Master,
    ];

    /** ISTAT region codes (= regions.code) by the region name used in the source. */
    private const REGION_CODES = [
        'PIEMONTE' => '01', "VALLE D'AOSTA" => '02', 'LOMBARDIA' => '03', 'PROVINCIA AUTONOMA DI BOLZANO' => '04', 'PROVINCIA AUTONOMA DI TRENTO' => '04',
        'VENETO' => '05', 'FRIULI VENEZIA GIULIA' => '06', 'LIGURIA' => '07', 'EMILIA ROMAGNA' => '08', 'TOSCANA' => '09', 'UMBRIA' => '10',
        'MARCHE' => '11', 'LAZIO' => '12', 'ABRUZZO' => '13', 'MOLISE' => '14', 'CAMPANIA' => '15', 'PUGLIA' => '16', 'BASILICATA' => '17',
        'CALABRIA' => '18', 'SICILIA' => '19', 'SARDEGNA' => '20',
    ];

    private array $regionIds = [];

    private array $cityIdsByName = [];

    private array $seenUniversities = [];

    private array $seenPrograms = [];

    public function __construct(private readonly ImportRun $run, private readonly bool $dryRun = false) {}

    /** Largest ANNO in the offering file (streamed). */
    public static function latestYear(string $offerPath): int
    {
        $max = 0;
        foreach (self::rows($offerPath) as $r) {
            $max = max($max, (int) ($r['ANNO'] ?? 0));
        }

        return $max;
    }

    /**
     * @return array{universities:int,programs:int}
     */
    public function import(string $atenei, string $offer, int $year, FetchedSource|array $meta, ?int $limit = null): array
    {
        $verified = $meta instanceof FetchedSource ? $meta->fetchedAt : now();
        $this->loadGeo();
        $universities = $this->indexAtenei($atenei);

        $usedNames = [];
        foreach (self::rows($offer) as $row) {
            if ((int) ($row['ANNO'] ?? 0) === $year) {
                $usedNames[self::key($row['Ateneo'] ?? '')] = true;
            }
        }

        // 1) universities that have a course in the imported year
        $uniModels = [];
        foreach ($universities as $key => $a) {
            if (! isset($usedNames[$key])) {
                continue;
            }
            $this->run->read();
            $uniModels[$key] = $this->upsertUniversity($a, $verified);
        }
        foreach (array_diff_key($usedNames, $universities) as $key => $_) {
            $this->run->reject('university not found in the Atenei list: '.$key);
        }

        // 2) degree courses
        $n = 0;
        foreach (self::rows($offer) as $row) {
            if ((int) ($row['ANNO'] ?? 0) !== $year) {
                continue;
            }
            if ($limit !== null && $n >= $limit) {
                break;
            }
            $n++;
            $this->run->read();
            $uni = $uniModels[self::key($row['Ateneo'] ?? '')] ?? null;
            if (! $uni) {
                $this->run->reject('course of an unknown university', $row);

                continue;
            }
            $this->upsertProgram($row, $uni, $year, $verified);
        }

        if (! $this->dryRun) {
            $this->bumpVerified($verified);
            if ($limit === null) {
                $this->markStale();
            }
        }

        return ['universities' => count($this->seenUniversities), 'programs' => count($this->seenPrograms)];
    }

    // ---- universities --------------------------------------------------------------------------

    private function indexAtenei(string $path): array
    {
        $out = [];
        foreach (self::rows($path) as $r) {
            $code = trim($r['COD_Ateneo'] ?? '');
            $name = trim($r['NomeEsteso'] ?? '');
            if ($code === '' || $name === '' || trim($r['NomeOperativo'] ?? '') === '') {
                $this->run->reject('Atenei row without code/name', $r);

                continue;
            }
            $out[self::key($r['NomeOperativo'])] = $r;
        }

        return $out;
    }

    private function upsertUniversity(array $a, $verified): ?University
    {
        $sourceId = 'mur-ateneo:'.trim($a['COD_Ateneo']);
        $regionName = strtoupper(trim($a['REGIONE'] ?? ''));
        $regionCode = self::REGION_CODES[$regionName] ?? null;
        $cityId = $this->cityIdsByName[self::key($a['CITTA'] ?? '')] ?? null;
        $statale = strtoupper(trim($a['StataleLibera'] ?? '')) === 'S';
        $address = collect([trim($a['Indirizzo'] ?? ''), trim(self::nice($a['CITTA'] ?? '').(trim($a['PROVINCIA'] ?? '') !== '' ? ' ('.self::nice($a['PROVINCIA']).')' : '')), self::nice($a['REGIONE'] ?? '')])->filter()->implode(', ');

        $attrs = [
            'kind' => $statale ? 'public' : 'private',
            'region_id' => $regionCode ? ($this->regionIds[$regionCode] ?? null) : null,
            'city_id' => $cityId,
            'source_name' => 'MUR - Ufficio di Statistica: Atenei (dataset Metadati)',
            'source_url' => self::ATENEI_PAGE,
            'source_type' => 'official',
            'source_license' => self::LICENSE,
        ];
        $tr = [
            'name' => trim($a['NomeEsteso']),
            'summary' => 'Tipologia: '.trim($a['Descrizione'] ?? '').($statale ? ' (statale)' : ' (non statale)').($address !== '' ? '. Indirizzo: '.$address : '').'.',
            'notes' => null,
        ];

        $this->seenUniversities[$sourceId] = true;

        return $this->upsert(University::class, $sourceId, $attrs, $tr, fn () => Str::slug($a['NomeOperativo']) ?: 'ateneo-'.trim($a['COD_Ateneo']), $verified, 'name');
    }

    // ---- programs ------------------------------------------------------------------------------

    private function upsertProgram(array $r, ?University $uni, int $year, $verified): void
    {
        $name = trim(preg_replace('/\s+/', ' ', $r['Corso'] ?? ''));
        $type = trim($r['TipoCorso'] ?? '');
        $lang = trim($r['LINGUA'] ?? '');
        if ($name === '' || ! isset(self::LEVEL_MAP[$type])) {
            $this->run->reject($name === '' ? 'course without name' : "unsupported course type [$type]", $r);

            return;
        }
        $instruction = self::instructionLanguage($lang);
        if ($instruction === null) {
            $this->run->reject("unsupported language of instruction [$lang]", $r);

            return;
        }

        $classe = trim($r['Classe'] ?? '');
        $comune = trim($r['SedeCorso_Comune'] ?? '');
        $sourceId = 'mur-corso:'.substr(sha1(implode('|', [
            self::key($r['Ateneo']), self::key($name), self::key($classe), self::key($comune), self::key($lang), self::key($r['DIDATTICA'] ?? ''), self::key($r['ACCESSO'] ?? ''),
        ])), 0, 24);
        if (isset($this->seenPrograms[$sourceId])) {
            $this->run->reject('duplicate course row in the source', $r);

            return;
        }
        $this->seenPrograms[$sourceId] = true;

        $group = trim($r['GruppoDisciplinare'] ?? '');
        $attrs = [
            'university_id' => $uni->id,
            'degree_level' => self::LEVEL_MAP[$type]->value,
            'field' => (self::FIELD_MAP[$group] ?? StudyField::Other)->value,
            'instruction_language' => $instruction,
            'source_name' => 'MUR - Ufficio di Statistica: Offerta formativa (dataset Metadati)',
            'source_url' => self::OFFER_PAGE,
            'source_type' => 'official',
            'source_license' => self::LICENSE,
        ];
        $notes = array_filter([
            $lang !== '' ? 'Lingua: '.$lang : null,
            ! empty($r['ACCESSO']) ? 'Accesso: '.trim($r['ACCESSO']) : null,
            ! empty($r['DIDATTICA']) ? 'Didattica: '.trim($r['DIDATTICA']) : null,
            'Anno dell\'offerta formativa: '.$year,
        ]);
        $tr = [
            'title' => $name,
            'summary' => $type.($classe !== '' ? ' - classe '.$classe.(trim($r['NomeClasse'] ?? '') !== '' ? ' ('.trim($r['NomeClasse']).')' : '') : '')
                .($group !== '' ? '. Gruppo disciplinare: '.$group : '')
                .($comune !== '' ? '. Sede del corso: '.self::nice($comune).(trim($r['SedeCorso_Provincia'] ?? '') !== '' ? ' ('.trim($r['SedeCorso_Provincia']).')' : '') : '').'.',
            'admission_requirements' => null,
            'notes' => implode('. ', $notes).'.',
        ];

        $slug = fn () => rtrim(Str::limit(Str::slug($r['Ateneo'].' '.$name.' '.$classe.' '.$comune), 100, ''), '-').'-'.substr(sha1($sourceId), 0, 8);
        $this->upsert(StudyProgram::class, $sourceId, $attrs, $tr, $slug, $verified, 'title');
    }

    // ---- shared upsert -------------------------------------------------------------------------

    /**
     * @param  class-string<University|StudyProgram>  $class
     */
    private function upsert(string $class, string $sourceId, array $attrs, array $tr, \Closure $slug, $verified, string $titleField): ?object
    {
        $existing = $class::query()->with('translations')->where('source_id', $sourceId)->first();

        if ($this->dryRun) {
            $existing ? $this->run->unchanged() : $this->run->added();

            return $existing ?? new $class(['id' => 0] + $attrs);
        }

        return DB::transaction(function () use ($class, $sourceId, $attrs, $tr, $slug, $verified, $existing) {
            if (! $existing) {
                $m = new $class($attrs + ['slug' => $this->uniqueSlug($class, $slug()), 'source_id' => $sourceId, 'last_verified_at' => $verified]);
                $m->forceFill(Lifecycle::attributes())->save();
                $m->setTranslations(['it' => $tr]);
                $this->run->added();

                return $m;
            }

            $changed = false;
            $existing->fill($attrs);
            if ($existing->isDirty()) {
                $changed = true;
                $existing->save();
            }
            $current = $existing->translation('it');
            $diff = $current ? array_filter($tr, fn ($v, $k) => $current->{$k} !== $v, ARRAY_FILTER_USE_BOTH) : $tr;
            if ($diff) {
                $changed = true;
                $existing->setTranslations(['it' => $diff]);
            }
            if ($existing->status === ContentStatus::Archived && ! $existing->trashed()) { // came back in the source: restore through the normal lifecycle
                $existing->forceFill(Lifecycle::attributes())->save();
                $changed = true;
            }
            $changed ? $this->run->updated() : $this->run->unchanged();

            return $existing;
        });
    }

    private function uniqueSlug(string $class, string $base): string
    {
        $base = $base !== '' ? $base : 'item';
        $slug = $base;
        for ($i = 2; $class::withTrashed()->where('slug', $slug)->exists(); $i++) {
            $slug = Str::limit($base, 110, '').'-'.$i;
        }

        return $slug;
    }

    /** Records seen again keep a fresh "last verified" date without touching anything else (and without audit noise). */
    private function bumpVerified($verified): void
    {
        foreach ([[University::class, array_keys($this->seenUniversities)], [StudyProgram::class, array_keys($this->seenPrograms)]] as [$class, $ids]) {
            foreach (array_chunk($ids, 500) as $chunk) {
                $class::withoutEvents(fn () => $class::query()->whereIn('source_id', $chunk)->update(['last_verified_at' => $verified]));
            }
        }
    }

    /** Imported records that are no longer in the source are archived (hidden), never deleted. */
    private function markStale(): void
    {
        foreach ([[University::class, 'mur-ateneo:', $this->seenUniversities], [StudyProgram::class, 'mur-corso:', $this->seenPrograms]] as [$class, $prefix, $seen]) {
            if (! $seen) {
                continue;
            }
            $class::query()->where('source_id', 'like', $prefix.'%')->where('status', '!=', ContentStatus::Archived->value)
                ->select('id', 'source_id')->chunkById(500, function ($rows) use ($class, $seen) {
                    $ids = $rows->filter(fn ($m) => ! isset($seen[$m->source_id]))->pluck('id')->all();
                    if ($ids) {
                        $class::withoutEvents(fn () => $class::query()->whereIn('id', $ids)->update(['status' => ContentStatus::Archived->value]));
                        $this->run->staleMarked(count($ids));
                    }
                });
        }
    }

    // ---- helpers -------------------------------------------------------------------------------

    private function loadGeo(): void
    {
        $this->regionIds = Region::query()->pluck('id', 'code')->all();
        $byName = [];
        foreach (City::query()->with('translations')->get() as $c) {
            $name = $c->translation('it')?->name ?? $c->translations->first()?->name;
            if ($name) {
                $byName[self::key($name)][] = $c->id;
            }
        }
        // only unambiguous names are attached
        $this->cityIdsByName = collect($byName)->filter(fn ($ids) => count($ids) === 1)->map(fn ($ids) => $ids[0])->all();
    }

    public static function instructionLanguage(string $lingua): ?string
    {
        $it = str_contains($lingua, 'Italiano');
        $en = str_contains($lingua, 'Inglese');

        return match (true) {
            $it && $en => 'both',
            $en => 'en',
            $it => 'it',
            default => null,
        };
    }

    /** Normalised comparison key: accents, case and all whitespace removed. */
    public static function key(?string $s): string
    {
        return preg_replace('/[^a-z0-9]+/', '', strtolower(Str::ascii((string) $s)));
    }

    private static function nice(string $s): string
    {
        $s = trim($s);

        return $s !== '' && $s === mb_strtoupper($s) ? mb_convert_case($s, MB_CASE_TITLE) : $s;
    }

    /** Streams CSV rows as header-keyed arrays (UTF-8 or Windows-1252 input, ';' delimiter, optional BOM). */
    public static function rows(string $path): \Generator
    {
        $fh = fopen($path, 'rb');
        $head = null;
        $fix = fn ($v) => mb_check_encoding((string) $v, 'UTF-8') ? (string) $v : mb_convert_encoding((string) $v, 'UTF-8', 'Windows-1252');
        while (($cells = fgetcsv($fh, 0, ';', '"', '')) !== false) {
            if ($cells === [null]) {
                continue;
            }
            $cells = array_map($fix, $cells);
            if ($head === null) {
                $head = array_map(fn ($h) => trim(preg_replace('/^\xEF\xBB\xBF/', '', $h)), $cells);

                continue;
            }
            $cells = array_pad($cells, count($head), '');
            yield array_combine($head, array_slice($cells, 0, count($head)));
        }
        fclose($fh);
    }
}
