/** True while an /admin call has been refused with 403 `two_factor_setup_required` (or the signed-in user is known to need setup). */
export const useTwoFactorGate = () => useState<boolean>('twofa-gate', () => false)
