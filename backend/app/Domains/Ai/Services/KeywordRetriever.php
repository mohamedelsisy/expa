<?php

namespace App\Domains\Ai\Services;

use App\Domains\Ai\Models\KnowledgeChunk;
use App\Enums\SourceType;
use App\Support\Text\TextNormalizer;
use Illuminate\Support\Collection;

/**
 * Lexical retrieval with multilingual normalization. A vector retriever can replace it behind the same
 * `retrieve()` signature without touching the pipeline.
 */
class KeywordRetriever
{
    public function __construct(private TextNormalizer $normalizer) {}

    /** @return Collection<int,array{chunk:KnowledgeChunk,score:float}> best first */
    public function retrieve(string $query, string $locale): Collection
    {
        $tokens = array_slice($this->normalizer->tokens(mb_substr($query, 0, (int) config('search.ai_query_chars', 300))), 0, (int) config('search.max_tokens', 6));
        if (! $tokens) {
            return collect();
        }

        $fallbacks = config("content.fallbacks.$locale", []);
        $candidates = KnowledgeChunk::query()
            ->whereIn('locale', [$locale, ...$fallbacks])
            ->where(function ($q) use ($tokens) {
                foreach ($tokens as $t) {
                    $q->orWhere('search_text', 'like', '%'.addcslashes($t, '%_\\').'%');
                }
            })
            ->limit(config('ai.retrieval.candidate_limit'))->get();

        $scored = $candidates->map(fn (KnowledgeChunk $c) => ['chunk' => $c, 'score' => $this->score($c, $tokens, $locale)])
            ->filter(fn ($r) => $r['score'] >= config('ai.retrieval.min_score'))
            ->sortByDesc('score')->values();

        // At most N chunks per item so one long guide cannot crowd out everything else.
        $perItem = [];
        $top = $scored->filter(function ($r) use (&$perItem) {
            $key = $r['chunk']->item_type.':'.$r['chunk']->item_id;
            $perItem[$key] = ($perItem[$key] ?? 0) + 1;

            return $perItem[$key] <= config('ai.retrieval.max_chunks_per_item');
        });

        return $top->take(config('ai.retrieval.top_k'))->values();
    }

    private function score(KnowledgeChunk $c, array $queryTokens, string $locale): float
    {
        $titleTokens = $this->normalizer->tokens($c->title);
        $bodyTokens = $this->normalizer->tokens($c->search_text);

        $score = 0.0;
        $matched = 0;
        foreach ($queryTokens as $q) {
            $inTitle = collect($titleTokens)->contains(fn ($t) => $this->normalizer->matches($q, $t));
            $inBody = $inTitle || collect($bodyTokens)->contains(fn ($t) => $this->normalizer->matches($q, $t));
            if ($inBody) {
                $matched++;
                $score += $inTitle ? 3.0 : 1.0;
            }
        }
        if ($matched === 0) {
            return 0.0;
        }

        $score *= 0.5 + 0.5 * ($matched / count($queryTokens)); // reward covering more of the question
        $score *= $c->locale === $locale ? 1.2 : 1.0;
        $score *= $c->source_type === SourceType::Official ? 1.1 : 1.0;
        $score *= match (true) {
            ! $c->last_verified_at => 0.7,
            $c->last_verified_at->diffInDays(now(), true) >= config('content.freshness.outdated_after_days') => 0.7,
            $c->last_verified_at->diffInDays(now(), true) >= config('content.freshness.stale_after_days') => 0.9,
            default => 1.0,
        };

        return round($score, 3);
    }
}
