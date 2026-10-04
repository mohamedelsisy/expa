<?php

/*
| Source of truth for roles and permissions. `php artisan expa:sync-access` (and the seeder)
| make the database match this file idempotently. Permission keys are `resource.action`.
| super_admin bypasses all checks (Gate::before); it is intentionally not listed with permissions.
*/

$content = ['guides', 'articles', 'government_services', 'government_offices', 'appointment_guides',
    'italian_lessons', 'patente', 'jobs', 'job_sources', 'universities', 'providers', 'cities'];
$contentActions = ['view', 'create', 'update', 'delete', 'review', 'publish'];

$permissions = [];
foreach ($content as $resource) {
    foreach ($contentActions as $action) {
        $permissions[] = "$resource.$action";
    }
}
$permissions = array_merge($permissions, [
    'users.view', 'users.update', 'users.delete',
    'roles.view', 'roles.assign',
    'translations.view', 'translations.update',
    'audit_logs.view',
    'ai.view_conversations', 'ai.manage_knowledge',
    'notifications.send',
    'subscriptions.view', 'subscriptions.manage',
    'reports.view',
    'settings.view', 'settings.update',
]);

$only = fn (array $resources, array $actions) => array_merge(...array_map(
    fn ($r) => array_map(fn ($a) => "$r.$a", $actions), $resources));

return [
    'permissions' => $permissions,

    'roles' => [
        'super_admin' => ['label' => 'Super Admin', 'permissions' => [], 'privileged' => true],
        'admin' => ['label' => 'Admin', 'permissions' => $permissions, 'privileged' => true],
        'content_manager' => ['label' => 'Content Manager', 'permissions' => array_merge(
            $only($content, $contentActions),
            ['translations.view', 'translations.update', 'reports.view'],
        ), 'privileged' => false],
        'editor' => ['label' => 'Editor', 'permissions' => $only($content, ['view', 'create', 'update']), 'privileged' => false],
        'translator' => ['label' => 'Translator', 'permissions' => array_merge(
            $only($content, ['view']),
            ['translations.view', 'translations.update'],
        ), 'privileged' => false],
        'support_agent' => ['label' => 'Support Agent', 'permissions' => [
            'users.view', 'subscriptions.view', 'ai.view_conversations',
        ], 'privileged' => false],
        // Providers manage their own listing through ownership policies, not admin permissions.
        'provider' => ['label' => 'Provider', 'permissions' => [], 'privileged' => false],
        'user' => ['label' => 'User', 'permissions' => [], 'privileged' => false],
    ],

    'default_role' => 'user',
];
