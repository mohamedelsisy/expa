/** Input rules for the travel-requirements lookup (pure, unit-tested). The API decides what is known; nothing here implies eligibility. */
export const RESIDENCE_STATUSES = ['visa', 'residence_permit'] as const
export type TravelError = 'nationality' | 'destination' | 'same'

export function validateTravel(f: { nationality: string, destination: string }): Partial<Record<'nationality' | 'destination', TravelError>> {
  const iso = /^[A-Z]{2}$/
  const e: Partial<Record<'nationality' | 'destination', TravelError>> = {}
  if (!iso.test(f.nationality)) e.nationality = 'nationality'
  if (!iso.test(f.destination)) e.destination = 'destination'
  return e
}

export function travelQuery(f: { nationality: string, destination: string, status: string }): Record<string, string> {
  return { nationality: f.nationality, destination: f.destination, ...(f.status ? { residence_status: f.status } : {}) }
}

/** Country options from `GET /countries` (localized by the API); falls back to Intl names when the call failed. */
export function toOptions(list: { code: string, name: string }[], locale: string): { value: string, label: string }[] {
  return list.map(c => ({ value: c.code.toUpperCase(), label: c.name })).sort((a, b) => a.label.localeCompare(b.label, locale))
}
