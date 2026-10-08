<script setup lang="ts">
/** Full-page gate for staff whose role requires 2FA but who have not set it up (403 `two_factor_setup_required`). */
const { t } = useI18n()
const heading = ref<HTMLElement | null>(null)
onMounted(() => heading.value?.focus())
</script>

<template>
  <section class="mx-auto max-w-xl py-10 text-center" data-testid="two-factor-gate" aria-labelledby="tf-gate-h">
    <UiIcon name="lock" :size="40" class="mx-auto text-primary-strong" />
    <h1 id="tf-gate-h" ref="heading" tabindex="-1" class="mt-4 text-2xl font-bold outline-none sm:text-3xl">{{ t('twoFactor.gate.title') }}</h1>
    <p class="mt-3 text-ink-soft">{{ t('twoFactor.gate.body') }}</p>
    <UiButton to="/settings/two-factor" size="lg" class="mt-6" data-testid="two-factor-gate-cta">{{ t('twoFactor.gate.cta') }}</UiButton>
  </section>
</template>
