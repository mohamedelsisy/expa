<?php

return [
    // Maximum pasted text (characters). Longer input is rejected, never silently truncated.
    'max_chars' => (int) env('HOUSING_MAX_CHARS', 12000),
    'min_chars' => 20,

    // Saved results are kept this long (data minimisation); see expa:prune-housing-checks.
    'retention_days' => (int) env('HOUSING_RETENTION_DAYS', 90),
    'max_saved_per_user' => 50,

    // Upper bound accepted for any user-provided monetary field.
    'max_amount' => 100000,
];
