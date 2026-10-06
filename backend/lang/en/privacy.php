<?php

return [
    'purposes' => [
        'terms' => [
            'title' => 'Terms of Service',
            'why' => 'To create your account and provide the service.',
            'data' => 'Name, email, password (hashed).',
        ],
        'privacy' => [
            'title' => 'Privacy Policy',
            'why' => 'To inform you how your data is processed under the GDPR.',
            'data' => 'No extra data; this is an acknowledgement.',
        ],
        'profile_personalization' => [
            'title' => 'Personalise your experience',
            'why' => 'To show guides, steps and tasks that fit your situation.',
            'data' => 'Current situation, nationality, residence type, language levels, goals, age range (only what you choose to give).',
        ],
        'document_storage' => [
            'title' => 'Store your documents',
            'why' => 'To track your documents\' expiry dates, remind you, and keep your attachments safe.',
            'data' => 'Document type, issue and expiry dates, your notes, and files you upload.',
        ],
        'ai_personalization' => [
            'title' => 'Personalise assistant answers',
            'why' => 'So the EXPA assistant can take your situation into account. We send the minimum only (never your name, email or files).',
            'data' => 'Nationality, city, situation, language level and upcoming expiry dates.',
        ],
        'email_reminders' => [
            'title' => 'Email reminders',
            'why' => 'To email you document-expiry and appointment reminders.',
            'data' => 'Your email address and reminder dates.',
        ],
        'push_notifications' => [
            'title' => 'Push notifications',
            'why' => 'To send alerts to your phone.',
            'data' => 'Device token and platform.',
        ],
        'analytics' => [
            'title' => 'Usage analytics',
            'why' => 'To improve EXPA by measuring general usage without identifying you.',
            'data' => 'Event names (e.g. opened a guide) without personal identifiers.',
        ],
        'marketing' => [
            'title' => 'Marketing messages',
            'why' => 'To tell you about new features and offers.',
            'data' => 'Your email address and general interests.',
        ],
        'housing_analysis' => [
            'title' => 'Analyse rental listings',
            'why' => 'To check the listing or contract text you paste and, if you ask for it, have an AI model explain it. The text is processed in memory and is not stored unless you choose to save the result.',
            'data' => 'The listing or contract text you paste (it may be sent to our AI provider), and the result if you save it.',
        ],
        'document_analysis' => [
            'title' => 'Analyse letters and documents',
            'why' => 'To read a photo, scan or text of a letter, bill or payslip, classify it and explain it. Files are processed temporarily and deleted; nothing is stored by default.',
            'data' => 'The file or text you submit (text may be sent to our AI provider).',
        ],
    ],
];
