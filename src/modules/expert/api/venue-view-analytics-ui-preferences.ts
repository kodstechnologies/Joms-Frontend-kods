import {
  DEFAULT_VENUE_VIEW_ANALYTICS_METRIC_IDS,
  VENUE_VIEW_ANALYTICS_METRICS_CATALOG,
  VENUE_VIEW_ANALYTICS_METRIC_IDS,
  VENUE_VIEW_ANALYTICS_MODULE_KEY,
} from '@/modules/expert/config/venue-view-analytics-metrics.config'
import {
  fetchDashboardMetricPreferences,
  resetDashboardMetricPreferences,
  saveDashboardMetricPreferences,
  type DashboardMetricPreferences,
} from '@/modules/expert/api/ui-preferences-api'
import { sortIdsByCatalogOrder } from '@/shared/lib/dedupe-ids'
import {
  clearLocalDashboardMetricIds,
  readLocalDashboardMetricIds,
  writeLocalDashboardMetricIds,
} from '@/shared/lib/local-ui-preferences'

function buildVenueViewAnalyticsPreferences(
  activeMetricIds: string[],
  isDefault: boolean,
): DashboardMetricPreferences {
  const catalogIdSet = new Set(VENUE_VIEW_ANALYTICS_METRICS_CATALOG.map((metric) => metric.id))
  const filteredIds = sortIdsByCatalogOrder(
    activeMetricIds.filter((id) => catalogIdSet.has(id)),
    VENUE_VIEW_ANALYTICS_METRIC_IDS,
  )

  return {
    moduleKey: VENUE_VIEW_ANALYTICS_MODULE_KEY,
    catalog: VENUE_VIEW_ANALYTICS_METRICS_CATALOG.map((metric) => ({
      id: metric.id,
      label: metric.label,
      type: metric.type,
      description: metric.description,
      defaultActive: metric.defaultActive,
    })),
    activeMetricIds:
      filteredIds.length > 0 ? filteredIds : [...DEFAULT_VENUE_VIEW_ANALYTICS_METRIC_IDS],
    isDefault,
  }
}

export async function fetchVenueViewAnalyticsDashboardMetricPreferences(): Promise<DashboardMetricPreferences> {
  try {
    const data = await fetchDashboardMetricPreferences(VENUE_VIEW_ANALYTICS_MODULE_KEY)
    const normalized = buildVenueViewAnalyticsPreferences(
      data.activeMetricIds?.length ? data.activeMetricIds : DEFAULT_VENUE_VIEW_ANALYTICS_METRIC_IDS,
      data.isDefault,
    )
    writeLocalDashboardMetricIds(VENUE_VIEW_ANALYTICS_MODULE_KEY, normalized.activeMetricIds)
    return normalized
  } catch {
    const localIds = readLocalDashboardMetricIds(VENUE_VIEW_ANALYTICS_MODULE_KEY)
    if (localIds) {
      return buildVenueViewAnalyticsPreferences(localIds, false)
    }
    return buildVenueViewAnalyticsPreferences(DEFAULT_VENUE_VIEW_ANALYTICS_METRIC_IDS, true)
  }
}

export async function saveVenueViewAnalyticsDashboardMetricPreferences(
  activeMetricIds: string[],
): Promise<DashboardMetricPreferences> {
  const normalizedIds = buildVenueViewAnalyticsPreferences(activeMetricIds, false).activeMetricIds
  writeLocalDashboardMetricIds(VENUE_VIEW_ANALYTICS_MODULE_KEY, normalizedIds)

  try {
    const data = await saveDashboardMetricPreferences(
      VENUE_VIEW_ANALYTICS_MODULE_KEY,
      normalizedIds,
    )
    return buildVenueViewAnalyticsPreferences(
      data.activeMetricIds?.length ? data.activeMetricIds : normalizedIds,
      false,
    )
  } catch {
    return buildVenueViewAnalyticsPreferences(normalizedIds, false)
  }
}

export async function resetVenueViewAnalyticsDashboardMetricPreferences(): Promise<DashboardMetricPreferences> {
  clearLocalDashboardMetricIds(VENUE_VIEW_ANALYTICS_MODULE_KEY)

  try {
    await resetDashboardMetricPreferences(VENUE_VIEW_ANALYTICS_MODULE_KEY)
  } catch {
    // Local reset is enough when API is unavailable.
  }

  return buildVenueViewAnalyticsPreferences(DEFAULT_VENUE_VIEW_ANALYTICS_METRIC_IDS, true)
}
