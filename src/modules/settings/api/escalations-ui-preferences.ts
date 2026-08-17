import {
  DEFAULT_ESCALATIONS_METRIC_IDS,
  ESCALATIONS_METRICS_CATALOG,
  ESCALATIONS_METRIC_IDS,
  ESCALATIONS_MODULE_KEY,
} from '@/modules/settings/config/escalations-metrics.config'
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

function buildEscalationsPreferences(
  activeMetricIds: string[],
  isDefault: boolean,
): DashboardMetricPreferences {
  const catalogIdSet = new Set(ESCALATIONS_METRICS_CATALOG.map((metric) => metric.id))
  const filteredIds = sortIdsByCatalogOrder(
    activeMetricIds.filter((id) => catalogIdSet.has(id)),
    ESCALATIONS_METRIC_IDS,
  )

  return {
    moduleKey: ESCALATIONS_MODULE_KEY,
    catalog: ESCALATIONS_METRICS_CATALOG.map((metric) => ({
      id: metric.id,
      label: metric.label,
      type: metric.type,
      description: metric.description,
      defaultActive: metric.defaultActive,
    })),
    activeMetricIds: filteredIds.length > 0 ? filteredIds : [...DEFAULT_ESCALATIONS_METRIC_IDS],
    isDefault,
  }
}

export async function fetchEscalationsDashboardMetricPreferences(): Promise<DashboardMetricPreferences> {
  try {
    const data = await fetchDashboardMetricPreferences(ESCALATIONS_MODULE_KEY)
    const normalized = buildEscalationsPreferences(
      data.activeMetricIds?.length ? data.activeMetricIds : DEFAULT_ESCALATIONS_METRIC_IDS,
      data.isDefault,
    )
    writeLocalDashboardMetricIds(ESCALATIONS_MODULE_KEY, normalized.activeMetricIds)
    return normalized
  } catch {
    const localIds = readLocalDashboardMetricIds(ESCALATIONS_MODULE_KEY)
    if (localIds) {
      return buildEscalationsPreferences(localIds, false)
    }
    return buildEscalationsPreferences(DEFAULT_ESCALATIONS_METRIC_IDS, true)
  }
}

export async function saveEscalationsDashboardMetricPreferences(
  activeMetricIds: string[],
): Promise<DashboardMetricPreferences> {
  const normalizedIds = buildEscalationsPreferences(activeMetricIds, false).activeMetricIds
  writeLocalDashboardMetricIds(ESCALATIONS_MODULE_KEY, normalizedIds)

  try {
    const data = await saveDashboardMetricPreferences(ESCALATIONS_MODULE_KEY, normalizedIds)
    return buildEscalationsPreferences(
      data.activeMetricIds?.length ? data.activeMetricIds : normalizedIds,
      false,
    )
  } catch {
    return buildEscalationsPreferences(normalizedIds, false)
  }
}

export async function resetEscalationsDashboardMetricPreferences(): Promise<DashboardMetricPreferences> {
  clearLocalDashboardMetricIds(ESCALATIONS_MODULE_KEY)

  try {
    await resetDashboardMetricPreferences(ESCALATIONS_MODULE_KEY)
  } catch {
    // Local reset is enough when API is unavailable.
  }

  return buildEscalationsPreferences(DEFAULT_ESCALATIONS_METRIC_IDS, true)
}
