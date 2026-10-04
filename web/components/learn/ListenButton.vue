<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { useI18n } from '#imports'
import Icon from '../ui/Icon.vue'

/** Optional pronunciation with the browser's own speech synthesis (it-IT). Hidden when unsupported; no external TTS. */
const props = defineProps<{ text: string }>()
const { t } = useI18n()
const supported = ref(false)
const speaking = ref(false)
onMounted(() => { supported.value = typeof window !== 'undefined' && 'speechSynthesis' in window && typeof SpeechSynthesisUtterance !== 'undefined' })
function speak() {
  if (!supported.value) return
  const synth = window.speechSynthesis
  synth.cancel()
  const u = new SpeechSynthesisUtterance(props.text)
  u.lang = 'it-IT'
  u.rate = 0.9
  u.onend = u.onerror = () => { speaking.value = false }
  speaking.value = true
  synth.speak(u)
}
onBeforeUnmount(() => { if (supported.value) window.speechSynthesis.cancel() })
</script>

<template>
  <button v-if="supported" type="button" class="inline-flex min-h-touch min-w-touch items-center justify-center gap-1 rounded-md text-primary-strong hover:bg-primary-soft" :aria-label="`${t('learn.listen')}: ${text}`" :aria-pressed="speaking" data-testid="listen" @click="speak">
    <Icon name="volume" :size="20" />
  </button>
</template>
