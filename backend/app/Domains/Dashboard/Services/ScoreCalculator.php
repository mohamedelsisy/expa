<?php

namespace App\Domains\Dashboard\Services;

/**
 * EXPA Score. Deliberately simple and explainable:
 *   category % = done ÷ applicable steps in that category (steps the user marked "not applicable" are excluded)
 *   overall %  = weighted mean of categories that have at least one applicable step
 * Steps are self-reported; the score is a guide, not an official status.
 */
class ScoreCalculator
{
    /** @param  array<string,array>  $tasks  output of SetupCatalog::forUser */
    public function calculate(array $tasks): array
    {
        $weights = config('setup.categories');
        $categories = [];

        foreach ($weights as $key => $weight) {
            $applicable = array_filter($tasks, fn ($t) => $t['category'] === $key && $t['applicable']);
            $total = count($applicable);
            $done = count(array_filter($applicable, fn ($t) => $t['status'] === 'done'));

            $categories[] = [
                'key' => $key,
                'weight' => $weight,
                'done' => $done,
                'total' => $total,
                'percent' => $total ? (int) round($done / $total * 100) : null,
            ];
        }

        $scored = array_filter($categories, fn ($c) => $c['total'] > 0);
        $weightSum = array_sum(array_column($scored, 'weight'));
        $overall = $weightSum
            ? (int) round(array_sum(array_map(fn ($c) => $c['percent'] * $c['weight'], $scored)) / $weightSum)
            : null;

        return [
            'overall' => $overall,
            'applicable_tasks' => array_sum(array_column($categories, 'total')),
            'done_tasks' => array_sum(array_column($categories, 'done')),
            'categories' => array_map(fn ($c) => [
                'key' => $c['key'],
                'label' => __('setup.categories.'.$c['key']),
                'done' => $c['done'],
                'total' => $c['total'],
                'percent' => $c['percent'],
            ], $categories),
        ];
    }
}
