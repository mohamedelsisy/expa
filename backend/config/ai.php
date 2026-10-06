<?php

return [
    // fake | anthropic. `fake` is deterministic and needs no credentials (tests, local dev).
    'driver' => env('AI_DRIVER', 'fake'),

    'anthropic' => [
        'api_key' => env('ANTHROPIC_API_KEY'),
        'model' => env('AI_MODEL', 'claude-sonnet-5-5'),
        'base_url' => env('ANTHROPIC_BASE_URL', 'https://api.anthropic.com'),
        'version' => '2023-06-01',
    ],

    // Limits and cost caps (all env-tunable). `daily_token_budget` is a global circuit breaker across all users:
    // when the day's input+output tokens reach it the assistant answers with the degraded fallback until midnight. 0 = off.
    'timeout_seconds' => (int) env('AI_TIMEOUT_SECONDS', 20),
    'retries' => (int) env('AI_RETRIES', 2),
    'retry_sleep_ms' => (int) env('AI_RETRY_SLEEP_MS', 400),
    'max_output_tokens' => (int) env('AI_MAX_OUTPUT_TOKENS', 900),
    'max_input_chars' => (int) env('AI_MAX_INPUT_CHARS', 24000),
    'daily_token_budget' => (int) env('AI_DAILY_TOKEN_BUDGET', 0),
    'max_message_chars' => 1000,
    'history_turns' => 6,

    'retrieval' => [
        'top_k' => 5,
        'candidate_limit' => 300,
        'max_chunks_per_item' => 2,
        'min_score' => 2.0,
    ],

    // Questions per day by plan; plan resolution lives in PlanResolver (subscriptions arrive later).
    'default_plan' => 'free',
    'daily_limits' => ['free' => 10, 'plus' => 100, 'pro' => 300],

    'retention_months' => 12,
];
