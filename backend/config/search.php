<?php

return [
    // Anonymous search is a CPU/DB lever (BE-10), so every dimension is bounded.
    'max_tokens' => (int) env('SEARCH_MAX_TOKENS', 6),      // OR-ed LIKE terms per query
    'max_token_length' => 40,                               // longer "words" are cut (a 100-char blob is never a useful term)
    'ai_query_chars' => 300,                                // the assistant retrieves with at most this many characters of the question
    'cache_ttl' => (int) env('SEARCH_CACHE_TTL', 60),       // seconds; 0 disables. Invalidated on every index write via a version key.
    // Candidate retrieval stays portable `LIKE '%term%'` on purpose: the normaliser relies on substring matching (Arabic
    // article/inflection, Italian plurals). MySQL FULLTEXT (word/prefix based, ngram parser absent on MariaDB) would change
    // recall; see docs/DATABASE.md "Search" before switching to an engine such as Meilisearch.
];
