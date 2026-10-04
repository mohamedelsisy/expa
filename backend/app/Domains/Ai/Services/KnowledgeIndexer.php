<?php

namespace App\Domains\Ai\Services;

use App\Domains\Ai\Models\KnowledgeChunk;
use App\Domains\Appointments\Models\AppointmentGuide;
use App\Domains\Government\Models\GovernmentOffice;
use App\Domains\Government\Models\GovernmentService;
use App\Domains\Guides\Models\Guide;
use App\Domains\Patente\Models\PatenteCategory;
use App\Domains\Patente\Models\PatenteTopic;
use App\Enums\ContentStatus;
use App\Support\Text\TextNormalizer;
use Illuminate\Database\Eloquent\Model;

/**
 * Builds the retrieval index from PUBLISHED content. Anything that is not published (or has no source)
 * is never in the index, so the assistant cannot quote it. The index is derived data: `expa:ai-reindex`
 * rebuilds it from scratch.
 */
class KnowledgeIndexer
{
    /** model class => [item_type key, sections: translatable field => section key] */
    private const MAP = [
        Guide::class => ['guide', ['summary', 'what_is', 'who_needs', 'required_documents', 'steps', 'where_to_apply', 'how_to_book', 'costs', 'processing_time', 'body']],
        GovernmentService::class => ['government_service', ['summary', 'how_to_apply', 'required_documents', 'notes']],
        GovernmentOffice::class => ['government_office', ['opening_hours', 'notes']],
        AppointmentGuide::class => ['appointment_guide', ['summary', 'steps', 'tips', 'cautions']],
        // Theory text only. Exam questions are deliberately NOT indexed (licensing + would let the assistant leak answers).
        PatenteTopic::class => ['patente_topic', ['summary', 'body']],
        PatenteCategory::class => ['patente_category', ['summary', 'body']],
    ];

    public function __construct(private TextNormalizer $normalizer) {}

    public static function typeKey(Model $item): ?string
    {
        return self::MAP[$item::class][0] ?? null;
    }

    public function sync(Model $item): void
    {
        $type = self::typeKey($item);
        if (! $type) {
            return;
        }

        KnowledgeChunk::where('item_type', $type)->where('item_id', $item->getKey())->delete();

        $item->unsetRelation('translations');
        $live = $item->status === ContentStatus::Published && ! $item->trashed()
            && filled($item->source_name) && str_starts_with((string) $item->source_url, 'https://');
        if (! $live) {
            return;
        }

        foreach ($item->translations as $t) {
            $title = (string) $t->{$item->requiredTranslatableFields[0]};
            foreach ($this->sections($item, $t) as $section => $text) {
                $this->store($item, $type, $t->locale, $section, $title, $text);
            }
        }
    }

    public function rebuildAll(): int
    {
        KnowledgeChunk::query()->delete();
        $n = 0;
        foreach (array_keys(self::MAP) as $class) {
            $class::query()->published()->with('translations')->each(function (Model $item) use (&$n) {
                $this->sync($item);
                $n++;
            });
        }

        return $n;
    }

    /** @return array<string,string> section key => plain text */
    private function sections(Model $item, Model $t): array
    {
        [, $fields] = self::MAP[$item::class];
        $out = [];
        foreach ($fields as $f) {
            $text = $this->flatten($t->{$f});
            if ($text !== '') {
                $out[$f] = $text;
            }
        }

        // Offices: the facts (address, phone, booking) are not translated, so they get their own chunk per locale.
        if ($item instanceof GovernmentOffice) {
            $facts = array_filter([
                $item->address ? "address: {$item->address}" : null,
                $item->postal_code ? "postal code: {$item->postal_code}" : null,
                $item->phone ? "phone: {$item->phone}" : null,
                $item->email ? "email: {$item->email}" : null,
                $item->official_url ? "official website: {$item->official_url}" : null,
                $item->booking_url ? "booking ({$item->booking_method->value}): {$item->booking_url}" : null,
            ]);
            if ($facts) {
                $out['details'] = implode("\n", $facts);
            }
        }

        return $out;
    }

    private function flatten(mixed $value): string
    {
        if (is_array($value)) {
            return trim(collect($value)->map(function ($v) {
                if (is_array($v)) {
                    return '- '.trim(($v['title'] ?? '').(isset($v['text']) && $v['text'] !== '' ? ': '.$v['text'] : ''));
                }

                return '- '.$v;
            })->implode("\n"));
        }

        return trim((string) $value);
    }

    private function store(Model $item, string $type, string $locale, string $section, string $title, string $text): void
    {
        $term = (string) ($item->italian_term ?? '');
        KnowledgeChunk::create([
            'item_type' => $type,
            'item_id' => $item->getKey(),
            'item_slug' => $item->slug,
            'locale' => $locale,
            'section' => $section,
            'title' => $title,
            'content' => $text,
            'search_text' => $this->normalizer->normalize(trim("$title $term $text")),
            'source_name' => $item->source_name,
            'source_url' => $item->source_url,
            'source_type' => $item->source_type->value,
            'last_verified_at' => $item->last_verified_at,
        ]);
    }
}
