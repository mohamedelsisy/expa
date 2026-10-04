<?php

namespace App\Domains\Jobs\Services;

use App\Domains\Jobs\Enums\EmploymentType;
use App\Domains\Jobs\Enums\RemoteMode;
use App\Domains\Jobs\Models\JobSource;
use Illuminate\Support\Arr;
use Illuminate\Support\Carbon;
use Throwable;

/** Maps a raw source item onto the canonical job shape using the driver's default map + the source's own overrides. */
class JobNormalizer
{
    public function normalize(array $raw, JobSource $source, array $defaultMap): array
    {
        $cfg = $source->config ?? [];
        $map = array_merge($defaultMap, $cfg['map'] ?? []);
        $get = fn (string $field) => isset($map[$field]) ? Arr::get($raw, $map[$field]) : null;
        $str = fn ($v) => is_scalar($v) ? trim((string) $v) : null;

        $company = $str($get('company')) ?: ($cfg['company_default'] ?? null);

        return [
            'external_id' => $str($get('external_id')) ?: ($str($get('apply_url')) ?: null),
            'title' => $this->text($get('title')),
            'company' => $this->text($company),
            'location_text' => $this->text($get('location_text')),
            'description' => $this->text($get('description'), multiline: true),
            'apply_url' => $str($get('apply_url')),
            'published_at' => $this->date($get('published_at')),
            'expires_at' => $this->date($get('expires_at')),
            'employment_type' => EmploymentType::tryFrom((string) $get('employment_type'))?->value,
            'remote_mode' => RemoteMode::tryFrom(strtolower((string) $get('remote_mode')))?->value
                ?? (filter_var($get('remote_mode'), FILTER_VALIDATE_BOOLEAN) ? 'remote' : null),
            'salary_min' => $this->int($get('salary_min')),
            'salary_max' => $this->int($get('salary_max')),
            'salary_currency' => $this->upper($get('salary_currency'), 3),
            'salary_period' => in_array($get('salary_period'), ['year', 'month', 'hour'], true) ? $get('salary_period') : null,
            // Sponsorship is true ONLY when the source's structured data says so; it is never inferred from text.
            'visa_sponsorship_stated' => $get('visa_sponsorship') === true || $get('visa_sponsorship') === 'yes' || $get('visa_sponsorship') === 1,
        ];
    }

    private function text(mixed $v, bool $multiline = false): ?string
    {
        if (! is_scalar($v)) {
            return null;
        }
        $s = (string) $v;
        // Feeds routinely entity-encode markup (&lt;img onerror=…&gt;). Decode and strip repeatedly until nothing
        // changes, so encoded tags can never survive as live markup after the final decode.
        for ($i = 0; $i < 4; $i++) {
            $prev = $s;
            $s = html_entity_decode(strip_tags(preg_replace('#<(br|/p|/li|/div)\s*/?>#i', "\n", $s)), ENT_QUOTES | ENT_HTML5, 'UTF-8');
            if ($s === $prev) {
                break;
            }
        }
        $s = preg_replace('/<\s*\/?\s*[a-z!][^>]*>?/i', '', $s) ?? $s; // leftover unterminated tags
        $s = preg_replace('/[ \t]+/', ' ', $s) ?? $s;
        $s = $multiline ? preg_replace("/\n{3,}/", "\n\n", $s) : preg_replace('/\s+/', ' ', $s);
        $s = trim((string) $s);

        return $s === '' ? null : $s;
    }

    private function date(mixed $v): ?Carbon
    {
        if (! is_scalar($v) || trim((string) $v) === '') {
            return null;
        }
        try {
            return Carbon::parse((string) $v);
        } catch (Throwable) {
            return null;
        }
    }

    private function int(mixed $v): ?int
    {
        return is_numeric($v) && $v >= 0 ? (int) $v : null;
    }

    private function upper(mixed $v, int $len): ?string
    {
        return is_string($v) && strlen(trim($v)) === $len ? strtoupper(trim($v)) : null;
    }
}
