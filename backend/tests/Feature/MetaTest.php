<?php

namespace Tests\Feature;

use App\Domains\Search\Models\SearchDocument;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MetaTest extends TestCase
{
    use RefreshDatabase;

    public function test_meta_exposes_the_rules_clients_must_not_hard_code(): void
    {
        $d = $this->getJson('/api/v1/meta')->assertOk()->json('data');

        $this->assertSame(['ar', 'en', 'it'], array_column($d['locales'], 'code'));
        $this->assertSame('rtl', $d['locales'][0]['dir']);
        $this->assertSame(10, $d['password']['min_length']);
        $this->assertSame(10.0, (float) $d['uploads']['max_file_mb']);
        $this->assertContains('application/pdf', $d['uploads']['allowed_mimes']);
        $this->assertSame(config('ai.daily_limits'), $d['ai']['daily_limits']);
        $this->assertSame(config('patente.exam.questions'), $d['patente']['exam_questions']);
        $this->assertSame([90, 60, 30, 14, 7], $d['reminders']['default_offsets_days']);
        $this->assertContains('ai_ask', $d['verification_required_for']);
    }

    public function test_meta_is_public_cacheable_and_contains_no_secrets(): void
    {
        $res = $this->getJson('/api/v1/meta')->assertOk();
        $this->assertStringContainsString('max-age=300', $res->headers->get('Cache-Control'));
        foreach (['key', 'secret', 'token', 'password"', 'api_key'] as $leak) {
            $this->assertStringNotContainsStringIgnoringCase('"'.$leak.'"', $res->getContent());
        }
    }

    public function test_password_rule_in_meta_matches_the_rule_the_api_enforces(): void
    {
        $min = $this->getJson('/api/v1/meta')->json('data.password.min_length');
        $base = ['name' => 'Sara', 'email' => 'm@example.com', 'accept_terms' => true, 'accept_privacy' => true];

        $short = str_repeat('a', $min - 2).'1';  // one character short of the advertised minimum
        $this->postJson('/api/v1/auth/register', $base + ['password' => $short, 'password_confirmation' => $short])->assertStatus(422);
        $ok = str_repeat('a', $min - 1).'1';
        $this->postJson('/api/v1/auth/register', $base + ['password' => $ok, 'password_confirmation' => $ok])->assertCreated();
    }

    public function test_ai_usage_reports_when_the_allowance_resets_and_limit_errors_carry_it(): void
    {
        $this->actingAs(User::factory()->create(), 'sanctum');
        $reset = $this->getJson('/api/v1/ai/usage')->json('data.resets_at');
        $this->assertSame(now()->addDay()->startOfDay()->toIso8601String(), $reset);

        config(['ai.daily_limits.free' => 1]);
        $this->postJson('/api/v1/ai/ask', ['message' => 'tell me about pizza'])->assertOk();
        $this->postJson('/api/v1/ai/ask', ['message' => 'tell me about pasta'])->assertStatus(429)->assertJsonPath('error.details.resets_at.0', $reset);
    }

    public function test_search_results_use_null_not_an_empty_array_for_missing_meta(): void
    {
        SearchDocument::create(['type' => 'guide', 'item_id' => 1, 'slug' => 'x', 'locale' => 'ar', 'title' => 'اختبار', 'search_title' => 'اختبار', 'search_text' => 'اختبار']);
        $this->assertNull($this->getJson('/api/v1/search?q='.urlencode('اختبار'), ['Accept-Language' => 'ar'])->json('data.0.meta'));
    }
}
