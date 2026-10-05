<script setup lang="ts">
import { moduleByKey } from '~/utils/admin/modules'

definePageMeta({ layout: 'admin', middleware: 'admin' })
const { t } = useI18n()
const route = useRoute()
const m = computed(() => moduleByKey(route.params.module)!)
useAdminSeo(() => t('admin.content.new'))
const localePath = useLocalePath()
const done = (item: Record<string, any>) => navigateTo(localePath(`/admin/content/${m.value.key}/${item.id}`))
</script>

<template>
  <div>
    <AdminPageHeader :title="t('admin.content.newTitle', { module: t(`admin.modules.${m.key}Singular`) })" :crumbs="[{ label: t('admin.title'), to: '/admin' }, { label: t(`admin.modules.${m.key}`), to: `/admin/content/${m.key}` }, { label: t('admin.content.new') }]" />
    <AdminContentForm :key="m.key" :module="m" :initial="null" @saved="done" />
  </div>
</template>
