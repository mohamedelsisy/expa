/** Countdown + auto-submit logic for the mock exam. Pure and timer-injectable so it can be unit-tested. */
export const ANNOUNCE_AT = [600, 300, 120, 60, 30, 10] as const

export function remainingSeconds(deadlineIso: string | null | undefined, nowMs: number): number | null {
  if (!deadlineIso) return null
  const d = Date.parse(deadlineIso)
  if (Number.isNaN(d)) return null
  return Math.max(0, Math.ceil((d - nowMs) / 1000))
}

export function formatClock(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds))
  const mm = String(Math.floor(s / 60)).padStart(2, '0')
  const ss = String(s % 60).padStart(2, '0')
  return `${mm}:${ss}`
}

/** The announcement threshold crossed when going from `prev` to `next` seconds remaining (largest crossed), or null. */
export function crossedThreshold(prev: number | null, next: number): number | null {
  if (prev === null) return null
  const hit = ANNOUNCE_AT.filter(t => prev > t && next <= t)
  return hit.length ? Math.min(...hit) : null
}

export interface ClockHandlers {
  onTick?: (remaining: number) => void
  /** Called with the threshold (seconds) when it is crossed: feed it to an aria-live region. */
  onAnnounce?: (threshold: number) => void
  /** Called exactly once when the deadline is reached (auto-submit). */
  onExpire: () => void
}

export function createExamClock(deadlineIso: string | null | undefined, handlers: ClockHandlers, now: () => number = Date.now) {
  let timer: ReturnType<typeof setInterval> | null = null
  let prev: number | null = null
  let expired = false

  function tick() {
    const rem = remainingSeconds(deadlineIso, now())
    if (rem === null) return
    const crossed = crossedThreshold(prev, rem)
    prev = rem
    handlers.onTick?.(rem)
    if (crossed !== null && rem > 0) handlers.onAnnounce?.(crossed)
    if (rem <= 0 && !expired) {
      expired = true
      stop()
      handlers.onExpire()
    }
  }
  function start() {
    if (timer || expired) return
    tick()
    if (!expired) timer = setInterval(tick, 1000)
  }
  function stop() {
    if (timer) clearInterval(timer)
    timer = null
  }
  return { start, stop, tick, get expired() { return expired } }
}
