<?php

// Fallback daily allowances by plan key. A plan feature named `<feature>_daily_limit` (edited in the plans table) wins.
return [
    'housing_check' => ['free' => 3, 'plus' => 20, 'pro' => 60],
    'document_explain' => ['free' => 3, 'plus' => 20, 'pro' => 60],
];
