<script setup lang="ts">
import type { City, ProfileOptions } from '~/types/api'
import type { ProfileFormState } from '~/composables/useProfileForm'
import { countryOptions } from '~/utils/countries'

/** Field group for one onboarding step. Used by onboarding (one step at a time) and the profile page (all). */
const props = defineProps<{ step: string, form: ProfileFormState, options: ProfileOptions, cities: City[], errors: Record<string, string>, label?: string }>()
const { t, locale } = useI18n()

const countries = computed(() => countryOptions(locale.value))
const cityOptions = computed(() => props.cities.map(c => ({ value: String(c.id), label: `${c.name} (${c.region.name})` })))
const cefr = computed(() => props.options.cefr_level)
const italianLevels = computed(() => cefr.value.filter(o => ['A0', 'A1', 'A2', 'B1', 'B2', 'C1'].includes(o.value)))

function toggleGoal(value: string, on: boolean) {
  const set = new Set(props.form.goals)
  if (on) set.add(value)
  else set.delete(value)
  props.form.goals = [...set]
}
</script>

<template>
  <div class="space-y-5">
    <UiFormField v-if="step === 'status'" :label="label ?? t('profile.fields.segment')" :error="errors.segment" required>
      <UiSelect v-model="form.segment" :options="options.segment" :placeholder="t('common.choose')" />
    </UiFormField>

    <UiFormField v-else-if="step === 'nationality'" :label="label ?? t('profile.fields.nationality')" :error="errors.nationality" optional>
      <UiSelect v-model="form.nationality" :options="countries" :placeholder="t('common.choose')" />
    </UiFormField>

    <UiFormField v-else-if="step === 'city'" :label="label ?? t('profile.fields.city')" :error="errors.city_id" optional>
      <UiSelect v-model="form.city_id" :options="cityOptions" :placeholder="t('common.choose')" />
    </UiFormField>

    <UiFormField v-else-if="step === 'residence'" :label="label ?? t('profile.fields.residence')" :error="errors.residence_type" optional>
      <UiSelect v-model="form.residence_type" :options="options.residence_type" :placeholder="t('common.choose')" />
    </UiFormField>

    <template v-else-if="step === 'language'">
      <UiFormField :label="t('profile.fields.italianLevel')" :error="errors.italian_level" optional>
        <UiSelect v-model="form.italian_level" :options="italianLevels" :placeholder="t('common.choose')" />
      </UiFormField>
      <UiFormField :label="t('profile.fields.englishLevel')" :error="errors.english_level" optional>
        <UiSelect v-model="form.english_level" :options="cefr" :placeholder="t('common.choose')" />
      </UiFormField>
    </template>

    <UiFormField v-else-if="step === 'goals'" :label="label ?? t('profile.fields.goals')" :error="errors.goals" group optional>
      <div class="grid gap-x-4 sm:grid-cols-2">
        <UiCheckbox
          v-for="g in options.goals"
          :key="g.value"
          :model-value="form.goals.includes(g.value)"
          :label="g.label"
          @update:model-value="toggleGoal(g.value, $event)"
        />
      </div>
    </UiFormField>

    <UiFormField v-else-if="step === 'age'" :label="label ?? t('profile.fields.ageRange')" :error="errors.age_range" optional>
      <UiSelect v-model="form.age_range" :options="options.age_range" :placeholder="t('common.choose')" />
    </UiFormField>
  </div>
</template>
