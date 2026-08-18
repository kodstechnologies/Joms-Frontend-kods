import {
  DEFAULT_RBAC_HUB_METRIC_IDS,
  RBAC_HUB_METRICS_CATALOG,
  RBAC_HUB_METRIC_IDS,
  RBAC_HUB_MODULE_KEY,
} from '@/modules/rbac/config/rbac-metrics.config'
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

function buildRbacHubPreferences(
  activeMetricIds: string[],
  isDefault: boolean,
): DashboardMetricPreferences {
  const catalogIdSet = new Set(RBAC_HUB_METRICS_CATALOG.map((metric) => metric.id))
  const filteredIds = sortIdsByCatalogOrder(
    activeMetricIds.filter((id) => catalogIdSet.has(id)),
    RBAC_HUB_METRIC_IDS,
  )

  return {
    moduleKey: RBAC_HUB_MODULE_KEY,
    catalog: RBAC_HUB_METRICS_CATALOG.map((metric) => ({
      id: metric.id,
      label: metric.label,
      type: metric.type,
      description: metric.description,
      defaultActive: metric.defaultActive,
    })),
    activeMetricIds: filteredIds.length > 0 ? filteredIds : [...DEFAULT_RBAC_HUB_METRIC_IDS],
    isDefault,
  }
}

export async function fetchRbacHubDashboardMetricPreferences(): Promise<DashboardMetricPreferences> {
  try {
    const data = await fetchDashboardMetricPreferences(RBAC_HUB_MODULE_KEY)
    const normalized = buildRbacHubPreferences(
      data.activeMetricIds?.length ? data.activeMetricIds : DEFAULT_RBAC_HUB_METRIC_IDS,
      data.isDefault,
    )
    writeLocalDashboardMetricIds(RBAC_HUB_MODULE_KEY, normalized.activeMetricIds)
    return normalized
  } catch {
    const localIds = readLocalDashboardMetricIds(RBAC_HUB_MODULE_KEY)
    if (localIds) {
      return buildRbacHubPreferences(localIds, false)
    }
    return buildRbacHubPreferences(DEFAULT_RBAC_HUB_METRIC_IDS, true)
  }
}

export async function saveRbacHubDashboardMetricPreferences(
  activeMetricIds: string[],
): Promise<DashboardMetricPreferences> {
  const normalizedIds = buildRbacHubPreferences(activeMetricIds, false).activeMetricIds
  writeLocalDashboardMetricIds(RBAC_HUB_MODULE_KEY, normalizedIds)

  try {
    const data = await saveDashboardMetricPreferences(RBAC_HUB_MODULE_KEY, normalizedIds)
    return buildRbacHubPreferences(
      data.activeMetricIds?.length ? data.activeMetricIds : normalizedIds,
      false,
    )
  } catch {
    return buildRbacHubPreferences(normalizedIds, false)
  }
}

export async function resetRbacHubDashboardMetricPreferences(): Promise<DashboardMetricPreferences> {
  clearLocalDashboardMetricIds(RBAC_HUB_MODULE_KEY)

  try {
    await resetDashboardMetricPreferences(RBAC_HUB_MODULE_KEY)
  } catch {
    // Local reset is enough when API is unavailable.
  }

  return buildRbacHubPreferences(DEFAULT_RBAC_HUB_METRIC_IDS, true)
}
