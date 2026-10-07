import type { ExamRun } from '~/types/api'

/** Starts a Patente practice session (topic or weak-topics) and opens the runner. Maps the known refusals to states. */
export function usePracticeStart() {
  const { request } = useApi()
  const { t } = useI18n()
  const localePath = useLocalePath()
  const starting = ref<string | null>(null)
  const problem = ref<string | null>(null)
  const needsVerify = ref(false)
  async function start(path: string, key: string, body: Record<string, unknown> = {}) {
    starting.value = key
    problem.value = null
    needsVerify.value = false
    try {
      const res = await request<ExamRun>(path, { method: 'POST', body })
      await navigateTo(localePath(`/patente/run/${res.data.id}`))
    } catch (e) {
      if (isApiError(e) && e.code === 'email_not_verified') needsVerify.value = true
      else if (isApiError(e) && e.code === 'not_enough_questions') problem.value = t('patente.notEnoughPractice')
      else if (isApiError(e) && e.code === 'no_weak_topics') problem.value = t('patente.weakPage.noWeakStart')
      else if (isApiError(e) && e.status === 429) problem.value = t('patente.weakPage.limit')
      else problem.value = isApiError(e) ? e.message : t('errors.generic')
    } finally {
      starting.value = null
    }
  }
  return { starting, problem, needsVerify, start }
}
