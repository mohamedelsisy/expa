<?php

return [
    // Server-side counters for core product events (signup, login, ai_question, …). Aggregate counts only.
    // Set false to disable them entirely if legal review concludes consent is required.
    'system_events' => env('ANALYTICS_SYSTEM_EVENTS', true),
];
