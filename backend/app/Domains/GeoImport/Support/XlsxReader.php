<?php

namespace App\Domains\GeoImport\Support;

use DOMElement;
use RuntimeException;
use XMLReader;
use ZipArchive;

/**
 * Minimal read-only XLSX reader (ZipArchive + XMLReader, no third-party dependency): returns the first worksheet
 * as a list of rows keyed by column letter ('A', 'B', ...). Values are strings (shared/inline/formula strings) or
 * the raw numeric text; empty cells are omitted.
 *
 * The file is untrusted input (a publisher download or --file): the compressed size is already capped by the fetcher,
 * so every part is also bounded after decompression (a small zip can expand a thousandfold) and the archive may only
 * contain a sane number of entries. Limits come from config('dataimport.xlsx_max_part_bytes' / 'xlsx_max_entries').
 * XML is parsed with a real parser (no network, no DTD, no entity substitution); a part with a DOCTYPE is refused.
 */
final class XlsxReader
{
    private const REL_NS = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships';

    /** @return array{sheet:string,rows:list<array<string,string>>} */
    public static function firstSheet(string $path): array
    {
        $zip = new ZipArchive;
        if ($zip->open($path, ZipArchive::RDONLY) !== true) {
            throw new RuntimeException('Not a readable XLSX file.');
        }
        try {
            if ($zip->numFiles > (int) config('dataimport.xlsx_max_entries', 2000)) {
                throw new RuntimeException('XLSX archive has too many entries.');
            }
            [$name, $relId] = self::firstSheetEntry((string) self::part($zip, 'xl/workbook.xml'));
            $target = self::relationshipTarget((string) self::part($zip, 'xl/_rels/workbook.xml.rels'), $relId);
            if ($target === null) {
                throw new RuntimeException('Worksheet relationship not found.');
            }
            $target = ltrim($target, '/');
            $sheetPath = str_starts_with($target, 'xl/') ? $target : 'xl/'.$target;

            $shared = self::sharedStrings($zip);
            $xml = self::part($zip, $sheetPath);
            if ($xml === false) {
                throw new RuntimeException('Worksheet part missing.');
            }

            return ['sheet' => $name, 'rows' => self::rows($xml, $shared)];
        } finally {
            $zip->close();
        }
    }

    /** One archive part, or false when absent. Refuses parts that declare, or turn out to hold, more than the cap. */
    private static function part(ZipArchive $zip, string $name): string|false
    {
        $cap = (int) config('dataimport.xlsx_max_part_bytes', 100 * 1024 * 1024);
        $stat = $zip->statName($name);
        if ($stat === false) {
            return false;
        }
        if ($stat['size'] > $cap) {
            throw new RuntimeException("XLSX part $name is larger than the allowed maximum when decompressed.");
        }
        // The declared size comes from the archive itself and can lie: read at most cap+1 bytes and check what arrived.
        $data = $zip->getFromName($name, $cap + 1);
        if ($data !== false && strlen($data) > $cap) {
            throw new RuntimeException("XLSX part $name is larger than the allowed maximum when decompressed.");
        }
        if ($data !== false && stripos($data, '<!DOCTYPE') !== false) {
            throw new RuntimeException("XLSX part $name contains a DOCTYPE, which a spreadsheet never needs.");
        }

        return $data;
    }

    private static function reader(string $xml): XMLReader
    {
        $r = new XMLReader;
        if (! $r->XML($xml, null, LIBXML_NONET | LIBXML_COMPACT | LIBXML_NOERROR | LIBXML_NOWARNING)) {
            throw new RuntimeException('Malformed XLSX XML.');
        }

        return $r;
    }

    /** @return array{0:string,1:string} sheet name and its relationship id (first sheet in workbook order) */
    private static function firstSheetEntry(string $workbookXml): array
    {
        $r = self::reader($workbookXml);
        try {
            while ($r->read()) {
                if ($r->nodeType === XMLReader::ELEMENT && $r->localName === 'sheet') {
                    $id = $r->getAttributeNs('id', self::REL_NS);
                    if ($id === null || $id === '') {
                        break;
                    }

                    return [(string) $r->getAttribute('name'), $id];
                }
            }
        } finally {
            $r->close();
        }

        throw new RuntimeException('Workbook has no worksheet.');
    }

    private static function relationshipTarget(string $relsXml, string $id): ?string
    {
        $r = self::reader($relsXml);
        try {
            while ($r->read()) {
                if ($r->nodeType === XMLReader::ELEMENT && $r->localName === 'Relationship' && $r->getAttribute('Id') === $id) {
                    return $r->getAttribute('Target');
                }
            }
        } finally {
            $r->close();
        }

        return null;
    }

    /** @return list<string> */
    private static function sharedStrings(ZipArchive $zip): array
    {
        $xml = self::part($zip, 'xl/sharedStrings.xml');
        if ($xml === false) {
            return [];
        }
        $r = self::reader($xml);
        $out = [];
        try {
            while ($r->read()) {
                if ($r->nodeType === XMLReader::ELEMENT && $r->localName === 'si') {
                    $node = $r->expand();
                    $out[] = $node instanceof DOMElement ? self::text($node) : '';
                }
            }
        } finally {
            $r->close();
        }

        return $out;
    }

    /** Text of a string item: plain <t> and rich-text runs <r><t>, but not phonetic guides (<rPh>). */
    private static function text(DOMElement $el): string
    {
        $out = '';
        foreach ($el->childNodes as $child) {
            if (! $child instanceof DOMElement) {
                continue;
            }
            if ($child->localName === 't') {
                $out .= $child->textContent;
            } elseif ($child->localName === 'r' || $child->localName === 'is') {
                $out .= self::text($child);
            }
        }

        return $out;
    }

    /** @return list<array<string,string>> */
    private static function rows(string $xml, array $shared): array
    {
        $r = self::reader($xml);
        $rows = [];
        try {
            while ($r->read()) {
                if ($r->nodeType !== XMLReader::ELEMENT || $r->localName !== 'row') {
                    continue;
                }
                $row = [];
                $node = $r->expand();
                if ($node instanceof DOMElement) {
                    foreach ($node->childNodes as $cell) {
                        if (! $cell instanceof DOMElement || $cell->localName !== 'c') {
                            continue;
                        }
                        if (! preg_match('/^([A-Z]+)\d+$/', $cell->getAttribute('r'), $ref)) {
                            continue;
                        }
                        $value = self::cellValue($cell, $shared);
                        if ($value !== null && $value !== '') {
                            $row[$ref[1]] = $value;
                        }
                    }
                }
                $rows[] = $row;
            }
        } finally {
            $r->close();
        }

        return $rows;
    }

    private static function cellValue(DOMElement $cell, array $shared): ?string
    {
        $type = $cell->getAttribute('t') ?: 'n';
        if ($type === 'inlineStr') {
            foreach ($cell->childNodes as $c) {
                if ($c instanceof DOMElement && $c->localName === 'is') {
                    return self::text($c);
                }
            }

            return null;
        }
        foreach ($cell->childNodes as $c) {
            if ($c instanceof DOMElement && $c->localName === 'v') {
                return $type === 's' ? ($shared[(int) $c->textContent] ?? null) : $c->textContent;
            }
        }

        return null;
    }
}
