import { dedupeOrderedIds } from '@/shared/lib/dedupe-ids'

const STORAGE_PREFIX = 'joms:ui-preferences:'

const dashboardMetricsKey = (moduleKey: string) => `${STORAGE_PREFIX}${moduleKey}:dashboard-metrics`

export function readLocalDashboardMetricIds(moduleKey: string): string[] | null {
  if (typeof window === 'undefined') return null

  try {
    const raw = window.localStorage.getItem(dashboardMetricsKey(moduleKey))
    if (!raw) return null

    const parsed = JSON.parse(raw) as { activeMetricIds?: unknown }
    if (!Array.isArray(parsed.activeMetricIds)) return null

    const ids = dedupeOrderedIds(
      parsed.activeMetricIds.filter((id): id is string => typeof id === 'string'),
    )
    return ids.length > 0 ? ids : null
  } catch {
    return null
  }
}

export function writeLocalDashboardMetricIds(moduleKey: string, activeMetricIds: string[]) {
  if (typeof window === 'undefined') return

  window.localStorage.setItem(
    dashboardMetricsKey(moduleKey),
    JSON.stringify({ activeMetricIds: dedupeOrderedIds(activeMetricIds) }),
  )
}

export function clearLocalDashboardMetricIds(moduleKey: string) {
  if (typeof window === 'undefined') return
  window.localStorage.removeItem(dashboardMetricsKey(moduleKey))
}
