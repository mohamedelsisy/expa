<?php

namespace App\Domains\Learning\Services;

use App\Domains\Analytics\Analytics;
use App\Domains\Analytics\AnalyticsEvent;
use App\Domains\Learning\Models\ItalianVocabProgress;
use App\Domains\Learning\Models\ItalianVocabulary;
use App\Models\User;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Support\Collection;

/**
 * Simple Leitner spaced repetition. A correct answer moves the card up one box (max 5) and schedules it
 * `leitner_days[box]` days ahead; a wrong answer sends it back to box 1, due tomorrow.
 */
class LeitnerService
{
    public const MAX_BOX = 5;

    public function record(User $user, ItalianVocabulary $vocab, bool $correct): ItalianVocabProgress
    {
        $p = ItalianVocabProgress::where(['user_id' => $user->id, 'italian_vocabulary_id' => $vocab->id])->first();
        if (! $p) {
            try {
                $p = new ItalianVocabProgress(['box' => 1, 'due_at' => now()]);
                $p->user_id = $user->id;
                $p->italian_vocabulary_id = $vocab->id;
                $p->save();
            } catch (UniqueConstraintViolationException) { // parallel first review: use the winner's row
                $p = ItalianVocabProgress::where(['user_id' => $user->id, 'italian_vocabulary_id' => $vocab->id])->firstOrFail();
            }
        }

        $box = $correct ? min(self::MAX_BOX, $p->box + 1) : 1;
        $p->fill([
            'box' => $box,
            'due_at' => now()->addDays((int) config("learning.leitner_days.$box", 1)),
            'last_reviewed_at' => now(),
            'correct_count' => $p->correct_count + ($correct ? 1 : 0),
            'wrong_count' => $p->wrong_count + ($correct ? 0 : 1),
        ])->save();

        app(Analytics::class)->system(AnalyticsEvent::VocabularyPractice);

        return $p;
    }

    /** Cards due now (oldest due first), then brand-new published cards at the learner's level, up to $limit in total. */
    public function queue(User $user, string $level, int $limit): Collection
    {
        $due = ItalianVocabProgress::where('user_id', $user->id)->where('due_at', '<=', now())
            ->whereHas('vocabulary', fn ($q) => $q->published())
            ->orderBy('due_at')->orderBy('id')->limit($limit)->with('vocabulary.translations')->get()
            ->map(fn ($p) => ['vocabulary' => $p->vocabulary, 'box' => $p->box, 'new' => false]);

        $room = $limit - $due->count();
        $newCap = min($room, (int) config('learning.daily_new_cards'));
        $new = collect();
        if ($newCap > 0) {
            $seen = ItalianVocabProgress::where('user_id', $user->id)->pluck('italian_vocabulary_id');
            $levels = $this->levelsFrom($level);
            $new = ItalianVocabulary::published()->whereNotIn('id', $seen)->whereIn('level', $levels)->with('translations')
                ->orderByRaw('case level '.collect($levels)->map(fn ($l, $i) => "when '$l' then $i")->implode(' ').' end')
                ->orderBy('sort_order')->orderBy('id')->limit($newCap)->get()
                ->map(fn ($v) => ['vocabulary' => $v, 'box' => 0, 'new' => true]);
        }

        return $due->concat($new)->values();
    }

    public function dueCount(User $user): int
    {
        return ItalianVocabProgress::where('user_id', $user->id)->where('due_at', '<=', now())
            ->whereHas('vocabulary', fn ($q) => $q->published())->count();
    }

    public function stats(User $user): array
    {
        $boxes = ItalianVocabProgress::where('user_id', $user->id)->selectRaw('box, count(*) as n')->groupBy('box')->pluck('n', 'box');
        $totals = ItalianVocabProgress::where('user_id', $user->id)->selectRaw('sum(correct_count) as c, sum(wrong_count) as w')->first();
        $answered = (int) ($totals->c ?? 0) + (int) ($totals->w ?? 0);

        return [
            'boxes' => collect(range(1, self::MAX_BOX))->map(fn ($b) => ['box' => $b, 'cards' => (int) ($boxes[$b] ?? 0)])->all(),
            'cards_learning' => (int) $boxes->sum(),
            'mastered' => (int) ($boxes[self::MAX_BOX] ?? 0),
            'due_now' => $this->dueCount($user),
            'accuracy' => $answered ? (int) round((int) $totals->c / $answered * 100) : null,
        ];
    }

    /** @return list<string> the learner's level and every level above it (new cards never go below it). */
    private function levelsFrom(string $level): array
    {
        $all = ['a0', 'a1', 'a2', 'b1', 'b2', 'c1'];

        return array_slice($all, (int) array_search($level, $all, true));
    }
}
