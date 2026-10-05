<script setup lang="ts">
import { moduleByKey } from '~/utils/admin/modules'

definePageMeta({ layout: 'admin', middleware: 'admin' })
const { t } = useI18n()
const route = useRoute()
const { can } = usePermissions()
const m = computed(() => moduleByKey(route.params.module)!)
useAdminSeo(() => t(`admin.modules.${m.value.key}`))
</script>

<template>
  <div>
    <AdminPageHeader :title="t(`admin.modules.${m.key}`)" :crumbs="[{ label: t('admin.title'), to: '/admin' }, { label: t(`admin.modules.${m.key}`) }]">
      <UiButton v-if="can(`${m.permission}.create`)" :to="`/admin/content/${m.key}/new`"><UiIcon name="plus" :size="18" />{{ t('admin.content.new') }}</UiButton>
    </AdminPageHeader>
    <AdminContentList :key="m.key" :module="m" />
  </div>
</template>
