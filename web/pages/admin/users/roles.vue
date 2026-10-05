<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin' })
const { t } = useI18n()
useAdminSeo(() => t('admin.nav.roles'))
const { roles, failed, pending, load } = useRoles()
await load()
const perms = computed(() => [...new Set((roles.value ?? []).flatMap(r => r.permissions))].sort())
const groups = computed(() => {
  const g: Record<string, string[]> = {}
  for (const p of perms.value) (g[p.split('.')[0]!] ??= []).push(p)
  return Object.entries(g)
})
</script>

<template>
  <div>
    <AdminPageHeader :title="t('admin.nav.roles')" :description="t('admin.roles.subtitle')" :crumbs="[{ label: t('admin.title'), to: '/admin' }, { label: t('admin.users.title'), to: '/admin/users' }, { label: t('admin.nav.roles') }]" />
    <UiSkeleton v-if="pending" :lines="6" />
    <UiErrorState v-else-if="failed" retry @retry="load(true)" />
    <template v-else>
      <UiAlert tone="info" class="mb-4">{{ t('admin.roles.superAdminNote') }}</UiAlert>
      <div class="relative overflow-auto rounded-lg border border-line bg-surface" role="region" :aria-label="t('admin.nav.roles')" tabindex="0">
        <table class="w-full min-w-[40rem] border-collapse text-start">
          <caption class="sr-only">{{ t('admin.roles.matrix') }}</caption>
          <thead class="bg-sunken text-sm"><tr>
            <th scope="col" class="px-3 py-2 text-start">{{ t('admin.roles.permission') }}</th>
            <th v-for="r in roles" :key="r.key" scope="col" class="px-3 py-2 text-center">{{ r.label }}<span v-if="r.privileged" class="block text-xs font-normal text-muted">{{ t('admin.users.privilegedRole') }}</span></th>
          </tr></thead>
          <tbody v-for="[group, ps] in groups" :key="group" class="divide-y divide-line border-t border-line">
            <tr v-for="p in ps" :key="p">
              <th scope="row" class="px-3 py-1.5 text-start font-normal" dir="ltr">{{ p }}</th>
              <td v-for="r in roles" :key="r.key" class="px-3 py-1.5 text-center"><span v-if="r.permissions.includes(p)" :aria-label="t('admin.common.true')">✓</span><span v-else class="text-muted" :aria-label="t('admin.common.false')">–</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>
  </div>
</template>
