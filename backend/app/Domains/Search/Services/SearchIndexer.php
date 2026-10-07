<?php

namespace App\Domains\Search\Services;

use App\Domains\Appointments\Models\AppointmentGuide;
use App\Domains\Articles\Models\Article;
use App\Domains\Geo\Models\CityProfile;
use App\Domains\Government\Models\GovernmentOffice;
use App\Domains\Government\Models\GovernmentService;
use App\Domains\Guides\Models\Guide;
use App\Domains\Jobs\Models\JobListing;
use App\Domains\Learning\Models\ItalianLesson;
use App\Domains\Learning\Models\ItalianVocabulary;
use App\Domains\Legal\Models\LegalDocument;
use App\Domains\Marketplace\Models\ServiceProvider;
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
        Article::class => ['article', 'excerpt', ['body']],
        // City profile: block texts are appended in sync(). Vocabulary: lemma is the Italian term. Legal: public text only.
        CityProfile::class => ['city_profile', 'summary', []],
        ItalianVocabulary::class => ['italian_vocabulary', 'example_gloss', []],
        LegalDocument::class => ['legal_document', 'body', []],
    ];

    public const TYPES = ['guide', 'government_service', 'government_office', 'appointment_guide', 'italian_lesson', 'patente_topic', 'patente_category', 'university', 'study_program', 'scholarship', 'article', 'city_profile', 'italian_vocabulary', 'legal_document', 'provider', 'job'];

    public function __construct(private TextNormalizer $n) {}

    public static function supports(Model $item): bool
    {
        return isset(self::MAP[$item::class]) || $item instanceof JobListing || $item instanceof ServiceProvider;
    }

    public function sync(Model $item): void
    {
        SearchService::invalidate();
        if ($item instanceof JobListing) {
            $this->syncJob($item);

            return;
        }
        if ($item instanceof ServiceProvider) {
            $this->syncProvider($item);

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

        $term = (string) ($item->italian_term ?? $item->lemma ?? '');
        $slug = $item instanceof CityProfile ? $item->city?->slug : $item->slug;
        if (! $slug) {
            return;
        }
        $blocks = $item instanceof CityProfile ? $item->blocks()->with('translations')->get() : collect();
        foreach ($item->translations as $t) {
            $title = (string) $t->{$item->requiredTranslatableFields[0]};
            $blockText = $blocks->map(fn ($b) => ($b->translation($t->locale)?->title ?? '').' '.($b->translation($t->locale)?->body ?? ''))->implode(' ');
            $text = collect([$t->{$summaryField}, $item->example_it ?? null, $blockText, ...array_map(fn ($f) => $t->{$f}, $extra)])->map(fn ($v) => is_array($v) ? json_encode($v, JSON_UNESCAPED_UNICODE) : (string) $v)->filter()->implode(' ');

            SearchDocument::create([
                'type' => $type, 'item_id' => $item->getKey(), 'slug' => $slug, 'locale' => $t->locale,
                'title' => $title, 'summary' => $t->{$summaryField} ? mb_substr(strip_tags((string) $t->{$summaryField}), 0, 300) : null,
                'search_title' => $this->n->normalize("$title $term"),
                'search_text' => $this->n->normalize("$title $term $text"),
                'meta' => array_filter(['category' => $this->category($item), 'italian_term' => $term ?: null]),
            ]);
        }
    }

    private function category(Model $item): ?string
    {
        $c = $item->category ?? null;
        if (is_string($c)) {
            return $c;
        }

        return $c->value ?? ($item->domain->value ?? ($item->office_type->value ?? ($item->level->value ?? null)));
    }

    /** Providers are searchable only while publicly listable (published + unexpired verification); always labelled third party. */
    public function syncProvider(ServiceProvider $p): void
    {
        SearchService::invalidate();
        SearchDocument::where('type', 'provider')->where('item_id', $p->id)->delete();
        if (! ServiceProvider::listable()->whereKey($p->id)->exists()) {
            return;
        }
        $p->unsetRelation('translations');
        foreach ($p->translations as $t) {
            $title = trim($p->display_name.' '.$t->headline);
            SearchDocument::create([
                'type' => 'provider', 'item_id' => $p->id, 'slug' => $p->slug, 'locale' => $t->locale,
                'title' => $p->display_name, 'summary' => $t->headline ? mb_substr(strip_tags((string) $t->headline), 0, 300) : null,
                'search_title' => $this->n->normalize($title),
                'search_text' => $this->n->normalize($title.' '.$t->description),
                'meta' => array_filter(['category' => $p->category->value, 'third_party' => true]),
            ]);
        }
    }

    /** Drop provider documents that are no longer listable (verification expired or revoked). */
    public function pruneProviders(): int
    {
        SearchService::invalidate();

        return SearchDocument::where('type', 'provider')->whereNotIn('item_id', ServiceProvider::listable()->select('id'))->delete();
    }

    public function syncJob(JobListing $job): void
    {
        SearchService::invalidate();
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
        SearchService::invalidate();

        return SearchDocument::where('type', 'job')->whereNotIn('item_id', JobListing::listed()->select('id'))->delete();
    }

    public function rebuildAll(): int
    {
        SearchService::invalidate();
        SearchDocument::query()->delete();
        $n = 0;
        foreach (array_keys(self::MAP) as $class) {
            $class::query()->published()->with('translations')->each(function (Model $item) use (&$n) {
                $this->sync($item);
                $n++;
            });
        }
        ServiceProvider::listable()->with('translations')->each(function (ServiceProvider $p) use (&$n) {
            $this->syncProvider($p);
            $n++;
        });
        JobListing::listed()->each(function (JobListing $j) use (&$n) {
            $this->syncJob($j);
            $n++;
        });

        return $n;
    }
}
