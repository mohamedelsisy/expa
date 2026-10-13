<?php

namespace Tests\Feature\DataImport;

use App\Domains\GeoImport\Support\XlsxReader;
use RuntimeException;
use Tests\TestCase;
use ZipArchive;

class XlsxReaderLimitsTest extends TestCase
{
    private array $files = [];

    protected function tearDown(): void
    {
        array_map('is_file', $this->files) && array_map(fn ($f) => @unlink($f), $this->files);
        parent::tearDown();
    }

    /** @param array<string,string> $extra additional archive entries */
    private function xlsx(string $sheetXml = '<worksheet><sheetData><row r="1"><c r="A1" t="inlineStr"><is><t>ok</t></is></c></row></sheetData></worksheet>', array $extra = []): string
    {
        $path = tempnam(sys_get_temp_dir(), 'xlsx').'.xlsx';
        $this->files[] = $path;
        $zip = new ZipArchive;
        $zip->open($path, ZipArchive::CREATE | ZipArchive::OVERWRITE);
        $zip->addFromString('xl/workbook.xml', '<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="S1" sheetId="1" r:id="rId1"/></sheets></workbook>');
        $zip->addFromString('xl/_rels/workbook.xml.rels', '<Relationships><Relationship Id="rId1" Target="worksheets/sheet1.xml"/></Relationships>');
        $zip->addFromString('xl/worksheets/sheet1.xml', $sheetXml);
        foreach ($extra as $name => $content) {
            $zip->addFromString($name, $content);
        }
        $zip->close();

        return $path;
    }

    public function test_a_normal_workbook_is_read_under_the_default_limits(): void
    {
        $r = XlsxReader::firstSheet($this->xlsx());
        $this->assertSame(['sheet' => 'S1', 'rows' => [['A' => 'ok']]], $r);
    }

    public function test_a_part_that_expands_beyond_the_cap_is_refused_before_it_is_parsed(): void
    {
        // ~2 MB of zeros compresses to a few KB: tiny on the wire, large in memory.
        $bomb = '<worksheet><sheetData>'.str_repeat(' ', 2 * 1024 * 1024).'</sheetData></worksheet>';
        $path = $this->xlsx($bomb);
        $this->assertLessThan(20 * 1024, filesize($path), 'fixture must be a small, highly compressed file');

        config(['dataimport.xlsx_max_part_bytes' => 1024 * 1024]);
        $this->expectException(RuntimeException::class);
        $this->expectExceptionMessage('larger than the allowed maximum when decompressed');
        XlsxReader::firstSheet($path);
    }

    public function test_shared_strings_are_bounded_too(): void
    {
        $path = $this->xlsx(extra: ['xl/sharedStrings.xml' => '<sst>'.str_repeat('<si><t>x</t></si>', 100000).'</sst>']);
        config(['dataimport.xlsx_max_part_bytes' => 64 * 1024]);

        $this->expectException(RuntimeException::class);
        $this->expectExceptionMessage('xl/sharedStrings.xml');
        XlsxReader::firstSheet($path);
    }

    public function test_an_archive_with_too_many_entries_is_refused(): void
    {
        $extra = [];
        foreach (range(1, 30) as $i) {
            $extra["junk/$i.txt"] = 'x';
        }
        config(['dataimport.xlsx_max_entries' => 10]);

        $this->expectException(RuntimeException::class);
        $this->expectExceptionMessage('too many entries');
        XlsxReader::firstSheet($this->xlsx(extra: $extra));
    }

    public function test_a_part_exactly_at_the_cap_is_accepted_and_one_byte_more_is_not(): void
    {
        $sheet = '<worksheet><sheetData><row r="1"><c r="A1" t="inlineStr"><is><t>ok</t></is></c></row></sheetData></worksheet>';
        $sheet .= str_repeat(' ', 1000 - strlen($sheet)); // 1000 bytes: larger than the workbook and rels parts
        $path = $this->xlsx($sheet);

        config(['dataimport.xlsx_max_part_bytes' => 1000]);
        $this->assertSame([['A' => 'ok']], XlsxReader::firstSheet($path)['rows']);

        config(['dataimport.xlsx_max_part_bytes' => 999]);
        $this->expectException(RuntimeException::class);
        XlsxReader::firstSheet($path);
    }

    public function test_entities_rich_text_formula_strings_and_a_different_namespace_prefix_are_read_correctly(): void
    {
        $sheet = '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData><row r="1">'
            .'<c r="A1" t="s"><v>0</v></c>'
            .'<c r="B1" t="s"><v>1</v></c>'
            .'<c r="C1" t="inlineStr"><is><t>Rock &amp; Roll &lt;3</t></is></c>'
            .'<c r="D1" t="str"><f>A1&amp;B1</f><v>formula text</v></c>'
            .'<c r="E1"><v>42.5</v></c>'
            .'<c r="F1"/>'
            .'</row></sheetData></worksheet>';
        $shared = '<sst xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">'
            .'<si><t xml:space="preserve">Citt&#224; di Roma</t></si>'
            .'<si><r><t>Rich </t></r><r><rPr><b/></rPr><t>text</t></r><rPh sb="0" eb="1"><t>PHONETIC</t></rPh></si></sst>';
        $path = $this->xlsx($sheet, ['xl/sharedStrings.xml' => $shared]);
        // Same workbook but with the relationships namespace bound to another prefix.
        $zip = new ZipArchive;
        $zip->open($path);
        $zip->addFromString('xl/workbook.xml', '<x:workbook xmlns:x="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:rel="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><x:sheets><x:sheet name="Dati &amp; codici" sheetId="1" rel:id="rId1"/></x:sheets></x:workbook>');
        $zip->close();

        $r = XlsxReader::firstSheet($path);

        $this->assertSame('Dati & codici', $r['sheet']);
        $this->assertSame([['A' => 'Città di Roma', 'B' => 'Rich text', 'C' => 'Rock & Roll <3', 'D' => 'formula text', 'E' => '42.5']], $r['rows']);
    }

    public function test_a_part_with_a_doctype_is_refused(): void
    {
        $sheet = '<?xml version="1.0"?><!DOCTYPE worksheet [<!ENTITY a "aaaaaaaaaa"><!ENTITY b "&a;&a;&a;&a;&a;">]><worksheet><sheetData/></worksheet>';

        $this->expectException(RuntimeException::class);
        $this->expectExceptionMessage('DOCTYPE');
        XlsxReader::firstSheet($this->xlsx($sheet));
    }
}
