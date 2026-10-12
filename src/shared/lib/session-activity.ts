const STORAGE_KEY = 'joms-last-session-activity'

let lastActivityAt = Date.now()

function readStoredActivity() {
  try {
    const stored = Number(window.localStorage.getItem(STORAGE_KEY))
    return Number.isFinite(stored) && stored > 0 ? stored : 0
  } catch {
    return 0
  }
}

// Records the latest activity in this tab and in local storage so other tabs share the same idle clock.
export function markSessionActivity() {
  lastActivityAt = Date.now()
  try {
    window.localStorage.setItem(STORAGE_KEY, String(lastActivityAt))
  } catch {
    // Ignore storage failures (private mode, quota exceeded, etc.)
  }
}

// Uses the later time from this tab or any other tab, so activity in one tab keeps the others signed in.
export function getLastSessionActivity() {
  const stored = typeof window !== 'undefined' ? readStoredActivity() : 0
  if (stored > lastActivityAt) lastActivityAt = stored
  return lastActivityAt
}
