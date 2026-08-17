import {
  DEFAULT_MEMBERSHIP_METRIC_IDS,
  MEMBERSHIP_METRICS_CATALOG,
  MEMBERSHIP_METRIC_IDS,
  MEMBERSHIPS_MODULE_KEY,
} from '@/modules/memberships/config/membership-metrics.config'
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

function buildMembershipPreferences(
  activeMetricIds: string[],
  isDefault: boolean,
): DashboardMetricPreferences {
  const catalogIdSet = new Set(MEMBERSHIP_METRICS_CATALOG.map((metric) => metric.id))
  const filteredIds = sortIdsByCatalogOrder(
    activeMetricIds.filter((id) => catalogIdSet.has(id)),
    MEMBERSHIP_METRIC_IDS,
  )

  return {
    moduleKey: MEMBERSHIPS_MODULE_KEY,
    catalog: MEMBERSHIP_METRICS_CATALOG.map((metric) => ({
      id: metric.id,
      label: metric.label,
      type: metric.type,
      description: metric.description,
      defaultActive: metric.defaultActive,
    })),
    activeMetricIds: filteredIds.length > 0 ? filteredIds : [...DEFAULT_MEMBERSHIP_METRIC_IDS],
    isDefault,
  }
}

export async function fetchMembershipDashboardMetricPreferences(): Promise<DashboardMetricPreferences> {
  try {
    const data = await fetchDashboardMetricPreferences(MEMBERSHIPS_MODULE_KEY)
    const normalized = buildMembershipPreferences(
      data.activeMetricIds?.length ? data.activeMetricIds : DEFAULT_MEMBERSHIP_METRIC_IDS,
      data.isDefault,
    )
    writeLocalDashboardMetricIds(MEMBERSHIPS_MODULE_KEY, normalized.activeMetricIds)
    return normalized
  } catch {
    const localIds = readLocalDashboardMetricIds(MEMBERSHIPS_MODULE_KEY)
    if (localIds) {
      return buildMembershipPreferences(localIds, false)
    }
    return buildMembershipPreferences(DEFAULT_MEMBERSHIP_METRIC_IDS, true)
  }
}

export async function saveMembershipDashboardMetricPreferences(
  activeMetricIds: string[],
): Promise<DashboardMetricPreferences> {
  const normalizedIds = buildMembershipPreferences(activeMetricIds, false).activeMetricIds
  writeLocalDashboardMetricIds(MEMBERSHIPS_MODULE_KEY, normalizedIds)

  try {
    const data = await saveDashboardMetricPreferences(MEMBERSHIPS_MODULE_KEY, normalizedIds)
    return buildMembershipPreferences(
      data.activeMetricIds?.length ? data.activeMetricIds : normalizedIds,
      false,
    )
  } catch {
    return buildMembershipPreferences(normalizedIds, false)
  }
}

export async function resetMembershipDashboardMetricPreferences(): Promise<DashboardMetricPreferences> {
  clearLocalDashboardMetricIds(MEMBERSHIPS_MODULE_KEY)

  try {
    await resetDashboardMetricPreferences(MEMBERSHIPS_MODULE_KEY)
  } catch {
    // Local reset is enough when API is unavailable.
  }

  return buildMembershipPreferences(DEFAULT_MEMBERSHIP_METRIC_IDS, true)
}
