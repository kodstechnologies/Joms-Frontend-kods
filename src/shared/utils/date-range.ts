/** True when both values are set and end is strictly before start (ISO / YYYY-MM-DD / datetime-local). */
export function isEndBeforeStart(start: string | null | undefined, end: string | null | undefined) {
  if (!start?.trim() || !end?.trim()) return false
  const startMs = new Date(start).getTime()
  const endMs = new Date(end).getTime()
  if (Number.isNaN(startMs) || Number.isNaN(endMs)) return false
  return endMs < startMs
}

export const END_BEFORE_START_MESSAGE = 'End date must be on or after the start date.'

/** Clears end when start moves past it so the pair stays valid. */
export function clampEndToStart(start: string, end: string): string {
  if (!start || !end) return end
  return isEndBeforeStart(start, end) ? '' : end
}
