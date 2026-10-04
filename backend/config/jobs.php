<?php

return [
    // Run an active source when its last run is older than its own `schedule_hours` (default 6).
    'default_schedule_hours' => 6,
    // Deactivate a source and alert admins after this many consecutive failed runs (final queue attempts).
    'max_consecutive_failures' => 3,
    'http' => ['timeout' => 15, 'max_bytes' => 5 * 1024 * 1024, 'user_agent' => 'EXPA-JobImporter/1.0 (+contact via site)'],
    // Resolve the host and refuse private/loopback addresses (SSRF). Disabled in tests (no DNS).
    'ssrf_dns_check' => env('JOBS_SSRF_DNS_CHECK', true),
    'max_items_per_run' => 2000,
    'description_max_chars' => 8000,
    'translate' => false, // optional LLM title/summary translation stage (needs an LLM key)

    'expire_after_days' => 60, // jobs without an explicit expiry stop being listed this long after publication

    // Match score weights (sum is normalized; unknown job fields are excluded, not penalized).
    'match_weights' => ['skills' => 35, 'experience' => 10, 'italian' => 15, 'english' => 10, 'remote' => 10, 'employment' => 5, 'salary' => 10, 'location' => 5],
    'recommend_min_score' => 40,

    'categories' => [
        'tech' => ['developer', 'sviluppatore', 'programmatore', 'software', 'devops', 'sysadmin', 'data analyst', 'ingegnere informatico', 'programmer', 'مبرمج'],
        'healthcare' => ['infermiere', 'nurse', 'medico', 'oss', 'operatore socio', 'farmacista', 'assistente sanitario', 'ممرض'],
        'hospitality' => ['cameriere', 'barista', 'cuoco', 'chef', 'cucina', 'hotel', 'receptionist', 'waiter', 'cook', 'pizzaiolo'],
        'construction' => ['muratore', 'elettricista', 'idraulico', 'carpentiere', 'edile', 'cantiere', 'electrician', 'plumber', 'welder', 'saldatore'],
        'logistics' => ['magazziniere', 'autista', 'corriere', 'driver', 'warehouse', 'logistica', 'carrellista', 'fattorino'],
        'retail' => ['commesso', 'cassiere', 'addetto vendite', 'retail', 'sales assistant', 'negozio'],
        'education' => ['insegnante', 'docente', 'teacher', 'tutor', 'educatore', 'maestro'],
        'admin' => ['impiegato', 'segretaria', 'amministrativo', 'contabile', 'accountant', 'back office', 'assistant', 'receptionist'],
        'cleaning' => ['pulizie', 'addetto alle pulizie', 'cleaner', 'colf', 'badante'],
    ],

    // Skill dictionary: normalized token(s) the extractor looks for in title + description.
    'skills' => [
        'php', 'laravel', 'symfony', 'javascript', 'typescript', 'vue', 'react', 'angular', 'node', 'python', 'django', 'java', 'spring', 'kotlin', 'swift', 'flutter', 'dart',
        'c#', '.net', 'sql', 'mysql', 'postgresql', 'mongodb', 'redis', 'docker', 'kubernetes', 'aws', 'azure', 'git', 'linux', 'html', 'css', 'tailwind', 'figma',
        'excel', 'word', 'sap', 'photoshop', 'seo', 'marketing', 'contabilita', 'fatturazione', 'autocad', 'patente b', 'haccp', 'saldatura', 'carrello elevatore', 'cucina', 'barista',
    ],
];
