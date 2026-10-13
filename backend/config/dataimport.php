<?php

return [
    // Only these hosts (and their subdomains) may be fetched by importers: official publishers of open data.
    'allowed_hosts' => array_values(array_filter(array_map('trim', explode(',', (string) env('DATAIMPORT_ALLOWED_HOSTS',
        'istat.it,dati-ustat.mur.gov.it,mur.gov.it,universitaly.it,indicepa.gov.it,dati.gov.it,agenziaentrate.gov.it,inps.it,interno.gov.it,poliziadistato.it,salute.gov.it,dati.salute.gov.it,mit.gov.it,ilportaledellautomobilista.it,anagrafenazionale.interno.it,lavoro.gov.it,agid.gov.it'
    ))))),
    'user_agent' => env('DATAIMPORT_USER_AGENT', 'EXPA-data-import/1.0 (+https://github.com/mohamedelsisy/expa; official open data only)'),
    'timeout_seconds' => (int) env('DATAIMPORT_TIMEOUT', 120),
    'max_bytes' => (int) env('DATAIMPORT_MAX_BYTES', 150 * 1024 * 1024),
    // XLSX is a zip: bound what it may expand to (per part, after decompression) and how many entries it may hold.
    'xlsx_max_part_bytes' => (int) env('DATAIMPORT_XLSX_MAX_PART_BYTES', 100 * 1024 * 1024),
    'xlsx_max_entries' => (int) env('DATAIMPORT_XLSX_MAX_ENTRIES', 2000),
    // Raw downloads are kept (private disk) with a checksum so a run can be reproduced and audited.
    'storage_dir' => 'imports',
    // expa:prune-retention keeps each dataset's newest download and drops older ones after this many days.
    'raw_retention_days' => (int) env('DATAIMPORT_RAW_RETENTION_DAYS', 90),
    'max_logged_rejects' => 200,
    // Scheduled updates (see routes/console.php) are opt-in.
    'schedule_enabled' => (bool) env('DATAIMPORT_SCHEDULE', false),
];
