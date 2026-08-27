import {
  DEFAULT_EXPERT_PROFILE_ANALYTICS_METRIC_IDS,
  EXPERT_PROFILE_ANALYTICS_LEGACY_METRIC_ID_MAP,
  EXPERT_PROFILE_ANALYTICS_METRICS_CATALOG,
  EXPERT_PROFILE_ANALYTICS_METRIC_IDS,
  EXPERT_PROFILE_ANALYTICS_MODULE_KEY,
} from '@/modules/expert/config/expert-profile-analytics-metrics.config'
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

function buildExpertProfileAnalyticsPreferences(
  activeMetricIds: string[],
  isDefault: boolean,
): DashboardMetricPreferences {
  const catalogIdSet = new Set(EXPERT_PROFILE_ANALYTICS_METRICS_CATALOG.map((metric) => metric.id))
  const mappedIds = activeMetricIds.map(
    (id) => EXPERT_PROFILE_ANALYTICS_LEGACY_METRIC_ID_MAP[id] ?? id,
  )
  const filteredIds = sortIdsByCatalogOrder(
    [...new Set(mappedIds.filter((id) => catalogIdSet.has(id)))],
    EXPERT_PROFILE_ANALYTICS_METRIC_IDS,
  )

  return {
    moduleKey: EXPERT_PROFILE_ANALYTICS_MODULE_KEY,
    catalog: EXPERT_PROFILE_ANALYTICS_METRICS_CATALOG.map((metric) => ({
      id: metric.id,
      label: metric.label,
      type: metric.type,
      description: metric.description,
      defaultActive: metric.defaultActive,
    })),
    activeMetricIds:
      filteredIds.length > 0 ? filteredIds : [...DEFAULT_EXPERT_PROFILE_ANALYTICS_METRIC_IDS],
    isDefault,
  }
}

export async function fetchExpertProfileAnalyticsDashboardMetricPreferences(): Promise<DashboardMetricPreferences> {
  try {
    const data = await fetchDashboardMetricPreferences(EXPERT_PROFILE_ANALYTICS_MODULE_KEY)
    const normalized = buildExpertProfileAnalyticsPreferences(
      data.activeMetricIds?.length
        ? data.activeMetricIds
        : DEFAULT_EXPERT_PROFILE_ANALYTICS_METRIC_IDS,
      data.isDefault,
    )
    writeLocalDashboardMetricIds(EXPERT_PROFILE_ANALYTICS_MODULE_KEY, normalized.activeMetricIds)
    return normalized
  } catch {
    const localIds = readLocalDashboardMetricIds(EXPERT_PROFILE_ANALYTICS_MODULE_KEY)
    if (localIds) {
      return buildExpertProfileAnalyticsPreferences(localIds, false)
    }
    return buildExpertProfileAnalyticsPreferences(DEFAULT_EXPERT_PROFILE_ANALYTICS_METRIC_IDS, true)
  }
}

export async function saveExpertProfileAnalyticsDashboardMetricPreferences(
  activeMetricIds: string[],
): Promise<DashboardMetricPreferences> {
  const normalizedIds = buildExpertProfileAnalyticsPreferences(
    activeMetricIds,
    false,
  ).activeMetricIds
  writeLocalDashboardMetricIds(EXPERT_PROFILE_ANALYTICS_MODULE_KEY, normalizedIds)

  try {
    const data = await saveDashboardMetricPreferences(
      EXPERT_PROFILE_ANALYTICS_MODULE_KEY,
      normalizedIds,
    )
    return buildExpertProfileAnalyticsPreferences(
      data.activeMetricIds?.length ? data.activeMetricIds : normalizedIds,
      false,
    )
  } catch {
    return buildExpertProfileAnalyticsPreferences(normalizedIds, false)
  }
}

export async function resetExpertProfileAnalyticsDashboardMetricPreferences(): Promise<DashboardMetricPreferences> {
  clearLocalDashboardMetricIds(EXPERT_PROFILE_ANALYTICS_MODULE_KEY)

  try {
    await resetDashboardMetricPreferences(EXPERT_PROFILE_ANALYTICS_MODULE_KEY)
  } catch {
    // Local reset is enough when API is unavailable.
  }

  return buildExpertProfileAnalyticsPreferences(DEFAULT_EXPERT_PROFILE_ANALYTICS_METRIC_IDS, true)
}
