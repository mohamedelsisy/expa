<?php

return [
    // Free text written by users (reviews, leads, community posts) goes through ContentSanitizer.
    'max_links' => (int) env('MODERATION_MAX_LINKS', 2),
    // Link shorteners hide the destination: always rejected. Matches the host or any subdomain.
    'blocked_link_hosts' => ['bit.ly', 'tinyurl.com', 't.co', 'goo.gl', 'ow.ly', 'is.gd', 'buff.ly', 'cutt.ly', 'rebrand.ly',
        'shorturl.at', 'tiny.cc', 'rb.gy', 'lnkd.in', 'wa.link', 'bit.do', 'shorte.st', 'adf.ly', 't.ly', 'v.gd', 'qr.ae'],
    // Same normalised text from anyone within this window is a duplicate.
    'duplicate_window_hours' => 24,
    // Accounts younger than this are "new" for throttling purposes.
    'new_account_days' => (int) env('MODERATION_NEW_ACCOUNT_DAYS', 3),
    'report_reasons' => ['spam', 'abuse', 'misleading', 'illegal', 'personal_data', 'other'],
];
