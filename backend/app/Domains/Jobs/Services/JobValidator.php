<?php

namespace App\Domains\Jobs\Services;

class JobValidator
{
    /** @return string|null machine reason when the job must be rejected */
    public function reject(array $job): ?string
    {
        foreach (['external_id', 'title', 'company', 'description', 'apply_url', 'published_at'] as $f) {
            if (blank($job[$f] ?? null)) {
                return "missing_$f";
            }
        }
        $p = parse_url($job['apply_url']);
        if (! $p || ($p['scheme'] ?? '') !== 'https' || empty($p['host']) || isset($p['user'])) {
            return 'invalid_apply_url';
        }
        if (mb_strlen($job['title']) > 300 || mb_strlen($job['company']) > 200) {
            return 'field_too_long';
        }
        if (mb_strlen($job['description']) < 30) {
            return 'description_too_short';
        }
        if ($job['published_at']->isFuture()) {
            return 'published_in_future';
        }
        if ($job['expires_at'] && $job['expires_at']->lte($job['published_at'])) {
            return 'expires_before_published';
        }
        if ($job['expires_at'] && $job['expires_at']->isPast()) {
            return 'already_expired';
        }
        if (($job['salary_min'] ?? null) && ($job['salary_max'] ?? null) && $job['salary_max'] < $job['salary_min']) {
            return 'invalid_salary_range';
        }

        return null;
    }
}
