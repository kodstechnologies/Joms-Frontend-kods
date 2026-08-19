import {
  DEFAULT_PLATFORM_HEALTH_METRIC_IDS,
  PLATFORM_HEALTH_METRICS_CATALOG,
  PLATFORM_HEALTH_METRIC_IDS,
  PLATFORM_HEALTH_MODULE_KEY,
} from '@/modules/settings/config/platform-health-metrics.config'
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

function buildPlatformHealthPreferences(
  activeMetricIds: string[],
  isDefault: boolean,
): DashboardMetricPreferences {
  const catalogIdSet = new Set(PLATFORM_HEALTH_METRICS_CATALOG.map((metric) => metric.id))
  const filteredIds = sortIdsByCatalogOrder(
    activeMetricIds.filter((id) => catalogIdSet.has(id)),
    PLATFORM_HEALTH_METRIC_IDS,
  )

  return {
    moduleKey: PLATFORM_HEALTH_MODULE_KEY,
    catalog: PLATFORM_HEALTH_METRICS_CATALOG.map((metric) => ({
      id: metric.id,
      label: metric.label,
      type: metric.type,
      description: metric.description,
      defaultActive: metric.defaultActive,
    })),
    activeMetricIds: filteredIds.length > 0 ? filteredIds : [...DEFAULT_PLATFORM_HEALTH_METRIC_IDS],
    isDefault,
  }
}

export async function fetchPlatformHealthDashboardMetricPreferences(): Promise<DashboardMetricPreferences> {
  try {
    const data = await fetchDashboardMetricPreferences(PLATFORM_HEALTH_MODULE_KEY)
    const normalized = buildPlatformHealthPreferences(
      data.activeMetricIds?.length ? data.activeMetricIds : DEFAULT_PLATFORM_HEALTH_METRIC_IDS,
      data.isDefault,
    )
    writeLocalDashboardMetricIds(PLATFORM_HEALTH_MODULE_KEY, normalized.activeMetricIds)
    return normalized
  } catch {
    const localIds = readLocalDashboardMetricIds(PLATFORM_HEALTH_MODULE_KEY)
    if (localIds) {
      return buildPlatformHealthPreferences(localIds, false)
    }
    return buildPlatformHealthPreferences(DEFAULT_PLATFORM_HEALTH_METRIC_IDS, true)
  }
}

export async function savePlatformHealthDashboardMetricPreferences(
  activeMetricIds: string[],
): Promise<DashboardMetricPreferences> {
  const normalizedIds = buildPlatformHealthPreferences(activeMetricIds, false).activeMetricIds
  writeLocalDashboardMetricIds(PLATFORM_HEALTH_MODULE_KEY, normalizedIds)

  try {
    const data = await saveDashboardMetricPreferences(PLATFORM_HEALTH_MODULE_KEY, normalizedIds)
    return buildPlatformHealthPreferences(
      data.activeMetricIds?.length ? data.activeMetricIds : normalizedIds,
      false,
    )
  } catch {
    return buildPlatformHealthPreferences(normalizedIds, false)
  }
}

export async function resetPlatformHealthDashboardMetricPreferences(): Promise<DashboardMetricPreferences> {
  clearLocalDashboardMetricIds(PLATFORM_HEALTH_MODULE_KEY)

  try {
    await resetDashboardMetricPreferences(PLATFORM_HEALTH_MODULE_KEY)
  } catch {
    // Local reset is enough when API is unavailable.
  }

  return buildPlatformHealthPreferences(DEFAULT_PLATFORM_HEALTH_METRIC_IDS, true)
}
