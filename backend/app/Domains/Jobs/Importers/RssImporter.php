<?php

namespace App\Domains\Jobs\Importers;

use App\Domains\Jobs\Models\JobSource;
use App\Domains\Jobs\Services\SafeHttp;
use RuntimeException;

class RssImporter implements JobImporter
{
    public function __construct(private SafeHttp $http) {}

    public function fetch(JobSource $source): array
    {
        $cfg = $source->config ?? [];
        $xml = $this->http->get($cfg['url'] ?? '', $cfg['headers'] ?? []);

        $prev = libxml_use_internal_errors(true);
        // LIBXML_NONET: never fetch network resources; entities are not substituted (no LIBXML_NOENT) → no XXE.
        $doc = simplexml_load_string($xml, \SimpleXMLElement::class, LIBXML_NONET | LIBXML_NOCDATA);
        libxml_use_internal_errors($prev);
        if ($doc === false || ! isset($doc->channel->item)) {
            throw new RuntimeException('Feed is not valid RSS.');
        }

        $items = [];
        foreach ($doc->channel->item as $item) {
            $row = [
                'title' => (string) $item->title, 'link' => (string) $item->link, 'description' => (string) $item->description,
                'pubDate' => (string) $item->pubDate, 'guid' => (string) $item->guid,
                'category' => array_map('strval', iterator_to_array($item->category, false)),
                'author' => (string) $item->author,
            ];
            $items[] = $row;
            if (count($items) >= config('jobs.max_items_per_run')) {
                break;
            }
        }

        return $items;
    }

    public function defaultMap(): array
    {
        return ['external_id' => 'guid', 'title' => 'title', 'company' => 'author', 'description' => 'description', 'apply_url' => 'link', 'published_at' => 'pubDate'];
    }
}
