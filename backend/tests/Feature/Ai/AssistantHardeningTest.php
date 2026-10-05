<?php

namespace Tests\Feature\Ai;

use App\Domains\Ai\Contracts\LlmClient;
use App\Domains\Ai\Services\KnowledgeIndexer;
use App\Domains\Ai\Services\ResponseProcessor;
use App\Domains\Guides\Models\Guide;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AssistantHardeningTest extends TestCase
{
    use RefreshDatabase;

    private function p(string $text, array $urls = ['https://www.poliziadistato.it/permesso'], string $source = ''): string
    {
        return app(ResponseProcessor::class)->process($text, $urls, 1, $source)['text'];
    }

    // ---- emergency & limits -------------------------------------------------------------------

    public function test_an_emergency_is_answered_even_when_the_daily_limit_is_exhausted(): void
    {
        config(['ai.daily_limits.free' => 1]);
        $this->actingAs(User::factory()->create(), 'sanctum');
        $this->postJson('/api/v1/ai/ask', ['message' => 'tell me about pizza'])->assertOk();
        $this->postJson('/api/v1/ai/ask', ['message' => 'tell me about pasta'])->assertStatus(429);

        $res = $this->postJson('/api/v1/ai/ask', ['message' => 'I have chest pain'], ['Accept-Language' => 'en'])->assertOk();
        $this->assertStringContainsString('112', $res->json('data.message.content'));
        $this->assertCount(1, app(LlmClient::class)->calls); // only the first pizza question reached the model
    }

    public function test_asking_requires_a_verified_email(): void
    {
        $this->actingAs(User::factory()->unverified()->create(), 'sanctum');
        $this->postJson('/api/v1/ai/ask', ['message' => 'tell me about pizza'])->assertForbidden()->assertJsonPath('error.code', 'email_not_verified');
        $this->assertCount(0, app(LlmClient::class)->calls);
        $this->getJson('/api/v1/ai/usage')->assertOk(); // read-only endpoints stay available
    }

    public function test_unsourced_answers_always_carry_the_general_disclaimer(): void
    {
        $this->actingAs(User::factory()->create(), 'sanctum');
        $res = $this->postJson('/api/v1/ai/ask', ['message' => 'tell me something interesting about rome'], ['Accept-Language' => 'en'])->assertOk();

        $this->assertNull($res->json('data.message.sources.0'));
        $this->assertStringContainsString('not legal or tax advice', $res->json('data.message.disclaimer'));
    }

    public function test_phrasing_without_the_classic_keywords_still_counts_as_a_sensitive_immigration_question(): void
    {
        $this->actingAs(User::factory()->create(), 'sanctum');
        foreach (['how do I extend my stay in Italy', 'cosa succede se faccio overstay', 'خطر الترحيل'] as $q) {
            $res = $this->postJson('/api/v1/ai/ask', ['message' => $q], ['Accept-Language' => 'en'])->assertOk();
            $this->assertStringContainsString("don't have verified information", $res->json('data.message.content'), $q);
        }
        $this->assertCount(0, app(LlmClient::class)->calls);
    }

    // ---- link / contact stripping -------------------------------------------------------------

    public function test_verified_urls_survive_every_kind_of_trailing_punctuation(): void
    {
        $u = 'https://www.poliziadistato.it/permesso';
        foreach (['.', ',', ';', ')', '،', '؛', '؟', '”', '»', '**', '_', '!'] as $trail) {
            $this->assertSame("see $u$trail", $this->p("see $u$trail"), "trail [$trail]");
        }
        $this->assertSame("**$u**", $this->p("**$u**"));
        $this->assertSame("[official]($u)", $this->p("[official]($u)"));
        $this->assertSame('see www.poliziadistato.it/permesso/', $this->p('see www.poliziadistato.it/permesso/'));
    }

    public function test_unverified_links_in_any_form_are_removed(): void
    {
        $removed = __('ai.link_removed');
        foreach ([
            'https://evil.example.com/x', 'http://evil.example.com', 'www.evil.example.com', 'evil.com/phish', 'questure.poliziadistato.it/fake', 'poliziadistato.it.evil.com',
            'javascript:alert(1)', 'data:text/html;base64,PHNjcmlwdD4=', 'mailto:help@evil.com', 'tel:+390612345678', 'vbscript:x',
        ] as $bad) {
            $out = $this->p("Open $bad now");
            $this->assertStringContainsString($removed, $out, $bad);
            $this->assertStringNotContainsString(explode('/', preg_replace('~^[a-z]+:(//)?~i', '', $bad))[0], str_replace($removed, '', $out), $bad);
        }
    }

    public function test_the_bare_host_of_a_verified_source_is_allowed_but_not_other_paths(): void
    {
        $this->assertSame('Go to poliziadistato.it today', $this->p('Go to poliziadistato.it today'));
        $this->assertStringContainsString(__('ai.link_removed'), $this->p('Go to poliziadistato.it/other-page today'));
    }

    public function test_ordinary_text_with_dots_is_not_mangled(): void
    {
        foreach (['e.g. bring a passport.', 'The fee is 16.00 euro, e.t.c.', 'Ask at the Questura (Milano).', 'Version 2.1 applies from 01.01.2026.', 'Contact: info at example dot it'] as $t) {
            $this->assertSame($t, $this->p($t), $t);
        }
    }

    public function test_phone_numbers_are_only_kept_when_the_sources_contain_them(): void
    {
        $src = "phone: +39 06 1234567\nemail: x";
        $this->assertSame('Call +39 06 1234567 for help', $this->p('Call +39 06 1234567 for help', source: $src));
        $this->assertSame('Call 0612 34567 for help', $this->p('Call 0612 34567 for help', source: $src));   // same digits, different spacing
        $this->assertStringContainsString(__('ai.contact_removed'), $this->p('Call +39 02 9998887 for help', source: $src));
        $this->assertStringContainsString(__('ai.contact_removed'), $this->p('Call 800123456 now'));
        // not phone numbers: dates, amounts, short numbers, years
        $this->assertSame('On 12/03/2026 pay 120.50 euro, form 123.', $this->p('On 12/03/2026 pay 120.50 euro, form 123.'));
        $this->assertSame('Valid 2026-03-12 and 12-03-2026.', $this->p('Valid 2026-03-12 and 12-03-2026.'));
    }

    public function test_citation_markers_are_validated(): void
    {
        $r = app(ResponseProcessor::class)->process('A [1], B [2], C [0], D [99].', ['https://www.poliziadistato.it/x'], 1);
        $this->assertSame('A [1], B , C , D .', $r['text']);
        $this->assertSame([1], $r['cited']);
    }

    public function test_end_to_end_a_hallucinated_phone_and_domain_never_reach_the_user(): void
    {
        $g = Guide::factory()->create(['slug' => 'permesso', 'italian_term' => 'Permesso di soggiorno', 'source_url' => 'https://www.poliziadistato.it/permesso']);
        $g->setTranslations(['en' => ['title' => 'Residence permit renewal', 'summary' => 's', 'what_is' => 'How to renew your residence permit, call the office on 06 1111111']]);
        $g->forceFill(['status' => 'published'])->save();
        app(KnowledgeIndexer::class)->sync($g->fresh());

        $llm = app(LlmClient::class);
        $llm->push('Call 02 9998887 or visit questura-milano-fake.it/apply. The office number is 06 1111111 [1].');
        $this->actingAs(User::factory()->create(), 'sanctum');

        $c = $this->postJson('/api/v1/ai/ask', ['message' => 'How can I renew my residence permit?'], ['Accept-Language' => 'en'])->json('data.message.content');

        $this->assertStringNotContainsString('9998887', $c);
        $this->assertStringNotContainsString('questura-milano-fake', $c);
        $this->assertStringContainsString('06 1111111', $c); // quoted from the verified source: allowed
    }
}
