<?php

return [
    'status' => ['valid' => 'Valid', 'expiring_soon' => 'Expiring soon', 'expired' => 'Expired', 'no_expiry' => 'No expiry date'],
    'actions' => [
        'expiring' => ['title' => '":document" expires in :days days', 'description' => 'Start preparing the renewal now. Check the official guide for details.'],
        'expired' => ['title' => '":document" has expired', 'description' => 'Check what to do with the relevant official body.'],
    ],
];
