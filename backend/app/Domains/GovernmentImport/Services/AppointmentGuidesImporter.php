<?php

namespace App\Domains\GovernmentImport\Services;

use App\Domains\Appointments\Models\AppointmentGuide;
use App\Domains\Content\Services\PublishGuard;
use App\Domains\DataImport\Support\ImportRun;
use App\Domains\DataImport\Support\Lifecycle;
use App\Domains\GovernmentImport\Content\AppointmentGuideContent;
use Illuminate\Support\Facades\DB;
use InvalidArgumentException;

/**
 * Seeds the authored appointment guides (see AppointmentGuideContent). Idempotent by source_id; local/testing
 * publishes immediately, every other environment enters the review workflow.
 */
class AppointmentGuidesImporter
{
    public const DATASET = 'appointment-guides';

    public function __construct(private readonly PublishGuard $guard) {}

    /** @return array{counts:array<string,int>,problems:array<int,string>} */
    public function run(bool $dryRun = false, ?array $items = null): array
    {
        $items ??= AppointmentGuideContent::all();
        $run = $dryRun ? null : ImportRun::start([
            'dataset' => self::DATASET,
            'source_name' => 'EXPA authored appointment guides (paraphrasing official pages)',
            'source_url' => 'https://www.portaleimmigrazione.it/',
            'license' => AppointmentGuideContent::LICENSE,
            'attribution' => 'Each guide cites its official source page; verified '.AppointmentGuideContent::VERIFIED_AT.'.',
            'source_edition' => AppointmentGuideContent::VERIFIED_AT,
        ]);
        $counts = ['read' => 0, 'added' => 0, 'updated' => 0, 'unchanged' => 0, 'rejected' => 0];
        $problems = [];

        $process = function () use ($items, $dryRun, $run, &$counts, &$problems) {
            foreach ($items as $item) {
                $counts['read']++;
                $run?->read();
                try {
                    $this->assertValid($item);
                } catch (InvalidArgumentException $e) {
                    $counts['rejected']++;
                    $problems[] = ($item['source_id'] ?? '?').': '.$e->getMessage();
                    $run?->reject($e->getMessage(), ['source_id' => $item['source_id'] ?? null]);

                    continue;
                }
                $outcome = $this->upsert($item, $dryRun);
                $counts[$outcome]++;
                $run?->{$outcome}();
            }
        };
        $run ? $run->guard($process) : $process();
        $run?->finish();

        return ['counts' => $counts, 'problems' => $problems];
    }

    /** Offline checks: https only, official hosts, three languages, steps present. */
    public function assertValid(array $item): void
    {
        foreach (['source_id', 'slug', 'office_type', 'booking_method', 'booking_portal_url', 'source_name', 'source_url', 'translations'] as $k) {
            if (blank($item[$k] ?? null)) {
                throw new InvalidArgumentException("missing $k");
            }
        }
        foreach (['source_url', 'booking_portal_url'] as $f) {
            $host = $this->guard->httpsHost($item[$f]);
            if ($host === null || ! $this->guard->isOfficialHost($host)) {
                throw new InvalidArgumentException("$f is not an https URL on an official host: ".$item[$f]);
            }
        }
        foreach (['ar', 'en', 'it'] as $l) {
            $t = $item['translations'][$l] ?? null;
            if (! $t || blank($t['title'] ?? null) || blank($t['summary'] ?? null) || empty($t['steps']) || blank($t['cautions'] ?? null)) {
                throw new InvalidArgumentException("incomplete [$l] translation");
            }
        }
    }

    private function upsert(array $item, bool $dryRun): string
    {
        $cols = [
            'slug' => $item['slug'], 'office_type' => $item['office_type']->value, 'booking_method' => $item['booking_method']->value,
            'booking_portal_url' => $item['booking_portal_url'], 'sort_order' => $item['sort_order'] ?? 0,
            'source_name' => $item['source_name'], 'source_url' => $item['source_url'], 'source_type' => 'official',
            'source_license' => AppointmentGuideContent::LICENSE,
        ];
        $verified = AppointmentGuideContent::VERIFIED_AT;
        $existing = AppointmentGuide::withTrashed()->where('source_id', $item['source_id'])->first();

        if (! $existing) {
            if (! $dryRun) {
                DB::transaction(function () use ($cols, $item, $verified) {
                    $g = new AppointmentGuide;
                    $g->forceFill($cols + ['source_id' => $item['source_id'], 'last_verified_at' => $verified] + Lifecycle::attributes())->save();
                    $g->setTranslations($item['translations']);
                });
            }

            return 'added';
        }

        $changed = $existing->last_verified_at?->toDateString() !== $verified;
        foreach (['slug', 'office_type', 'booking_method', 'booking_portal_url', 'sort_order', 'source_name', 'source_url'] as $f) {
            $cur = $existing->{$f};
            $changed = $changed || (is_object($cur) ? $cur->value : $cur) !== $cols[$f];
        }
        foreach ($item['translations'] as $locale => $fields) {
            $t = $existing->translation($locale);
            foreach ($fields as $f => $v) {
                $changed = $changed || ! $t || $t->{$f} != $v;
            }
        }
        if (! $changed) {
            return 'unchanged';
        }
        if (! $dryRun) {
            DB::transaction(function () use ($existing, $cols, $item, $verified) {
                $existing->forceFill($cols + ['last_verified_at' => $verified])->save();
                $existing->setTranslations($item['translations']);
            });
        }

        return 'updated';
    }
}
