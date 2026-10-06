<?php

namespace Tests\Feature\Ai;

use App\Domains\Ai\Contracts\LlmClient;
use App\Domains\Ai\Services\AiAssistant;
use App\Domains\Ai\Services\AnthropicClient;
use App\Domains\Ai\Services\LlmException;
use App\Models\User;
use GuzzleHttp\Promise\PromiseInterface;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Client\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Monolog\Handler\TestHandler;
use Tests\TestCase;

class AnthropicClientHardeningTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        config(['ai.anthropic.api_key' => 'sk-test', 'ai.retry_sleep_ms' => 0]);
        Cache::flush();
    }

    private function ok(int $in = 10, int $out = 5): PromiseInterface
    {
        return Http::response(['content' => [['type' => 'text', 'text' => 'Answer']], 'usage' => ['input_tokens' => $in, 'output_tokens' => $out]]);
    }

    public function test_model_tokens_and_timeout_come_from_config(): void
    {
        config(['ai.anthropic.model' => 'custom-model-id', 'ai.max_output_tokens' => 321]);
        Http::fake(['*' => $this->ok()]);
        (new AnthropicClient)->complete('S', [['role' => 'user', 'content' => 'q']]);
        Http::assertSent(fn (Request $r) => $r['model'] === 'custom-model-id' && $r['max_tokens'] === 321);
    }

    public function test_transient_failures_are_retried_but_client_errors_are_not(): void
    {
        Http::fake(['*' => Http::sequence()->push([], 503)->push([], 429)->push(['content' => [['type' => 'text', 'text' => 'ok']], 'usage' => []])]);
        $this->assertSame('ok', (new AnthropicClient)->complete('S', [['role' => 'user', 'content' => 'q']])->text);
        Http::assertSentCount(3);
    }

    public function test_client_errors_are_not_retried(): void
    {
        Http::fake(['*' => Http::response(['error' => 'bad request'], 400)]);
        try {
            (new AnthropicClient)->complete('S', [['role' => 'user', 'content' => 'q']]);
            $this->fail('expected exception');
        } catch (LlmException $e) {
            $this->assertSame('LLM provider returned HTTP 400', $e->getMessage());
        }
        Http::assertSentCount(1);
    }

    public function test_persistent_failure_gives_up_after_the_configured_retries(): void
    {
        config(['ai.retries' => 1]);
        Http::fake(['*' => Http::response([], 500)]);
        $this->expectException(LlmException::class);
        try {
            (new AnthropicClient)->complete('S', [['role' => 'user', 'content' => 'q']]);
        } finally {
            Http::assertSentCount(2);
        }
    }

    public function test_connection_failures_become_llm_exceptions_without_the_previous_exception(): void
    {
        Http::fake(fn () => throw new ConnectionException('cURL error 28 while sending SECRET-PROMPT'));
        try {
            (new AnthropicClient)->complete('S', [['role' => 'user', 'content' => 'SECRET-PROMPT']]);
            $this->fail('expected exception');
        } catch (LlmException $e) {
            $this->assertNull($e->getPrevious(), 'the transport exception (and its trace) must not travel to the logger');
            $this->assertStringNotContainsString('SECRET-PROMPT', $e->getMessage());
        }
    }

    public function test_oversized_input_drops_the_oldest_history_but_keeps_the_current_question(): void
    {
        config(['ai.max_input_chars' => 200]);
        Http::fake(['*' => $this->ok()]);
        (new AnthropicClient)->complete('SYS', [
            ['role' => 'user', 'content' => str_repeat('a', 150)], ['role' => 'assistant', 'content' => str_repeat('b', 150)], ['role' => 'user', 'content' => 'current question'],
        ]);
        Http::assertSent(fn (Request $r) => count($r['messages']) === 1 && $r['messages'][0]['content'] === 'current question');
    }

    public function test_the_daily_token_budget_trips_the_circuit_breaker(): void
    {
        config(['ai.daily_token_budget' => 100]);
        Http::fake(['*' => $this->ok(60, 50)]);
        $c = new AnthropicClient;
        $c->complete('S', [['role' => 'user', 'content' => 'q']]); // spends 110 >= 100
        $this->expectException(LlmException::class);
        $this->expectExceptionMessage('budget');
        try {
            $c->complete('S', [['role' => 'user', 'content' => 'q']]);
        } finally {
            Http::assertSentCount(1);
        }
    }

    public function test_a_non_https_base_url_is_refused(): void
    {
        config(['ai.anthropic.base_url' => 'http://evil.example']);
        Http::fake();
        $this->expectException(LlmException::class);
        try {
            (new AnthropicClient)->complete('S', [['role' => 'user', 'content' => 'q']]);
        } finally {
            Http::assertNothingSent();
        }
    }

    public function test_a_provider_outage_degrades_gracefully_refunds_quota_and_logs_no_prompt_or_pii(): void
    {
        // capture everything that is logged
        config(['logging.default' => 'capture', 'logging.channels.capture' => ['driver' => 'monolog', 'handler' => TestHandler::class, 'level' => 'debug']]);
        app('log')->forgetChannel('capture');
        config(['ai.driver' => 'anthropic']);
        $this->app->forgetInstance(LlmClient::class);
        $this->app->forgetInstance(AiAssistant::class);
        Http::fake(['*' => Http::response(['error' => ['message' => 'echo MY-SECRET-QUESTION-9137']], 500)]);

        $user = User::factory()->create(['email' => 'pii-user@example.com', 'name' => 'Pii Person']);
        $this->actingAs($user, 'sanctum');
        $res = $this->postJson('/api/v1/ai/ask', ['message' => 'tell me about pizza MY-SECRET-QUESTION-9137'], ['Accept-Language' => 'en'])->assertOk();

        $res->assertJsonPath('data.message.degraded', true);
        $this->assertStringContainsString("couldn't process", $res->json('data.message.content'));
        $this->assertNotEmpty($res->json('data.message.actions'), 'a traditional search alternative is offered');
        $this->assertSame(10, $res->json('data.usage.remaining'), 'the failed answer does not consume quota');

        /** @var TestHandler $handler */
        $handler = app('log')->channel('capture')->getLogger()->getHandlers()[0];
        $logged = json_encode(array_map(fn ($r) => [(string) $r->message, $r->context, $r->extra], $handler->getRecords()));
        $this->assertNotSame('[]', $logged, 'the failure itself must be reported');
        foreach (['MY-SECRET-QUESTION-9137', 'pii-user@example.com', 'Pii Person', 'sk-test', 'about pizza'] as $needle) {
            $this->assertStringNotContainsString($needle, $logged, "$needle must not reach the logs");
        }
    }
}
