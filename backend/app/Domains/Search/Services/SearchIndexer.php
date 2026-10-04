<?php

namespace App\Domains\Search\Services;

use App\Domains\Appointments\Models\AppointmentGuide;
use App\Domains\Government\Models\GovernmentOffice;
use App\Domains\Government\Models\GovernmentService;
use App\Domains\Guides\Models\Guide;
use App\Domains\Jobs\Models\JobListing;
use App\Domains\Learning\Models\ItalianLesson;
use App\Domains\Patente\Models\PatenteCategory;
use App\Domains\Patente\Models\PatenteTopic;
use App\Domains\Search\Models\SearchDocument;
use App\Domains\Study\Models\Scholarship;
use App\Domains\Study\Models\StudyProgram;
use App\Domains\Study\Models\University;
use App\Enums\ContentStatus;
use App\Support\Text\TextNormalizer;
use Illuminate\Database\Eloquent\Model;

/**
 * Keeps `search_documents` equal to "what is publicly visible": a document exists only while its item is
 * published (jobs: listed). Lifecycle content is indexed per translation; jobs are language-neutral.
 */
class SearchIndexer
{
    /** model class => [type key, summary field, extra text fields] */
    private const MAP = [
        Guide::class => ['guide', 'summary', ['what_is', 'who_needs', 'where_to_apply', 'how_to_book']],
        GovernmentService::class => ['government_service', 'summary', ['how_to_apply', 'notes']],
        GovernmentOffice::class => ['government_office', 'notes', ['opening_hours']],
        AppointmentGuide::class => ['appointment_guide', 'summary', ['tips', 'cautions']],
        ItalianLesson::class => ['italian_lesson', 'summary', ['body']],
        PatenteTopic::class => ['patente_topic', 'summary', ['body']],
        PatenteCategory::class => ['patente_category', 'summary', ['body']],
        University::class => ['university', 'summary', ['notes']],
        StudyProgram::class => ['study_program', 'summary', ['admission_requirements', 'notes']],
        Scholarship::class => ['scholarship', 'summary', ['eligibility', 'how_to_apply']],
    ];

    public const TYPES = ['guide', 'government_service', 'government_office', 'appointment_guide', 'italian_lesson', 'patente_topic', 'patente_category', 'university', 'study_program', 'scholarship', 'job'];

    public function __construct(private TextNormalizer $n) {}

    public static function supports(Model $item): bool
    {
        return isset(self::MAP[$item::class]) || $item instanceof JobListing;
    }

    public function sync(Model $item): void
    {
        if ($item instanceof JobListing) {
            $this->syncJob($item);

            return;
        }
        [$type, $summaryField, $extra] = self::MAP[$item::class] ?? [null, null, null];
        if (! $type) {
            return;
        }

        SearchDocument::where('type', $type)->where('item_id', $item->getKey())->delete();
        $item->unsetRelation('translations');
        if ($item->status !== ContentStatus::Published || $item->trashed()) {
            return;
        }

        $term = (string) ($item->italian_term ?? '');
        foreach ($item->translations as $t) {
            $title = (string) $t->{$item->requiredTranslatableFields[0]};
            $text = collect([$t->{$summaryField}, ...array_map(fn ($f) => $t->{$f}, $extra)])->map(fn ($v) => is_array($v) ? json_encode($v, JSON_UNESCAPED_UNICODE) : (string) $v)->filter()->implode(' ');

            SearchDocument::create([
                'type' => $type, 'item_id' => $item->getKey(), 'slug' => $item->slug, 'locale' => $t->locale,
                'title' => $title, 'summary' => $t->{$summaryField} ? mb_substr(strip_tags((string) $t->{$summaryField}), 0, 300) : null,
                'search_title' => $this->n->normalize("$title $term"),
                'search_text' => $this->n->normalize("$title $term $text"),
                'meta' => array_filter(['category' => $item->category->value ?? ($item->domain->value ?? ($item->office_type->value ?? ($item->level->value ?? null))), 'italian_term' => $term ?: null]),
            ]);
        }
    }

    public function syncJob(JobListing $job): void
    {
        SearchDocument::where('type', 'job')->where('item_id', $job->id)->delete();
        $listed = $job->status === 'published' && (! $job->expires_at || $job->expires_at->isFuture());
        if (! $listed) {
            return;
        }

        SearchDocument::create([
            'type' => 'job', 'item_id' => $job->id, 'slug' => null, 'locale' => null,
            'title' => $job->title, 'summary' => $job->company.($job->location_text ? ' — '.$job->location_text : ''),
            'search_title' => $this->n->normalize($job->title.' '.$job->company),
            'search_text' => $this->n->normalize(implode(' ', [$job->title, $job->company, (string) $job->location_text, implode(' ', $job->skills ?? []), mb_substr($job->description, 0, 1500)])),
            'meta' => ['category' => $job->category, 'company' => $job->company, 'remote_mode' => $job->remote_mode->value],
        ]);
    }

    /** Drop job documents whose listing is no longer public (called after expiry runs). */
    public function pruneJobs(): int
    {
        return SearchDocument::where('type', 'job')->whereNotIn('item_id', JobListing::listed()->select('id'))->delete();
    }

    public function rebuildAll(): int
    {
        SearchDocument::query()->delete();
        $n = 0;
        foreach (array_keys(self::MAP) as $class) {
            $class::query()->published()->with('translations')->each(function (Model $item) use (&$n) {
                $this->sync($item);
                $n++;
            });
        }
        JobListing::listed()->each(function (JobListing $j) use (&$n) {
            $this->syncJob($j);
            $n++;
        });

        return $n;
    }
}
