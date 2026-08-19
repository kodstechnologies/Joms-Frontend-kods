import {
  DEFAULT_EXECUTIVE_METRIC_IDS,
  EXECUTIVE_OVERVIEW_METRICS_CATALOG,
  EXECUTIVE_OVERVIEW_METRIC_IDS,
  EXECUTIVE_OVERVIEW_MODULE_KEY,
} from '@/modules/dashboard/config/executive-overview-metrics.config'
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

function buildExecutivePreferences(
  activeMetricIds: string[],
  isDefault: boolean,
): DashboardMetricPreferences {
  const catalogIdSet = new Set(EXECUTIVE_OVERVIEW_METRICS_CATALOG.map((metric) => metric.id))
  const filteredIds = sortIdsByCatalogOrder(
    activeMetricIds.filter((id) => catalogIdSet.has(id)),
    EXECUTIVE_OVERVIEW_METRIC_IDS,
  )

  return {
    moduleKey: EXECUTIVE_OVERVIEW_MODULE_KEY,
    catalog: EXECUTIVE_OVERVIEW_METRICS_CATALOG.map((metric) => ({
      id: metric.id,
      label: metric.label,
      type: metric.type,
      description: metric.description,
      defaultActive: metric.defaultActive,
    })),
    activeMetricIds: filteredIds.length > 0 ? filteredIds : [...DEFAULT_EXECUTIVE_METRIC_IDS],
    isDefault,
  }
}

export async function fetchExecutiveDashboardMetricPreferences(): Promise<DashboardMetricPreferences> {
  try {
    const data = await fetchDashboardMetricPreferences(EXECUTIVE_OVERVIEW_MODULE_KEY)
    const normalized = buildExecutivePreferences(
      data.activeMetricIds?.length ? data.activeMetricIds : DEFAULT_EXECUTIVE_METRIC_IDS,
      data.isDefault,
    )
    writeLocalDashboardMetricIds(EXECUTIVE_OVERVIEW_MODULE_KEY, normalized.activeMetricIds)
    return normalized
  } catch {
    const localIds = readLocalDashboardMetricIds(EXECUTIVE_OVERVIEW_MODULE_KEY)
    if (localIds) {
      return buildExecutivePreferences(localIds, false)
    }
    return buildExecutivePreferences(DEFAULT_EXECUTIVE_METRIC_IDS, true)
  }
}

export async function saveExecutiveDashboardMetricPreferences(
  activeMetricIds: string[],
): Promise<DashboardMetricPreferences> {
  const normalizedIds = buildExecutivePreferences(activeMetricIds, false).activeMetricIds
  writeLocalDashboardMetricIds(EXECUTIVE_OVERVIEW_MODULE_KEY, normalizedIds)

  try {
    const data = await saveDashboardMetricPreferences(EXECUTIVE_OVERVIEW_MODULE_KEY, normalizedIds)
    return buildExecutivePreferences(
      data.activeMetricIds?.length ? data.activeMetricIds : normalizedIds,
      false,
    )
  } catch {
    return buildExecutivePreferences(normalizedIds, false)
  }
}

export async function resetExecutiveDashboardMetricPreferences(): Promise<DashboardMetricPreferences> {
  clearLocalDashboardMetricIds(EXECUTIVE_OVERVIEW_MODULE_KEY)

  try {
    await resetDashboardMetricPreferences(EXECUTIVE_OVERVIEW_MODULE_KEY)
  } catch {
    // Local reset is enough when API is unavailable.
  }

  return buildExecutivePreferences(DEFAULT_EXECUTIVE_METRIC_IDS, true)
}
