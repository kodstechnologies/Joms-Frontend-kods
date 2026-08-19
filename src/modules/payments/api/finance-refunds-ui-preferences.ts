import {
  DEFAULT_FINANCE_REFUNDS_METRIC_IDS,
  FINANCE_REFUNDS_METRICS_CATALOG,
  FINANCE_REFUNDS_METRIC_IDS,
  FINANCE_REFUNDS_MODULE_KEY,
} from '@/modules/payments/config/finance-refunds-metrics.config'
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

function buildFinanceRefundsPreferences(
  activeMetricIds: string[],
  isDefault: boolean,
): DashboardMetricPreferences {
  const catalogIdSet = new Set(FINANCE_REFUNDS_METRICS_CATALOG.map((metric) => metric.id))
  const filteredIds = sortIdsByCatalogOrder(
    activeMetricIds.filter((id) => catalogIdSet.has(id)),
    FINANCE_REFUNDS_METRIC_IDS,
  )

  return {
    moduleKey: FINANCE_REFUNDS_MODULE_KEY,
    catalog: FINANCE_REFUNDS_METRICS_CATALOG.map((metric) => ({
      id: metric.id,
      label: metric.label,
      type: metric.type,
      description: metric.description,
      defaultActive: metric.defaultActive,
    })),
    activeMetricIds: filteredIds.length > 0 ? filteredIds : [...DEFAULT_FINANCE_REFUNDS_METRIC_IDS],
    isDefault,
  }
}

export async function fetchFinanceRefundsDashboardMetricPreferences(): Promise<DashboardMetricPreferences> {
  try {
    const data = await fetchDashboardMetricPreferences(FINANCE_REFUNDS_MODULE_KEY)
    const normalized = buildFinanceRefundsPreferences(
      data.activeMetricIds?.length ? data.activeMetricIds : DEFAULT_FINANCE_REFUNDS_METRIC_IDS,
      data.isDefault,
    )
    writeLocalDashboardMetricIds(FINANCE_REFUNDS_MODULE_KEY, normalized.activeMetricIds)
    return normalized
  } catch {
    const localIds = readLocalDashboardMetricIds(FINANCE_REFUNDS_MODULE_KEY)
    if (localIds) {
      return buildFinanceRefundsPreferences(localIds, false)
    }
    return buildFinanceRefundsPreferences(DEFAULT_FINANCE_REFUNDS_METRIC_IDS, true)
  }
}

export async function saveFinanceRefundsDashboardMetricPreferences(
  activeMetricIds: string[],
): Promise<DashboardMetricPreferences> {
  const normalizedIds = buildFinanceRefundsPreferences(activeMetricIds, false).activeMetricIds
  writeLocalDashboardMetricIds(FINANCE_REFUNDS_MODULE_KEY, normalizedIds)

  try {
    const data = await saveDashboardMetricPreferences(FINANCE_REFUNDS_MODULE_KEY, normalizedIds)
    return buildFinanceRefundsPreferences(
      data.activeMetricIds?.length ? data.activeMetricIds : normalizedIds,
      false,
    )
  } catch {
    return buildFinanceRefundsPreferences(normalizedIds, false)
  }
}

export async function resetFinanceRefundsDashboardMetricPreferences(): Promise<DashboardMetricPreferences> {
  clearLocalDashboardMetricIds(FINANCE_REFUNDS_MODULE_KEY)

  try {
    await resetDashboardMetricPreferences(FINANCE_REFUNDS_MODULE_KEY)
  } catch {
    // Local reset is enough when API is unavailable.
  }

  return buildFinanceRefundsPreferences(DEFAULT_FINANCE_REFUNDS_METRIC_IDS, true)
}
