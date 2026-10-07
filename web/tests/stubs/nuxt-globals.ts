import { vi } from 'vitest'
import { computed, reactive, ref, watch, onMounted, nextTick } from 'vue'
import { useI18n, useLocalePath } from './imports'

/** Nuxt auto-imports used by components that do not import them explicitly (component tests only). */
vi.stubGlobal('computed', computed)
vi.stubGlobal('ref', ref)
vi.stubGlobal('reactive', reactive)
vi.stubGlobal('watch', watch)
vi.stubGlobal('onMounted', onMounted)
vi.stubGlobal('nextTick', nextTick)
vi.stubGlobal('useI18n', useI18n)
vi.stubGlobal('useLocalePath', useLocalePath)
