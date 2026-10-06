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
        'payment_failed' => [
            'title' => 'We could not collect your payment',
            'body' => 'Your latest EXPA payment failed. Your plan stays active for :days more days. Please update your payment method with your payment provider.',
            'push' => 'Your latest payment failed.',
        ],
        'payment_failed_reminder' => [
            'title' => 'Your payment is still outstanding',
            'body' => 'We still could not collect your EXPA payment. Your plan will end in about :days days unless the payment succeeds.',
            'push' => 'Your payment is still outstanding.',
        ],
        'subscription_ended' => [
            'title' => 'Your plan has ended',
            'body' => 'Your paid plan ended because the payment could not be collected. You can subscribe again at any time.',
            'push' => 'Your paid plan has ended.',
        ],
        'scanner_unavailable' => [
            'title' => 'File scanner unreachable',
            'body' => 'The antivirus used for document uploads cannot be reached. Uploads are being rejected until it is back.',
            'push' => 'The upload antivirus is unreachable.',
        ],
        'announcement' => [
            'title' => 'Announcement',
            'body' => '',
            'push' => 'You have a new announcement.',
        ],
    ],
];
