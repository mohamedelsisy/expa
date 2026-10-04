<?php

namespace Tests\Support;

use App\Domains\Jobs\Models\JobSource;

trait JobFixtures
{
    protected function source(array $over = []): JobSource
    {
        static $n = 0;
        $n++;

        $guardedState = array_intersect_key($over, array_flip(['last_run_at', 'last_status', 'consecutive_failures']));
        $over = array_diff_key($over, $guardedState);

        $s = new JobSource(array_merge([
            'key' => "src-$n", 'name' => "Source $n", 'driver' => 'json_feed',
            'config' => ['url' => "https://feeds.example.test/jobs-$n.json"],
            'legal_basis' => 'Public feed; terms of use explicitly allow automated reuse (test fixture).',
            'active' => true, 'schedule_hours' => 6,
        ], $over));
        $s->forceFill($guardedState)->save(); // bookkeeping columns are guarded against mass assignment

        return $s;
    }

    /** A valid feed item; override fields per test. */
    protected function item(array $over = []): array
    {
        static $i = 0;
        $i++;

        return array_merge([
            'id' => "ext-$i", 'title' => "Sviluppatore PHP Laravel $i", 'company' => 'Acme Srl', 'location' => 'Milano, Lombardia',
            'description' => '<p>Cerchiamo uno sviluppatore con 3 anni di esperienza in PHP e Laravel. Richiesto italiano B1 e inglese B2. Smart working 3 giorni.</p>',
            'url' => "https://careers.example.test/jobs/$i", 'published_at' => now()->subDays(2)->toIso8601String(),
        ], $over);
    }

    protected function feed(array ...$items): string
    {
        return json_encode($items);
    }
}
