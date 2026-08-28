import {
  DEFAULT_SUPPORT_DASHBOARD_METRIC_IDS,
  SUPPORT_DASHBOARD_LEGACY_METRIC_ID_MAP,
  SUPPORT_DASHBOARD_METRICS_CATALOG,
  SUPPORT_DASHBOARD_METRIC_IDS,
  SUPPORT_DASHBOARD_MODULE_KEY,
} from '@/modules/support-management/config/support-dashboard-metrics.config'
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

function buildSupportDashboardPreferences(
  activeMetricIds: string[],
  isDefault: boolean,
): DashboardMetricPreferences {
  const catalogIdSet = new Set(SUPPORT_DASHBOARD_METRICS_CATALOG.map((metric) => metric.id))
  const filteredIds = sortIdsByCatalogOrder(
    [
      ...new Set(activeMetricIds.map((id) => SUPPORT_DASHBOARD_LEGACY_METRIC_ID_MAP[id] ?? id)),
    ].filter((id) => catalogIdSet.has(id)),
    SUPPORT_DASHBOARD_METRIC_IDS,
  )

  return {
    moduleKey: SUPPORT_DASHBOARD_MODULE_KEY,
    catalog: SUPPORT_DASHBOARD_METRICS_CATALOG.map((metric) => ({
      id: metric.id,
      label: metric.label,
      type: metric.type,
      description: metric.description,
      defaultActive: metric.defaultActive,
    })),
    activeMetricIds:
      filteredIds.length > 0 ? filteredIds : [...DEFAULT_SUPPORT_DASHBOARD_METRIC_IDS],
    isDefault,
  }
}

export async function fetchSupportDashboardMetricPreferences(): Promise<DashboardMetricPreferences> {
  try {
    const data = await fetchDashboardMetricPreferences(SUPPORT_DASHBOARD_MODULE_KEY)
    const normalized = buildSupportDashboardPreferences(
      data.activeMetricIds?.length ? data.activeMetricIds : DEFAULT_SUPPORT_DASHBOARD_METRIC_IDS,
      data.isDefault,
    )
    writeLocalDashboardMetricIds(SUPPORT_DASHBOARD_MODULE_KEY, normalized.activeMetricIds)
    return normalized
  } catch {
    const localIds = readLocalDashboardMetricIds(SUPPORT_DASHBOARD_MODULE_KEY)
    if (localIds) {
      return buildSupportDashboardPreferences(localIds, false)
    }
    return buildSupportDashboardPreferences(DEFAULT_SUPPORT_DASHBOARD_METRIC_IDS, true)
  }
}

export async function saveSupportDashboardMetricPreferences(
  activeMetricIds: string[],
): Promise<DashboardMetricPreferences> {
  const normalizedIds = buildSupportDashboardPreferences(activeMetricIds, false).activeMetricIds
  writeLocalDashboardMetricIds(SUPPORT_DASHBOARD_MODULE_KEY, normalizedIds)

  try {
    const data = await saveDashboardMetricPreferences(SUPPORT_DASHBOARD_MODULE_KEY, normalizedIds)
    return buildSupportDashboardPreferences(
      data.activeMetricIds?.length ? data.activeMetricIds : normalizedIds,
      false,
    )
  } catch {
    return buildSupportDashboardPreferences(normalizedIds, false)
  }
}

export async function resetSupportDashboardMetricPreferences(): Promise<DashboardMetricPreferences> {
  clearLocalDashboardMetricIds(SUPPORT_DASHBOARD_MODULE_KEY)

  try {
    await resetDashboardMetricPreferences(SUPPORT_DASHBOARD_MODULE_KEY)
  } catch {
    // Local reset is enough when API is unavailable.
  }

  return buildSupportDashboardPreferences(DEFAULT_SUPPORT_DASHBOARD_METRIC_IDS, true)
}
