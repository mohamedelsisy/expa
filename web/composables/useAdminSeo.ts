/** Admin pages: a title, never indexed. */
export function useAdminSeo(title: () => string) {
  const { t } = useI18n()
  useSeo(() => ({ title: title(), description: t('admin.title'), noindex: true }))
}
