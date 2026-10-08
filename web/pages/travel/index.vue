<script setup lang="ts">
const { t } = useI18n()
</script>

<template>
  <GuideCategoryLanding area="travel" category="travel" :article-category="null" path="/travel" icon="globe">
    <template #tools>
      <UiCard as="section" aria-labelledby="travel-tools-h" class="flex flex-wrap items-center justify-between gap-4" data-testid="travel-tool">
        <div class="max-w-xl space-y-1">
          <h2 id="travel-tools-h" class="text-lg font-bold">{{ t('travel.title') }}</h2>
          <p class="text-ink-soft">{{ t('travel.subtitle') }}</p>
        </div>
        <UiButton to="/travel/requirements"><UiIcon name="globe" :size="18" />{{ t('travel.open') }}</UiButton>
      </UiCard>
    </template>
  </GuideCategoryLanding>
</template>
