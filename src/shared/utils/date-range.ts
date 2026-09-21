/** True when both values are set and end is strictly before start (ISO / YYYY-MM-DD / datetime-local). */
export function isEndBeforeStart(start: string | null | undefined, end: string | null | undefined) {
  if (!start?.trim() || !end?.trim()) return false
  const startMs = new Date(start).getTime()
  const endMs = new Date(end).getTime()
  if (Number.isNaN(startMs) || Number.isNaN(endMs)) return false
  return endMs < startMs
}

export function isEndOnOrBeforeStart(
  start: string | null | undefined,
  end: string | null | undefined,
) {
  if (!start?.trim() || !end?.trim()) return false
  const startDay = start.trim().slice(0, 10)
  const endDay = end.trim().slice(0, 10)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(startDay) || !/^\d{4}-\d{2}-\d{2}$/.test(endDay)) {
    return isEndBeforeStart(start, end) || start === end
  }
  return endDay <= startDay
}

export function getTodayDateInputValue() {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function isStartBeforeToday(start: string | null | undefined) {
  if (!start?.trim()) return false
  const startDay = start.trim().slice(0, 10)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(startDay)) return false
  return startDay < getTodayDateInputValue()
}

export const END_BEFORE_START_MESSAGE = 'End date must be on or after the start date.'
export const END_MUST_AFTER_START_MESSAGE =
  'End date must be at least one day after the start date.'
export const START_BEFORE_TODAY_MESSAGE = 'Start date cannot be before today.'

/** Clears end when start moves past it so the pair stays valid. */
export function clampEndToStart(start: string, end: string): string {
  if (!start || !end) return end
  return isEndBeforeStart(start, end) ? '' : end
}
