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

    'timeout_seconds' => 20,
    'max_output_tokens' => 900,
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
