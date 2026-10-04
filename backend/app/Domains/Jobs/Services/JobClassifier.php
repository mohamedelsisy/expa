<?php

namespace App\Domains\Jobs\Services;

use App\Domains\Geo\Models\City;
use App\Support\Text\TextNormalizer;

class JobClassifier
{
    /** @var array<string,int>|null normalized city name => id */
    private ?array $cities = null;

    public function __construct(private TextNormalizer $n) {}

    public function category(array $job): string
    {
        $title = $this->n->normalize($job['title'] ?? '');
        $text = $title.' '.$this->n->normalize(mb_substr($job['description'] ?? '', 0, 600));
        $best = ['other', 0];

        foreach (config('jobs.categories') as $cat => $words) {
            $score = 0;
            foreach ($words as $w) {
                $w = $this->n->normalize($w);
                $score += (str_contains($title, $w) ? 3 : 0) + (str_contains($text, $w) ? 1 : 0);
            }
            if ($score > $best[1]) {
                $best = [$cat, $score];
            }
        }

        return $best[0];
    }

    /** Links the free-text location to a known city when a city name appears in it (ar/en/it names). */
    public function cityId(?string $location): ?int
    {
        if (! $location) {
            return null;
        }
        $this->cities ??= City::with('translations')->get()->flatMap(
            fn ($c) => $c->translations->mapWithKeys(fn ($t) => [$this->n->normalize($t->name) => $c->id])
        )->all();

        $loc = $this->n->normalize($location);
        foreach ($this->cities as $name => $id) {
            if (preg_match('/(^|[^\p{L}])'.preg_quote($name, '/').'($|[^\p{L}])/u', $loc)) {
                return $id;
            }
        }

        return null;
    }
}
