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
        $zip->addFromString('xl/workbook.xml', '<workbook><sheets><sheet name="S1" sheetId="1" r:id="rId1"/></sheets></workbook>');
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

    public function test_a_part_exactly_at_the_cap_is_accepted(): void
    {
        $sheet = '<worksheet><sheetData><row r="1"><c r="A1" t="inlineStr"><is><t>ok</t></is></c></row></sheetData></worksheet>';
        config(['dataimport.xlsx_max_part_bytes' => strlen($sheet)]);

        $this->assertSame([['A' => 'ok']], XlsxReader::firstSheet($this->xlsx($sheet))['rows']);
    }
}
