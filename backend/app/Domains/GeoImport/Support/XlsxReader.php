<?php

namespace App\Domains\GeoImport\Support;

use RuntimeException;
use XMLReader;
use ZipArchive;

/**
 * Minimal read-only XLSX reader (ZipArchive + XMLReader, no third-party dependency): returns the first worksheet
 * as a list of rows keyed by column letter ('A', 'B', ...). Values are strings (shared/inline/formula strings) or
 * the raw numeric text; empty cells are omitted.
 */
final class XlsxReader
{
    /** @return array{sheet:string,rows:list<array<string,string>>} */
    public static function firstSheet(string $path): array
    {
        $zip = new ZipArchive;
        if ($zip->open($path, ZipArchive::RDONLY) !== true) {
            throw new RuntimeException('Not a readable XLSX file.');
        }
        try {
            $workbook = (string) $zip->getFromName('xl/workbook.xml');
            if (! preg_match('/<sheet\b[^>]*\bname="([^"]*)"[^>]*\br:id="([^"]+)"/', $workbook, $m)) {
                throw new RuntimeException('Workbook has no worksheet.');
            }
            $name = html_entity_decode($m[1], ENT_QUOTES | ENT_XML1);
            $rels = (string) $zip->getFromName('xl/_rels/workbook.xml.rels');
            $target = null;
            if (preg_match_all('/<Relationship\b[^>]*>/', $rels, $all)) {
                foreach ($all[0] as $rel) {
                    if (str_contains($rel, 'Id="'.$m[2].'"') && preg_match('/Target="([^"]+)"/', $rel, $t)) {
                        $target = ltrim($t[1], '/');
                    }
                }
            }
            if (! $target) {
                throw new RuntimeException('Worksheet relationship not found.');
            }
            $sheetPath = str_starts_with($target, 'xl/') ? $target : 'xl/'.$target;

            $shared = self::sharedStrings($zip);
            $xml = $zip->getFromName($sheetPath);
            if ($xml === false) {
                throw new RuntimeException('Worksheet part missing.');
            }

            return ['sheet' => $name, 'rows' => self::rows($xml, $shared)];
        } finally {
            $zip->close();
        }
    }

    /** @return list<string> */
    private static function sharedStrings(ZipArchive $zip): array
    {
        $xml = $zip->getFromName('xl/sharedStrings.xml');
        if ($xml === false) {
            return [];
        }
        $r = new XMLReader;
        $r->XML($xml, null, LIBXML_NONET | LIBXML_COMPACT);
        $out = [];
        while ($r->read()) {
            if ($r->nodeType === XMLReader::ELEMENT && $r->name === 'si') {
                $out[] = self::collectText($r->readInnerXml());
            }
        }
        $r->close();

        return $out;
    }

    private static function collectText(string $innerXml): string
    {
        preg_match_all('/<t\b[^>]*>(.*?)<\/t>/s', $innerXml, $m);

        return html_entity_decode(implode('', $m[1]), ENT_QUOTES | ENT_XML1, 'UTF-8');
    }

    /** @return list<array<string,string>> */
    private static function rows(string $xml, array $shared): array
    {
        $r = new XMLReader;
        $r->XML($xml, null, LIBXML_NONET | LIBXML_COMPACT);
        $rows = [];
        while ($r->read()) {
            if ($r->nodeType !== XMLReader::ELEMENT || $r->name !== 'row') {
                continue;
            }
            $row = [];
            $rowXml = $r->readOuterXml();
            if (preg_match_all('/<c\b([^>]*?)(?:\/>|>(.*?)<\/c>)/s', $rowXml, $cells, PREG_SET_ORDER)) {
                foreach ($cells as $c) {
                    if (! preg_match('/\br="([A-Z]+)\d+"/', $c[1], $ref)) {
                        continue;
                    }
                    $type = preg_match('/\bt="([^"]+)"/', $c[1], $t) ? $t[1] : 'n';
                    $inner = $c[2] ?? '';
                    $value = null;
                    if ($type === 'inlineStr') {
                        $value = self::collectText($inner);
                    } elseif (preg_match('/<v>(.*?)<\/v>/s', $inner, $v)) {
                        $value = $type === 's' ? ($shared[(int) $v[1]] ?? null) : html_entity_decode($v[1], ENT_QUOTES | ENT_XML1, 'UTF-8');
                    }
                    if ($value !== null && $value !== '') {
                        $row[$ref[1]] = $value;
                    }
                }
            }
            $rows[] = $row;
        }
        $r->close();

        return $rows;
    }
}
