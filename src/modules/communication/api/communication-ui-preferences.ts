import {
  COMMUNICATION_METRICS_CATALOG,
  COMMUNICATION_METRIC_IDS,
  COMMUNICATION_MODULE_KEY,
  DEFAULT_COMMUNICATION_METRIC_IDS,
} from '@/modules/communication/config/communication-metrics.config'
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

function buildCommunicationPreferences(
  activeMetricIds: string[],
  isDefault: boolean,
): DashboardMetricPreferences {
  const catalogIdSet = new Set(COMMUNICATION_METRICS_CATALOG.map((metric) => metric.id))
  const filteredIds = sortIdsByCatalogOrder(
    activeMetricIds.filter((id) => catalogIdSet.has(id)),
    COMMUNICATION_METRIC_IDS,
  )

  return {
    moduleKey: COMMUNICATION_MODULE_KEY,
    catalog: COMMUNICATION_METRICS_CATALOG.map((metric) => ({
      id: metric.id,
      label: metric.label,
      type: metric.type,
      description: metric.description,
      defaultActive: metric.defaultActive,
    })),
    activeMetricIds: filteredIds.length > 0 ? filteredIds : [...DEFAULT_COMMUNICATION_METRIC_IDS],
    isDefault,
  }
}

export async function fetchCommunicationDashboardMetricPreferences(): Promise<DashboardMetricPreferences> {
  try {
    const data = await fetchDashboardMetricPreferences(COMMUNICATION_MODULE_KEY)
    const normalized = buildCommunicationPreferences(
      data.activeMetricIds?.length ? data.activeMetricIds : DEFAULT_COMMUNICATION_METRIC_IDS,
      data.isDefault,
    )
    writeLocalDashboardMetricIds(COMMUNICATION_MODULE_KEY, normalized.activeMetricIds)
    return normalized
  } catch {
    const localIds = readLocalDashboardMetricIds(COMMUNICATION_MODULE_KEY)
    if (localIds) {
      return buildCommunicationPreferences(localIds, false)
    }
    return buildCommunicationPreferences(DEFAULT_COMMUNICATION_METRIC_IDS, true)
  }
}

export async function saveCommunicationDashboardMetricPreferences(
  activeMetricIds: string[],
): Promise<DashboardMetricPreferences> {
  const normalizedIds = buildCommunicationPreferences(activeMetricIds, false).activeMetricIds
  writeLocalDashboardMetricIds(COMMUNICATION_MODULE_KEY, normalizedIds)

  try {
    const data = await saveDashboardMetricPreferences(COMMUNICATION_MODULE_KEY, normalizedIds)
    return buildCommunicationPreferences(
      data.activeMetricIds?.length ? data.activeMetricIds : normalizedIds,
      false,
    )
  } catch {
    return buildCommunicationPreferences(normalizedIds, false)
  }
}

export async function resetCommunicationDashboardMetricPreferences(): Promise<DashboardMetricPreferences> {
  clearLocalDashboardMetricIds(COMMUNICATION_MODULE_KEY)

  try {
    await resetDashboardMetricPreferences(COMMUNICATION_MODULE_KEY)
  } catch {
    // Local reset is enough when API is unavailable.
  }

  return buildCommunicationPreferences(DEFAULT_COMMUNICATION_METRIC_IDS, true)
}
