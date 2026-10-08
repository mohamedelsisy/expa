<script setup lang="ts">
const { t } = useI18n()
</script>

<template>
  <GuideCategoryLanding area="money" category="money" :article-category="'money'" path="/money" icon="euro">
    <template #tools>
      <UiCard as="section" aria-labelledby="money-tools-h" class="flex flex-wrap items-center justify-between gap-4" data-testid="money-tool">
        <div class="max-w-xl space-y-1">
          <h2 id="money-tools-h" class="text-lg font-bold">{{ t('net.title') }}</h2>
          <p class="text-ink-soft">{{ t('net.subtitle') }}</p>
        </div>
        <UiButton to="/money/net-salary"><UiIcon name="euro" :size="18" />{{ t('net.open') }}</UiButton>
      </UiCard>
    </template>
  </GuideCategoryLanding>
</template>
