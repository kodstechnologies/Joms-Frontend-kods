import {
  DEFAULT_FINANCE_DASHBOARD_METRIC_IDS,
  FINANCE_DASHBOARD_METRICS_CATALOG,
  FINANCE_DASHBOARD_METRIC_IDS,
  FINANCE_DASHBOARD_MODULE_KEY,
} from '@/modules/payments/config/finance-dashboard-metrics.config'
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

function buildFinanceDashboardPreferences(
  activeMetricIds: string[],
  isDefault: boolean,
): DashboardMetricPreferences {
  const catalogIdSet = new Set(FINANCE_DASHBOARD_METRICS_CATALOG.map((metric) => metric.id))
  const filteredIds = sortIdsByCatalogOrder(
    activeMetricIds.filter((id) => catalogIdSet.has(id)),
    FINANCE_DASHBOARD_METRIC_IDS,
  )

  return {
    moduleKey: FINANCE_DASHBOARD_MODULE_KEY,
    catalog: FINANCE_DASHBOARD_METRICS_CATALOG.map((metric) => ({
      id: metric.id,
      label: metric.label,
      type: metric.type,
      description: metric.description,
      defaultActive: metric.defaultActive,
    })),
    activeMetricIds:
      filteredIds.length > 0 ? filteredIds : [...DEFAULT_FINANCE_DASHBOARD_METRIC_IDS],
    isDefault,
  }
}

export async function fetchFinanceDashboardMetricPreferences(): Promise<DashboardMetricPreferences> {
  try {
    const data = await fetchDashboardMetricPreferences(FINANCE_DASHBOARD_MODULE_KEY)
    const normalized = buildFinanceDashboardPreferences(
      data.activeMetricIds?.length ? data.activeMetricIds : DEFAULT_FINANCE_DASHBOARD_METRIC_IDS,
      data.isDefault,
    )
    writeLocalDashboardMetricIds(FINANCE_DASHBOARD_MODULE_KEY, normalized.activeMetricIds)
    return normalized
  } catch {
    const localIds = readLocalDashboardMetricIds(FINANCE_DASHBOARD_MODULE_KEY)
    if (localIds) {
      return buildFinanceDashboardPreferences(localIds, false)
    }
    return buildFinanceDashboardPreferences(DEFAULT_FINANCE_DASHBOARD_METRIC_IDS, true)
  }
}

export async function saveFinanceDashboardMetricPreferences(
  activeMetricIds: string[],
): Promise<DashboardMetricPreferences> {
  const normalizedIds = buildFinanceDashboardPreferences(activeMetricIds, false).activeMetricIds
  writeLocalDashboardMetricIds(FINANCE_DASHBOARD_MODULE_KEY, normalizedIds)

  try {
    const data = await saveDashboardMetricPreferences(FINANCE_DASHBOARD_MODULE_KEY, normalizedIds)
    return buildFinanceDashboardPreferences(
      data.activeMetricIds?.length ? data.activeMetricIds : normalizedIds,
      false,
    )
  } catch {
    return buildFinanceDashboardPreferences(normalizedIds, false)
  }
}

export async function resetFinanceDashboardMetricPreferences(): Promise<DashboardMetricPreferences> {
  clearLocalDashboardMetricIds(FINANCE_DASHBOARD_MODULE_KEY)

  try {
    await resetDashboardMetricPreferences(FINANCE_DASHBOARD_MODULE_KEY)
  } catch {
    // Local reset is enough when API is unavailable.
  }

  return buildFinanceDashboardPreferences(DEFAULT_FINANCE_DASHBOARD_METRIC_IDS, true)
}
