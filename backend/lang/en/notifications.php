<?php

return [
    'push' => [
        'title' => 'EXPA',
    ],
    'mail' => [
        'open' => 'Open document',
        'footer' => 'You are receiving this because you turned on email reminders. You can turn them off in your privacy settings.',
    ],
    'types' => [
        'job_source_failing' => [
            'title' => 'A job source was switched off',
            'body' => 'Job source ":source" was switched off after :failures consecutive failed runs.',
            'push' => 'A job source was switched off',
        ],
        'document_reminder' => [
            'title' => '":name" expires in :days days',
            'body' => 'Expiry date: :date. Start preparing the renewal and check the official guide for details.',
            'push' => 'A document of yours is about to expire.',
        ],
        'document_expired' => [
            'title' => '":name" has expired',
            'body' => 'It expired on :date. Check what to do with the relevant official body.',
            'push' => 'One of your documents has expired.',
        ],
    ],
];
