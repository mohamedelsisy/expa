<?php

namespace App\Domains\Search\Services;

use App\Domains\Search\Models\SearchDocument;
use App\Support\Text\TextNormalizer;
use Illuminate\Support\Collection;

class SearchService
{
    /** type => route prefix the client opens */
    private const ROUTES = [
        'guide' => 'guides', 'government_service' => 'government/services', 'government_office' => 'government/offices',
        'appointment_guide' => 'appointments/guides', 'italian_lesson' => 'learn-italian/lessons', 'patente_topic' => 'patente/topics',
        'patente_category' => 'patente/categories', 'university' => 'study/universities', 'study_program' => 'study/programs',
        'scholarship' => 'study/scholarships', 'job' => 'jobs',
    ];

    /** Light relevance nudge per type (official guidance first, jobs last). */
    private const TYPE_WEIGHT = ['guide' => 1.15, 'government_service' => 1.1, 'appointment_guide' => 1.05, 'government_office' => 1.0, 'patente_topic' => 1.0, 'patente_category' => 1.0, 'italian_lesson' => 0.95, 'study_program' => 1.0, 'university' => 1.0, 'scholarship' => 1.0, 'job' => 0.9];

    public function __construct(private TextNormalizer $n) {}

    /**
     * @param  list<string>  $types  empty = all
     * @return array{results:Collection,facets:array<string,int>,total:int}
     */
    public function search(string $query, string $locale, array $types = []): array
    {
        $tokens = $this->n->tokens($query);
        if (! $tokens) {
            return ['results' => collect(), 'facets' => [], 'total' => 0];
        }
        $phrase = $this->n->normalize($query);
        $fallbacks = config("content.fallbacks.$locale", []);

        $candidates = SearchDocument::query()
            ->when($types, fn ($q) => $q->whereIn('type', $types))
            ->where(fn ($q) => $q->whereNull('locale')->orWhereIn('locale', [$locale, ...$fallbacks]))
            ->where(function ($q) use ($tokens) {
                foreach (array_slice($tokens, 0, 8) as $t) {
                    $q->orWhere('search_text', 'like', '%'.addcslashes($t, '%_\\').'%');
                }
            })
            ->limit(600)->get();

        // One result per item: the best language version (requested locale first, then the fallback order).
        $order = array_flip([$locale, ...$fallbacks]);
        $best = $candidates->groupBy(fn ($d) => $d->type.':'.$d->item_id)->map(
            fn ($docs) => $docs->sortBy(fn ($d) => $d->locale === null ? -1 : ($order[$d->locale] ?? 99))->first()
        );

        $scored = $best->map(fn ($d) => ['doc' => $d, 'score' => $this->score($d, $tokens, $phrase, $locale)])
            ->filter(fn ($r) => $r['score'] > 0)->sortByDesc('score')->values();

        return [
            'results' => $scored,
            'facets' => $scored->groupBy('doc.type')->map->count()->all(),
            'total' => $scored->count(),
        ];
    }

    /** @return list<array{title:string,type:string}> */
    public function suggest(string $query, string $locale): array
    {
        $norm = $this->n->normalize($query);
        if (mb_strlen($norm) < 2) {
            return [];
        }
        $fallbacks = config("content.fallbacks.$locale", []);

        return SearchDocument::where('search_title', 'like', addcslashes($norm, '%_\\').'%')
            ->where(fn ($q) => $q->whereNull('locale')->orWhereIn('locale', [$locale, ...$fallbacks]))
            ->orderBy('search_title')->limit(30)->get()->unique('title')->take(8)
            ->map(fn ($d) => ['title' => $d->title, 'type' => $d->type])->values()->all();
    }

    public function route(SearchDocument $d): string
    {
        return self::ROUTES[$d->type].'/'.($d->type === 'job' ? $d->item_id : $d->slug);
    }

    public function snippet(SearchDocument $d, array $tokens): ?string
    {
        $text = (string) $d->summary;

        return $text !== '' ? mb_substr(strip_tags($text), 0, 160) : null;
    }

    private function score(SearchDocument $d, array $tokens, string $phrase, string $locale): float
    {
        $titleTokens = $this->n->tokens($d->search_title);
        $bodyTokens = $this->n->tokens($d->search_text);
        $score = 0.0;
        $matched = 0;

        foreach ($tokens as $q) {
            $inTitle = collect($titleTokens)->contains(fn ($t) => $this->n->matches($q, $t));
            $inBody = $inTitle || collect($bodyTokens)->contains(fn ($t) => $this->n->matches($q, $t));
            if ($inBody) {
                $matched++;
                $score += $inTitle ? 4.0 : 1.0;
            }
        }
        if ($matched === 0) {
            return 0.0;
        }

        $score *= 0.4 + 0.6 * ($matched / count($tokens));
        if (str_contains($d->search_title, $phrase)) {
            $score *= 1.5; // the whole query appears in the title
        }
        if ($d->locale === $locale) {
            $score *= 1.1;
        }

        return round($score * (self::TYPE_WEIGHT[$d->type] ?? 1.0), 3);
    }
}
