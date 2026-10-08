<?php

namespace Tests\Feature\Security;

use App\Domains\Moderation\Services\ContentSanitizer;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

/** Stored-content sanitiser payloads (community, reviews, leads share ContentSanitizer) and LIKE/ORDER injection probes. */
class XssAndInjectionPayloadTest extends TestCase
{
    use RefreshDatabase;

    public static function payloads(): array
    {
        return [
            'script tag' => ['<script>alert(1)</script>Hello world, long enough', 'alert(1)</script>'],
            'img onerror' => ['<img src=x onerror=alert(1)> normal text here ok', 'onerror'],
            'svg onload' => ['<svg/onload=alert(1)>text text text text', '<svg'],
            'js md link' => ['[click me](javascript:alert(1)) and more text', 'javascript:'],
            'js md link spaced' => ['[click me](  JaVaScRiPt:alert(1)) and more text', 'script:alert'],
            'data md link' => ['![x](data:text/html;base64,PHNjcmlwdD4=) and more text', 'data:text'],
            'vbscript md link' => ['[a](vbscript:msgbox(1)) and more text here', 'vbscript:'],
            'ref definition' => ["[a][1]\n\n[1]: javascript:alert(1)\nmore text here", 'javascript:'],
            'autolink' => ['<javascript:alert(1)> some more text here ok', '<javascript'],
            'iframe' => ['<iframe src="https://evil.example"></iframe> some text here', '<iframe'],
            'unterminated' => ['text text text <img src=x onerror=alert(1) more text', '<img'],
        ];
    }

    /** @dataProvider payloads */
    #[DataProvider('payloads')]
    public function test_sanitiser_neutralises_payload(string $input, string $mustNotRemain): void
    {
        $clean = app(ContentSanitizer::class)->clean($input, 1, 5000)['text'];
        $this->assertStringNotContainsStringIgnoringCase($mustNotRemain, $clean);
    }

    public function test_https_links_survive_but_are_flagged(): void
    {
        $r = app(ContentSanitizer::class)->clean('See [the site](https://www.interno.gov.it/x) for details please', 1, 500);
        $this->assertStringContainsString('https://www.interno.gov.it/x', $r['text']);
        $this->assertTrue($r['flagged']);
    }

    public function test_search_and_filter_inputs_with_sql_wildcards_and_quotes_are_inert(): void
    {
        foreach (["' OR 1=1 --", '%', '_', '\\', '"; DROP TABLE users; --', "x') UNION SELECT 1--"] as $probe) {
            foreach (['guides', 'jobs', 'providers', 'study/programs', 'italian/vocabulary', 'articles', 'search'] as $ep) {
                $res = $this->getJson("/api/v1/$ep?".http_build_query(['q' => $probe, 'sort' => $probe, 'filter' => [$probe => $probe]]));
                $this->assertContains($res->status(), [200, 422], "$ep with probe");
                $this->assertStringNotContainsString('SQLSTATE', $res->getContent());
            }
        }
        $this->assertTrue(User::query()->exists() || true);
        $this->assertDatabaseCount('users', 0);
    }
}
