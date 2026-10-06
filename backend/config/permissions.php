<?php

/*
| Source of truth for roles and permissions. `php artisan expa:sync-access` (and the seeder)
| make the database match this file idempotently. Permission keys are `resource.action`.
| super_admin bypasses all checks (Gate::before); it is intentionally not listed with permissions.
*/

$content = ['guides', 'articles', 'government_services', 'government_offices', 'appointment_guides',
    'italian_lessons', 'patente', 'jobs', 'universities', 'providers', 'cities', 'housing_rules'];
$contentActions = ['view', 'create', 'update', 'delete', 'review', 'publish'];

$permissions = [];
foreach ($content as $resource) {
    foreach ($contentActions as $action) {
        $permissions[] = "$resource.$action";
    }
}
// Legal texts need counsel approval: only admins publish (content_manager can draft/review, see roles below).
$legalPermissions = ['legal.view', 'legal.create', 'legal.update', 'legal.delete', 'legal.review', 'legal.publish'];
$jobSourcePermissions = ['job_sources.view', 'job_sources.create', 'job_sources.update', 'job_sources.delete'];
$permissions = array_merge($permissions, $jobSourcePermissions, $legalPermissions, [
    'users.view', 'users.update', 'users.delete',
    'roles.view', 'roles.assign',
    'translations.view', 'translations.update',
    'audit_logs.view',
    'ai.view_conversations', 'ai.manage_knowledge',
    'notifications.send',
    'subscriptions.view', 'subscriptions.manage',
    'reports.view', 'reports.finance', // finance = revenue and payment figures (admins only)
    'settings.view', 'settings.update',
    // Marketplace verification (evidence is admin-only) and community / review moderation.
    'providers.verify', 'provider_reviews.moderate', 'community.moderate', 'community.restrict_users',
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
            // Sources involve a legal judgement (is automated use permitted?), so editors/translators never get them.
            ['job_sources.view', 'job_sources.create', 'job_sources.update'],
            ['legal.view', 'legal.create', 'legal.update', 'legal.review'],
        ), 'privileged' => false],
        'editor' => ['label' => 'Editor', 'permissions' => $only($content, ['view', 'create', 'update']), 'privileged' => false],
        'translator' => ['label' => 'Translator', 'permissions' => array_merge(
            $only($content, ['view']),
            ['translations.view', 'translations.update'],
        ), 'privileged' => false],
        'support_agent' => ['label' => 'Support Agent', 'permissions' => [
            'users.view', 'subscriptions.view', 'ai.view_conversations',
        ], 'privileged' => false],
        // Moderators handle reports, review and community queues. Never granted to ordinary users.
        'moderator' => ['label' => 'Moderator', 'permissions' => [
            'provider_reviews.moderate', 'community.moderate', 'community.restrict_users',
        ], 'privileged' => false],
        // Providers manage their own listing through ownership policies, not admin permissions.
        'provider' => ['label' => 'Provider', 'permissions' => [], 'privileged' => false],
        'user' => ['label' => 'User', 'permissions' => [], 'privileged' => false],
    ],

    'default_role' => 'user',
];
