<script setup lang="ts">
import { moduleByKey } from '~/utils/admin/modules'
import { isApiError } from '~/utils/errors'

definePageMeta({ layout: 'admin', middleware: 'admin' })
const { t, locale } = useI18n()
const route = useRoute()
const { request } = useApi()
const m = computed(() => moduleByKey(route.params.module)!)
const { data, error, refresh, status } = await useAsyncData(`admin-item-${route.params.module}-${route.params.id}`, () => request<Record<string, any>>(`${m.value.endpoint}/${route.params.id}`))
const item = computed(() => data.value?.data)
const title = computed(() => item.value?.titles?.[locale.value] || item.value?.titles?.ar || item.value?.titles?.en || item.value?.slug || '')
useAdminSeo(() => title.value || t('admin.content.edit'))
const localePath = useLocalePath()
const back = () => navigateTo(localePath(`/admin/content/${m.value.key}`))
const notFound = computed(() => isApiError(error.value) && error.value.status === 404)
</script>

<template>
  <div>
    <AdminPageHeader :title="title || t('admin.content.edit')" :crumbs="[{ label: t('admin.title'), to: '/admin' }, { label: t(`admin.modules.${m.key}`), to: `/admin/content/${m.key}` }, { label: title || t('admin.content.edit') }]" />
    <UiSkeleton v-if="status === 'pending' && !data" :lines="8" />
    <UiErrorState v-else-if="error" :title="notFound ? t('errors.notFoundTitle') : undefined" :message="isApiError(error) ? error.message : undefined" :retry="!notFound" @retry="refresh()" />
    <AdminContentForm v-else-if="item" :key="`${m.key}-${item.id}`" :module="m" :initial="item" @deleted="back" />
  </div>
</template>
