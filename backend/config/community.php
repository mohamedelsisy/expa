<?php

return [
    // Feature flag. false (default): every community endpoint (public, authenticated and admin) answers 404, so launch can
    // defer the community without removing code. Stored data stays covered by export/erasure either way.
    'enabled' => (bool) env('COMMUNITY_ENABLED', false),

    // Who is held for moderation before becoming public: 'all' | 'new_users' (new accounts / few approved posts) | 'none'.
    // Posts containing links are ALWAYS held. 'none' is for later, with a staffed moderation team.
    'premoderation' => env('COMMUNITY_PREMODERATION', 'new_users'),
    'trusted_after_approved_posts' => 3,

    // Accounts younger than moderation.new_account_days: at most this many posts of each kind per hour.
    'new_account_hourly' => ['questions' => 1, 'answers' => 3, 'comments' => 5],

    'limits' => [
        'title' => [10, 200], 'question' => [10, 5000], 'answer' => [10, 5000], 'comment' => [2, 1000],
        'tags_max' => 5,
    ],

    // On account erasure, authored posts are always detached from the account. true also blanks their text.
    'erase_text' => (bool) env('COMMUNITY_ERASE_TEXT', false),

    'topics' => ['immigration', 'documents', 'work', 'study', 'housing', 'healthcare', 'money', 'business', 'family', 'daily_life', 'driving', 'travel', 'legal', 'language', 'other'],
    // Topics where wrong advice is costly: the API adds a stronger "not professional advice" notice.
    'sensitive_topics' => ['immigration', 'legal', 'healthcare', 'money', 'business', 'documents'],
];
