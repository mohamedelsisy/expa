import type { InjectionKey, ComputedRef } from 'vue'

export interface FormFieldContext {
  id: string
  describedBy: ComputedRef<string | undefined>
  invalid: ComputedRef<boolean>
  required: ComputedRef<boolean>
}
export const FORM_FIELD_KEY: InjectionKey<FormFieldContext> = Symbol('form-field')
