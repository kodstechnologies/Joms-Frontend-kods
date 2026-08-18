import {
  DEFAULT_TICKET_MANAGEMENT_METRIC_IDS,
  TICKET_MANAGEMENT_METRICS_CATALOG,
  TICKET_MANAGEMENT_METRIC_IDS,
  TICKET_MANAGEMENT_MODULE_KEY,
} from '@/modules/support-management/config/ticket-management-metrics.config'
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

function buildTicketManagementPreferences(
  activeMetricIds: string[],
  isDefault: boolean,
): DashboardMetricPreferences {
  const catalogIdSet = new Set(TICKET_MANAGEMENT_METRICS_CATALOG.map((metric) => metric.id))
  const filteredIds = sortIdsByCatalogOrder(
    activeMetricIds.filter((id) => catalogIdSet.has(id)),
    TICKET_MANAGEMENT_METRIC_IDS,
  )

  return {
    moduleKey: TICKET_MANAGEMENT_MODULE_KEY,
    catalog: TICKET_MANAGEMENT_METRICS_CATALOG.map((metric) => ({
      id: metric.id,
      label: metric.label,
      type: metric.type,
      description: metric.description,
      defaultActive: metric.defaultActive,
    })),
    activeMetricIds:
      filteredIds.length > 0 ? filteredIds : [...DEFAULT_TICKET_MANAGEMENT_METRIC_IDS],
    isDefault,
  }
}

export async function fetchTicketManagementDashboardMetricPreferences(): Promise<DashboardMetricPreferences> {
  try {
    const data = await fetchDashboardMetricPreferences(TICKET_MANAGEMENT_MODULE_KEY)
    const normalized = buildTicketManagementPreferences(
      data.activeMetricIds?.length ? data.activeMetricIds : DEFAULT_TICKET_MANAGEMENT_METRIC_IDS,
      data.isDefault,
    )
    writeLocalDashboardMetricIds(TICKET_MANAGEMENT_MODULE_KEY, normalized.activeMetricIds)
    return normalized
  } catch {
    const localIds = readLocalDashboardMetricIds(TICKET_MANAGEMENT_MODULE_KEY)
    if (localIds) {
      return buildTicketManagementPreferences(localIds, false)
    }
    return buildTicketManagementPreferences(DEFAULT_TICKET_MANAGEMENT_METRIC_IDS, true)
  }
}

export async function saveTicketManagementDashboardMetricPreferences(
  activeMetricIds: string[],
): Promise<DashboardMetricPreferences> {
  const normalizedIds = buildTicketManagementPreferences(activeMetricIds, false).activeMetricIds
  writeLocalDashboardMetricIds(TICKET_MANAGEMENT_MODULE_KEY, normalizedIds)

  try {
    const data = await saveDashboardMetricPreferences(TICKET_MANAGEMENT_MODULE_KEY, normalizedIds)
    return buildTicketManagementPreferences(
      data.activeMetricIds?.length ? data.activeMetricIds : normalizedIds,
      false,
    )
  } catch {
    return buildTicketManagementPreferences(normalizedIds, false)
  }
}

export async function resetTicketManagementDashboardMetricPreferences(): Promise<DashboardMetricPreferences> {
  clearLocalDashboardMetricIds(TICKET_MANAGEMENT_MODULE_KEY)

  try {
    await resetDashboardMetricPreferences(TICKET_MANAGEMENT_MODULE_KEY)
  } catch {
    // Local reset is enough when API is unavailable.
  }

  return buildTicketManagementPreferences(DEFAULT_TICKET_MANAGEMENT_METRIC_IDS, true)
}
