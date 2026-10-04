<?php

return [
    'greeting' => 'Hello :name,',
    'verify' => [
        'subject' => 'Verify your email for EXPA',
        'line' => 'Thanks for joining EXPA. Click the button below to confirm your email address.',
        'action' => 'Verify email',
        'ignore' => 'If you did not create an account, you can ignore this message.',
    ],
    'reset' => [
        'subject' => 'Reset your EXPA password',
        'line' => 'We received a request to reset the password of your account.',
        'action' => 'Reset password',
        'expires' => 'This link expires in :minutes minutes.',
        'ignore' => 'If you did not request this, no action is needed.',
    ],
];
