import {
  DEFAULT_VENUE_PROFILE_ANALYTICS_METRIC_IDS,
  VENUE_PROFILE_ANALYTICS_METRICS_CATALOG,
  VENUE_PROFILE_ANALYTICS_METRIC_IDS,
  VENUE_PROFILE_ANALYTICS_MODULE_KEY,
} from '@/modules/expert/config/venue-profile-analytics-metrics.config'
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

function buildVenueProfileAnalyticsPreferences(
  activeMetricIds: string[],
  isDefault: boolean,
): DashboardMetricPreferences {
  const catalogIdSet = new Set(VENUE_PROFILE_ANALYTICS_METRICS_CATALOG.map((metric) => metric.id))
  const filteredIds = sortIdsByCatalogOrder(
    activeMetricIds.filter((id) => catalogIdSet.has(id)),
    VENUE_PROFILE_ANALYTICS_METRIC_IDS,
  )

  return {
    moduleKey: VENUE_PROFILE_ANALYTICS_MODULE_KEY,
    catalog: VENUE_PROFILE_ANALYTICS_METRICS_CATALOG.map((metric) => ({
      id: metric.id,
      label: metric.label,
      type: metric.type,
      description: metric.description,
      defaultActive: metric.defaultActive,
    })),
    activeMetricIds:
      filteredIds.length > 0 ? filteredIds : [...DEFAULT_VENUE_PROFILE_ANALYTICS_METRIC_IDS],
    isDefault,
  }
}

export async function fetchVenueProfileAnalyticsDashboardMetricPreferences(): Promise<DashboardMetricPreferences> {
  try {
    const data = await fetchDashboardMetricPreferences(VENUE_PROFILE_ANALYTICS_MODULE_KEY)
    const normalized = buildVenueProfileAnalyticsPreferences(
      data.activeMetricIds?.length
        ? data.activeMetricIds
        : DEFAULT_VENUE_PROFILE_ANALYTICS_METRIC_IDS,
      data.isDefault,
    )
    writeLocalDashboardMetricIds(VENUE_PROFILE_ANALYTICS_MODULE_KEY, normalized.activeMetricIds)
    return normalized
  } catch {
    const localIds = readLocalDashboardMetricIds(VENUE_PROFILE_ANALYTICS_MODULE_KEY)
    if (localIds) {
      return buildVenueProfileAnalyticsPreferences(localIds, false)
    }
    return buildVenueProfileAnalyticsPreferences(DEFAULT_VENUE_PROFILE_ANALYTICS_METRIC_IDS, true)
  }
}

export async function saveVenueProfileAnalyticsDashboardMetricPreferences(
  activeMetricIds: string[],
): Promise<DashboardMetricPreferences> {
  const normalizedIds = buildVenueProfileAnalyticsPreferences(
    activeMetricIds,
    false,
  ).activeMetricIds
  writeLocalDashboardMetricIds(VENUE_PROFILE_ANALYTICS_MODULE_KEY, normalizedIds)

  try {
    const data = await saveDashboardMetricPreferences(
      VENUE_PROFILE_ANALYTICS_MODULE_KEY,
      normalizedIds,
    )
    return buildVenueProfileAnalyticsPreferences(
      data.activeMetricIds?.length ? data.activeMetricIds : normalizedIds,
      false,
    )
  } catch {
    return buildVenueProfileAnalyticsPreferences(normalizedIds, false)
  }
}

export async function resetVenueProfileAnalyticsDashboardMetricPreferences(): Promise<DashboardMetricPreferences> {
  clearLocalDashboardMetricIds(VENUE_PROFILE_ANALYTICS_MODULE_KEY)

  try {
    await resetDashboardMetricPreferences(VENUE_PROFILE_ANALYTICS_MODULE_KEY)
  } catch {
    // Local reset is enough when API is unavailable.
  }

  return buildVenueProfileAnalyticsPreferences(DEFAULT_VENUE_PROFILE_ANALYTICS_METRIC_IDS, true)
}
